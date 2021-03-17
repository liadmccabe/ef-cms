const {
  applicationContext,
  fakeData,
} = require('../test/createTestApplicationContext');
const {
  COUNTRY_TYPES,
  PARTY_TYPES,
  ROLES,
} = require('../entities/EntityConstants');
const {
  updateSecondaryContactInteractor,
} = require('./updateSecondaryContactInteractor');
const { getContactPrimary } = require('../entities/cases/Case');
const { MOCK_CASE } = require('../../test/mockCase');
const { User } = require('../entities/User');

describe('updateSecondaryContactInteractor', () => {
  const mockContactSecondary = {
    address1: 'nothing',
    city: 'Somewhere',
    contactId: '988e7470-fb47-4014-bda6-bf3ed87a20b8',
    countryType: COUNTRY_TYPES.DOMESTIC,
    email: 'secondary@example.com',
    name: 'Secondary Party',
    phone: '9876543210',
    postalCode: '12345',
    state: 'TN',
  };

  let mockCase = {
    ...MOCK_CASE,
    contactSecondary: mockContactSecondary,
    partyType: PARTY_TYPES.petitionerSpouse,
  };

  let mockUser;

  beforeEach(() => {
    mockUser = new User({
      name: 'bob',
      role: ROLES.petitioner,
      userId: getContactPrimary(MOCK_CASE).contactId,
    });

    applicationContext
      .getPersistenceGateway()
      .getCaseByDocketNumber.mockImplementation(() => mockCase);

    applicationContext
      .getChromiumBrowser()
      .newPage()
      .pdf.mockReturnValue(fakeData);

    applicationContext
      .getUseCases()
      .generatePdfFromHtmlInteractor.mockReturnValue(fakeData);

    applicationContext.getCurrentUser.mockImplementation(() => mockUser);

    applicationContext.getUtilities().getAddressPhoneDiff.mockReturnValue({
      address1: {
        newData: 'new test',
        oldData: 'test',
      },
    });

    applicationContext
      .getUtilities()
      .getDocumentTypeForAddressChange.mockReturnValue({
        eventCode: 'NCA',
        title: 'Notice of Change of Address',
      });
  });

  it('should update contactSecondary editable fields', async () => {
    const mockNumberOfPages = 999;
    applicationContext
      .getUseCaseHelpers()
      .countPagesInDocument.mockReturnValue(mockNumberOfPages);

    const caseDetail = await updateSecondaryContactInteractor(
      applicationContext,
      {
        contactInfo: {
          address1: '453 Electric Ave',
          city: 'Philadelphia',
          countryType: COUNTRY_TYPES.DOMESTIC,
          email: 'secondary@example.com',
          name: 'New Secondary',
          phone: '1234567890',
          postalCode: '99999',
          state: 'PA',
        },
        docketNumber: MOCK_CASE.docketNumber,
      },
    );

    const updatedCase = applicationContext.getPersistenceGateway().updateCase
      .mock.calls[0][0].caseToUpdate;
    const changeOfAddressDocument = updatedCase.docketEntries.find(
      d => d.documentType === 'Notice of Change of Address',
    );
    expect(updatedCase.contactSecondary).toMatchObject({
      address1: '453 Electric Ave',
      city: 'Philadelphia',
      countryType: COUNTRY_TYPES.DOMESTIC,
      email: mockContactSecondary.email,
      name: mockContactSecondary.name,
      phone: '1234567890',
      postalCode: '99999',
      state: 'PA',
    });
    expect(
      applicationContext.getUseCaseHelpers().countPagesInDocument,
    ).toHaveBeenCalled();

    expect(changeOfAddressDocument).toMatchObject({
      isAutoGenerated: true,
      isFileAttached: true,
      numberOfPages: 999,
    });
    expect(
      applicationContext.getDocumentGenerators().changeOfAddress,
    ).toHaveBeenCalled();
    expect(caseDetail.docketEntries[4].servedAt).toBeDefined();
    expect(caseDetail.docketEntries[4].filedBy).toBeUndefined();
  });

  it('creates a work item if the secondary contact is not represented by a privatePractitioner', async () => {
    await updateSecondaryContactInteractor(applicationContext, {
      contactInfo: {
        address1: '453 Electric Ave',
        city: 'Philadelphia',
        countryType: COUNTRY_TYPES.DOMESTIC,
        email: 'secondary@example.com',
        name: 'New Secondary',
        phone: '1234567890',
        postalCode: '99999',
        state: 'PA',
      },
      docketNumber: MOCK_CASE.docketNumber,
    });

    expect(
      applicationContext.getPersistenceGateway()
        .saveWorkItemAndAddToSectionInbox,
    ).toBeCalled();
  });

  it('does not create a work item if the secondary contact is represented by a privatePractitioner', async () => {
    applicationContext
      .getPersistenceGateway()
      .getCaseByDocketNumber.mockReturnValue({
        ...mockCase,
        privatePractitioners: [
          {
            barNumber: '1111',
            name: 'Bob Practitioner',
            representing: [mockCase.contactSecondary.contactId],
            role: ROLES.privatePractitioner,
            userId: '5b992eca-8573-44ff-a33a-7796ba0f201c',
          },
        ],
      });

    await updateSecondaryContactInteractor(applicationContext, {
      contactInfo: {
        address1: '453 Electric Ave',
        city: 'Philadelphia',
        countryType: COUNTRY_TYPES.DOMESTIC,
        email: 'secondary@example.com',
        name: 'New Secondary',
        phone: '1234567890',
        postalCode: '99999',
        state: 'PA',
      },
      docketNumber: MOCK_CASE.docketNumber,
    });

    expect(
      applicationContext.getPersistenceGateway()
        .saveWorkItemAndAddToSectionInbox,
    ).not.toBeCalled();
  });

  it('throws an error if the case was not found', async () => {
    applicationContext
      .getPersistenceGateway()
      .getCaseByDocketNumber.mockReturnValue(null);

    await expect(
      updateSecondaryContactInteractor(applicationContext, {
        contactInfo: {},
        docketNumber: MOCK_CASE.docketNumber,
      }),
    ).rejects.toThrow('Case 101-18 was not found.');
  });

  it('throws an error if the user making the request is not associated with the case', async () => {
    mockUser = {
      ...mockUser,
      userId: 'de300c01-f6ff-4843-a72f-ee7cd2521237',
    };

    await expect(
      updateSecondaryContactInteractor(applicationContext, {
        contactInfo: {},
        docketNumber: MOCK_CASE.docketNumber,
      }),
    ).rejects.toThrow('Unauthorized for update case contact');
  });

  it('does not update the case if the contact information does not change', async () => {
    applicationContext
      .getUtilities()
      .getDocumentTypeForAddressChange.mockReturnValue(undefined);
    applicationContext.getUtilities().getAddressPhoneDiff.mockReturnValue({});

    await updateSecondaryContactInteractor(applicationContext, {
      contactInfo: {
        // Matches current contact info
        address1: 'nothing',
        city: 'Somewhere',
        countryType: COUNTRY_TYPES.DOMESTIC,
        email: 'secondary@example.com',
        name: 'Secondary Party',
        phone: '9876543210',
        postalCode: '12345',
        state: 'TN',
      },
      docketNumber: MOCK_CASE.docketNumber,
    });

    expect(
      applicationContext.getPersistenceGateway().updateCase,
    ).not.toHaveBeenCalled();
    expect(
      applicationContext.getDocumentGenerators().changeOfAddress,
    ).not.toHaveBeenCalled();
  });

  it('does not update the contact secondary email or name', async () => {
    mockCase = {
      ...MOCK_CASE,
      contactSecondary: mockContactSecondary,
      partyType: PARTY_TYPES.petitionerSpouse,
    };
    applicationContext
      .getUtilities()
      .getDocumentTypeForAddressChange.mockReturnValue(undefined);

    const caseDetail = await updateSecondaryContactInteractor(
      applicationContext,
      {
        contactInfo: {
          address1: 'nothing',
          city: 'Somewhere',
          countryType: COUNTRY_TYPES.DOMESTIC,
          email: 'hello123@example.com',
          name: 'Secondary Party Name Changed',
          phone: '9876543210',
          postalCode: '12345',
          state: 'TN',
        },
        docketNumber: MOCK_CASE.docketNumber,
      },
    );

    expect(caseDetail.contactSecondary.name).not.toBe(
      'Secondary Party Name Changed',
    );
    expect(caseDetail.contactSecondary.name).toBe(mockContactSecondary.name);
    expect(caseDetail.contactSecondary.email).not.toBe('hello123@example.com');
    expect(caseDetail.contactSecondary.email).toBe(mockContactSecondary.email);
  });

  it('does not generate a change of address when inCareOf is updated', async () => {
    applicationContext
      .getUtilities()
      .getDocumentTypeForAddressChange.mockReturnValue(undefined);
    applicationContext
      .getUtilities()
      .getAddressPhoneDiff.mockReturnValue({ inCareOf: {} });

    await updateSecondaryContactInteractor(applicationContext, {
      contactInfo: {
        address1: 'nothing',
        city: 'Somewhere',
        countryType: COUNTRY_TYPES.DOMESTIC,
        email: 'secondary@example.com',
        inCareOf: 'Andy Dwyer',
        name: 'Secondary Party',
        phone: '9876543210',
        postalCode: '12345',
        state: 'TN',
      },
      docketNumber: MOCK_CASE.docketNumber,
    });

    expect(
      applicationContext.getPersistenceGateway().updateCase,
    ).toHaveBeenCalled();
    expect(
      applicationContext.getDocumentGenerators().changeOfAddress,
    ).not.toHaveBeenCalled();
  });

  it('should update the contact on the case but not generate a change of address when case is sealed', async () => {
    const mockCaseWithSealedAddress = {
      ...mockCase,
      contactSecondary: {
        ...mockCase.contactSecondary,
        isAddressSealed: true,
      },
    };

    applicationContext
      .getPersistenceGateway()
      .getCaseByDocketNumber.mockImplementation(
        () => mockCaseWithSealedAddress,
      );

    await updateSecondaryContactInteractor(applicationContext, {
      contactInfo: {
        address1: 'nothing',
        city: 'Somewhere',
        countryType: COUNTRY_TYPES.DOMESTIC,
        email: 'secondary@example.com',
        inCareOf: 'Andy Dwyer',
        name: 'Secondary Party',
        phone: '9876543210',
        postalCode: '12345',
        state: 'TN',
      },
      docketNumber: MOCK_CASE.docketNumber,
    });

    expect(
      applicationContext.getPersistenceGateway().updateCase,
    ).toHaveBeenCalled();
    expect(
      applicationContext.getDocumentGenerators().changeOfAddress,
    ).not.toHaveBeenCalled();
    expect(
      applicationContext.getPersistenceGateway().saveDocumentFromLambda,
    ).not.toHaveBeenCalled();
  });
});
