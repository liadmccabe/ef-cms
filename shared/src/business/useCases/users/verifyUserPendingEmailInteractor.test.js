const {
  applicationContext,
} = require('../../test/createTestApplicationContext');
const {
  updatePetitionerCases,
  verifyUserPendingEmailInteractor,
} = require('./verifyUserPendingEmailInteractor');
const { MOCK_CASE } = require('../../../test/mockCase');
const { PARTY_TYPES, ROLES } = require('../../entities/EntityConstants');
const { validUser } = require('../../../test/mockUsers');

describe('verifyUserPendingEmailInteractor', () => {
  let mockUser;
  let userCases;

  const TOKEN = '41189629-abe1-46d7-b7a4-9d3834f919cb';

  beforeEach(() => {
    mockUser = {
      ...validUser,
      admissionsDate: '2019-03-01T21:40:46.415Z',
      admissionsStatus: 'Active',
      barNumber: 'RA3333',
      birthYear: '1950',
      employer: 'Private',
      firstName: 'Alden',
      lastName: 'Rivas',
      name: 'Alden Rivas',
      originalBarState: 'Florida',
      practitionerType: 'Attorney',
      role: ROLES.privatePractitioner,
    };

    applicationContext.getCurrentUser.mockImplementation(() => mockUser);
    applicationContext
      .getPersistenceGateway()
      .getUserById.mockImplementation(() => mockUser);
    applicationContext
      .getPersistenceGateway()
      .updateUser.mockImplementation(() => mockUser);
    applicationContext
      .getPersistenceGateway()
      .updateUserEmail.mockImplementation(() => mockUser);
    applicationContext
      .getPersistenceGateway()
      .getCasesByUserId.mockReturnValue([]);
    applicationContext
      .getPersistenceGateway()
      .isEmailAvailable.mockReturnValue(true);
  });

  it('should throw unauthorized error when user does not have permission to verify emails', async () => {
    mockUser = {
      role: ROLES.petitionsClerk,
      userId: 'f7d90c05-f6cd-442c-a168-202db587f16f',
    };

    await expect(
      verifyUserPendingEmailInteractor({
        applicationContext,
        token: 'abc',
      }),
    ).rejects.toThrow('Unauthorized to manage emails');
  });

  it('should throw an unauthorized error when the token passed as an argument does not match stored token on user', async () => {
    mockUser = {
      ...mockUser,
      pendingEmailVerificationToken: '123',
    };

    await expect(
      verifyUserPendingEmailInteractor({
        applicationContext,
        token: 'abc',
      }),
    ).rejects.toThrow('Tokens do not match');
  });

  it('should throw an unauthorized error when the token passed as an argument and the token store on the user are both undefined', async () => {
    mockUser = {
      ...mockUser,
      pendingEmailVerificationToken: undefined,
    };

    await expect(
      verifyUserPendingEmailInteractor({
        applicationContext,
        token: undefined,
      }),
    ).rejects.toThrow('Tokens do not match');
  });

  it('should throw an error when the pendingEmail address is not available in cognito', async () => {
    applicationContext
      .getPersistenceGateway()
      .isEmailAvailable.mockReturnValue(false);
    mockUser = {
      ...mockUser,
      email: 'test@example.com',
      pendingEmail: 'other@example.com',
      pendingEmailVerificationToken: TOKEN,
    };

    await expect(
      verifyUserPendingEmailInteractor({
        applicationContext,
        token: TOKEN,
      }),
    ).rejects.toThrow('Email is not available');
  });

  it('should update the cognito email when tokens match', async () => {
    mockUser = {
      ...mockUser,
      email: 'test@example.com',
      pendingEmail: 'other@example.com',
      pendingEmailVerificationToken: TOKEN,
    };

    await verifyUserPendingEmailInteractor({
      applicationContext,
      token: TOKEN,
    });

    expect(
      applicationContext.getPersistenceGateway().updateUserEmail,
    ).toHaveBeenCalled();
    expect(
      applicationContext.getPersistenceGateway().updateUserEmail.mock
        .calls[0][0].user,
    ).toMatchObject({
      email: 'test@example.com',
      pendingEmail: 'other@example.com',
      pendingEmailVerificationToken: TOKEN,
    });
  });

  it('should update the dynamo record with the new info', async () => {
    mockUser = {
      ...mockUser,
      email: 'test@example.com',
      pendingEmail: 'other@example.com',
      pendingEmailVerificationToken: TOKEN,
    };

    await verifyUserPendingEmailInteractor({
      applicationContext,
      token: TOKEN,
    });

    expect(
      applicationContext.getPersistenceGateway().updateUser,
    ).toHaveBeenCalled();
    expect(
      applicationContext.getPersistenceGateway().updateUser.mock.calls[0][0]
        .user,
    ).toMatchObject({
      email: 'other@example.com',
      pendingEmail: undefined,
      pendingEmailVerificationToken: undefined,
    });
  });

  it('should log an error when the practitioner is not found on one of their associated cases by userId', async () => {
    mockUser = {
      ...mockUser,
      email: 'test@example.com',
      pendingEmail: 'other@example.com',
      pendingEmailVerificationToken: TOKEN,
    };
    userCases = [
      {
        ...MOCK_CASE,
        docketNumber: '101-21',
        privatePractitioners: [
          {
            ...mockUser,
            email: 'test@example.com',
            userId: '0e363902-598e-4db3-bb41-68bdea9f9154',
          },
        ],
      },
    ];
    applicationContext
      .getPersistenceGateway()
      .getCasesByUserId.mockReturnValue(userCases);
    applicationContext
      .getPersistenceGateway()
      .getCaseByDocketNumber.mockReturnValue(userCases[0]);

    await verifyUserPendingEmailInteractor({
      applicationContext,
      token: TOKEN,
    });

    expect(applicationContext.logger.error.mock.calls[0][0]).toEqual(
      new Error(
        'Could not find user|3ab77c88-1dd0-4adb-a03c-c466ad72d417 barNumber: RA3333 on 101-21',
      ),
    );
    expect(
      applicationContext.getUseCaseHelpers().updateCaseAndAssociations,
    ).not.toBeCalled();
  });

  it("should update all of the user's cases with the new email", async () => {
    userCases = [
      {
        ...MOCK_CASE,
        docketNumber: '101-21',
        privatePractitioners: [{ ...mockUser, email: 'test@example.com' }],
      },
      {
        ...MOCK_CASE,
        docketNumber: '102-21',
        privatePractitioners: [{ ...mockUser, email: 'test@example.com' }],
      },
    ];
    mockUser = {
      ...mockUser,
      email: 'test@example.com',
      pendingEmail: 'other@example.com',
      pendingEmailVerificationToken: TOKEN,
    };
    applicationContext
      .getPersistenceGateway()
      .getCasesByUserId.mockReturnValue(userCases);
    applicationContext
      .getPersistenceGateway()
      .getCaseByDocketNumber.mockReturnValueOnce(userCases[0])
      .mockReturnValueOnce(userCases[1]);

    await verifyUserPendingEmailInteractor({
      applicationContext,
      token: TOKEN,
    });

    expect(
      applicationContext.getUseCaseHelpers().updateCaseAndAssociations.mock
        .calls.length,
    ).toEqual(2);
    expect(
      applicationContext.getUseCaseHelpers().updateCaseAndAssociations.mock
        .calls[0][0].caseToUpdate,
    ).toMatchObject({
      privatePractitioners: [{ email: 'other@example.com' }],
    });
    expect(
      applicationContext.getUseCaseHelpers().updateCaseAndAssociations.mock
        .calls[1][0].caseToUpdate,
    ).toMatchObject({
      privatePractitioners: [{ email: 'other@example.com' }],
    });
  });

  it('should notify the user as each of their cases is updated with the new email', async () => {
    mockUser = {
      ...mockUser,
      email: 'test@example.com',
      pendingEmail: 'other@example.com',
      pendingEmailVerificationToken: TOKEN,
    };
    userCases = [
      {
        ...MOCK_CASE,
        docketNumber: '101-21',
        privatePractitioners: [{ ...mockUser, email: 'test@example.com' }],
      },
      {
        ...MOCK_CASE,
        docketNumber: '102-21',
        privatePractitioners: [{ ...mockUser, email: 'test@example.com' }],
      },
    ];
    applicationContext
      .getPersistenceGateway()
      .getCasesByUserId.mockReturnValue(userCases);
    applicationContext
      .getPersistenceGateway()
      .getCaseByDocketNumber.mockReturnValueOnce(userCases[0])
      .mockReturnValueOnce(userCases[1]);

    await verifyUserPendingEmailInteractor({
      applicationContext,
      token: TOKEN,
    });

    expect(
      applicationContext.getNotificationGateway().sendNotificationToUser.mock
        .calls[0][0].message,
    ).toMatchObject({
      action: 'user_contact_update_progress',
      completedCases: 1,
      totalCases: 2,
    });
    expect(
      applicationContext.getNotificationGateway().sendNotificationToUser.mock
        .calls[1][0].message,
    ).toMatchObject({
      action: 'user_contact_update_progress',
      completedCases: 2,
      totalCases: 2,
    });
  });

  it('should notify the user when their email has been verified and updating all their cases has completed', async () => {
    mockUser = {
      ...mockUser,
      email: 'test@example.com',
      pendingEmail: 'other@example.com',
      pendingEmailVerificationToken: TOKEN,
    };
    userCases = [
      {
        ...MOCK_CASE,
        docketNumber: '101-21',
        privatePractitioners: [{ ...mockUser, email: 'test@example.com' }],
      },
      {
        ...MOCK_CASE,
        docketNumber: '102-21',
        privatePractitioners: [{ ...mockUser, email: 'test@example.com' }],
      },
    ];
    applicationContext
      .getPersistenceGateway()
      .getCasesByUserId.mockReturnValue(userCases);
    applicationContext
      .getPersistenceGateway()
      .getCaseByDocketNumber.mockReturnValueOnce(userCases[0])
      .mockReturnValueOnce(userCases[1]);

    await verifyUserPendingEmailInteractor({
      applicationContext,
      token: TOKEN,
    });

    expect(
      applicationContext.getNotificationGateway().sendNotificationToUser.mock
        .calls[2][0].message,
    ).toMatchObject({
      action: 'user_contact_full_update_complete',
    });
  });

  describe('updatePetitionerCases', () => {
    let mockPetitionerUser;
    const UPDATED_EMAIL = 'hello@example.com';

    beforeEach(() => {
      mockPetitionerUser = {
        ...validUser,
        email: UPDATED_EMAIL,
        role: ROLES.petitioner,
      };

      applicationContext
        .getPersistenceGateway()
        .getIndexedCasesForUser.mockReturnValue([]);
    });

    it('should call getIndexedCasesForUser with user.userId', async () => {
      await updatePetitionerCases({
        applicationContext,
        user: mockPetitionerUser,
      });

      expect(
        applicationContext.getPersistenceGateway().getIndexedCasesForUser.mock
          .calls[0][0],
      ).toMatchObject({
        userId: validUser.userId,
      });
    });

    it('should call getCaseByDocketNumber for each case returned by getIndexedCasesForUser', async () => {
      applicationContext
        .getPersistenceGateway()
        .getIndexedCasesForUser.mockReturnValue([
          {
            ...MOCK_CASE,
            contactPrimary: mockPetitionerUser,
            docketNumber: '101-21',
          },
          {
            ...MOCK_CASE,
            contactPrimary: mockPetitionerUser,
            docketNumber: '102-21',
          },
        ]);

      await updatePetitionerCases({
        applicationContext,
        user: mockPetitionerUser,
      });

      expect(
        applicationContext.getPersistenceGateway().getCaseByDocketNumber.mock
          .calls[0][0],
      ).toMatchObject({
        docketNumber: '101-21',
      });
      expect(
        applicationContext.getPersistenceGateway().getCaseByDocketNumber.mock
          .calls[1][0],
      ).toMatchObject({
        docketNumber: '102-21',
      });
    });

    it('should call applicationContext.logger.error if the petitioner is not found on a case returned by getIndexedCasesForUser', async () => {
      userCases = [
        {
          ...MOCK_CASE,
          docketNumber: '101-21',
        },
        {
          ...MOCK_CASE,
          contactPrimary: {
            ...MOCK_CASE.contactPrimary,
            contactId: mockPetitionerUser.userId,
          },
          docketNumber: '102-21',
        },
      ];

      applicationContext
        .getPersistenceGateway()
        .getIndexedCasesForUser.mockReturnValue(userCases);

      applicationContext
        .getPersistenceGateway()
        .getCaseByDocketNumber.mockReturnValueOnce(userCases[0])
        .mockReturnValueOnce(userCases[1]);

      await updatePetitionerCases({
        applicationContext,
        user: mockPetitionerUser,
      });

      expect(applicationContext.logger.error.mock.calls[0][0]).toEqual(
        new Error(`Could not find user|${mockPetitionerUser.userId} on 101-21`),
      );
      expect(
        applicationContext.getUseCaseHelpers().updateCaseAndAssociations.mock
          .calls[0][0].caseToUpdate,
      ).toMatchObject({
        contactPrimary: {
          email: UPDATED_EMAIL,
        },
        docketNumber: '102-21',
      });
    });

    it('should call updateCaseAndAssociations with updated email address for a contactSecondary', async () => {
      userCases = [
        {
          ...MOCK_CASE,
          contactSecondary: {
            ...MOCK_CASE.contactPrimary,
            contactId: mockPetitionerUser.userId,
            inCareOf: 'Barney',
          },
          docketNumber: '102-21',
          partyType: PARTY_TYPES.petitionerDeceasedSpouse,
        },
      ];

      applicationContext
        .getPersistenceGateway()
        .getIndexedCasesForUser.mockReturnValue(userCases);

      applicationContext
        .getPersistenceGateway()
        .getCaseByDocketNumber.mockReturnValueOnce(userCases[0]);

      await updatePetitionerCases({
        applicationContext,
        user: mockPetitionerUser,
      });

      expect(
        applicationContext.getUseCaseHelpers().updateCaseAndAssociations.mock
          .calls[0][0].caseToUpdate,
      ).toMatchObject({
        contactSecondary: {
          email: UPDATED_EMAIL,
        },
        docketNumber: '102-21',
      });
    });
  });
});