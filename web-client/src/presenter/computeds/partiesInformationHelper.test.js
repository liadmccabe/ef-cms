import {
  CONTACT_TYPES,
  OTHER_FILER_TYPES,
  UNIQUE_OTHER_FILER_TYPE,
} from '../../../../shared/src/business/entities/EntityConstants';
import { applicationContext } from '../../applicationContext';
import { partiesInformationHelper as partiesInformationHelperComputed } from './partiesInformationHelper';
import { runCompute } from 'cerebral/test';
import { withAppContextDecorator } from '../../withAppContext';

describe('partiesInformationHelper', () => {
  const partiesInformationHelper = withAppContextDecorator(
    partiesInformationHelperComputed,
    applicationContext,
  );

  it('should return formatted petitioners with representing practitioners', () => {
    const mockId = '8ee0833f-6b82-4a8a-9803-8dab8bb49b63';
    const mockPetitioner = {
      contactId: mockId,
    };
    const mockPractitioner = {
      name: 'Test Name',
      representing: [mockId],
    };
    const result = runCompute(partiesInformationHelper, {
      state: {
        caseDetail: {
          petitioners: [mockPetitioner],
          privatePractitioners: [mockPractitioner],
        },
      },
    });

    expect(result.formattedPetitioners).toMatchObject([
      {
        ...mockPetitioner,
        hasCounsel: true,
        representingPractitioners: [mockPractitioner],
      },
    ]);
    expect(result.formattedParticipants).toEqual([]);
  });

  it('should return formatted participants with representing practitioners and formattedTitle', () => {
    const mockId = '8ee0833f-6b82-4a8a-9803-8dab8bb49b63';
    const mockIntervenor = {
      contactId: mockId,
      contactType: CONTACT_TYPES.otherFiler,
      otherFilerType: UNIQUE_OTHER_FILER_TYPE,
    };
    const mockParticipant = {
      contactId: mockId,
      contactType: CONTACT_TYPES.otherFiler,
      otherFilerType: OTHER_FILER_TYPES[1],
    };
    const mockPractitioner = {
      name: 'Test Name',
      representing: [mockId],
    };

    const result = runCompute(partiesInformationHelper, {
      state: {
        caseDetail: {
          petitioners: [mockIntervenor, mockParticipant],
          privatePractitioners: [mockPractitioner],
        },
      },
    });

    expect(result.formattedParticipants).toMatchObject([
      {
        ...mockIntervenor,
        formattedTitle: UNIQUE_OTHER_FILER_TYPE,
        hasCounsel: true,
        representingPractitioners: [mockPractitioner],
      },
      {
        ...mockParticipant,
        formattedTitle: 'Participant',
        hasCounsel: true,
        representingPractitioners: [mockPractitioner],
      },
    ]);
    expect(result.formattedPetitioners).toEqual([]);
  });

  it('should set hasCounsel to false for a petitioner that is not represented', () => {
    const mockPetitionerId = '8ee0833f-6b82-4a8a-9803-8dab8bb49b63';
    const mockPetitioner = {
      contactId: mockPetitionerId,
    };
    const mockPractitioner = {
      name: 'Test Name',
      representing: ['abc'],
    };

    const result = runCompute(partiesInformationHelper, {
      state: {
        caseDetail: {
          petitioners: [mockPetitioner],
          privatePractitioners: [mockPractitioner],
        },
      },
    });

    expect(result.formattedPetitioners).toMatchObject([
      {
        ...mockPetitioner,
        hasCounsel: false,
        representingPractitioners: [],
      },
    ]);
  });

  describe('showParticipantsTab', () => {
    it('should be false when the case does not have any participants or intervenors', () => {
      const mockPetitioner = {
        contactType: CONTACT_TYPES.primary,
      };

      const result = runCompute(partiesInformationHelper, {
        state: {
          caseDetail: {
            petitioners: [mockPetitioner],
            privatePractitioners: [],
          },
        },
      });

      expect(result.showParticipantsTab).toBeFalsy();
    });

    it('should be true when the case has at least one participant', () => {
      const mockPetitioner = {
        contactType: CONTACT_TYPES.otherFiler,
      };

      const result = runCompute(partiesInformationHelper, {
        state: {
          caseDetail: {
            petitioners: [mockPetitioner],
            privatePractitioners: [],
          },
        },
      });

      expect(result.showParticipantsTab).toBeTruthy();
    });
  });
});