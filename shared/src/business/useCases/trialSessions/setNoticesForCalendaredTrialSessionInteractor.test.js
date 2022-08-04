const {
  applicationContext,
} = require('../../test/createTestApplicationContext');
const {
  setNoticesForCalendaredTrialSessionInteractor,
} = require('./setNoticesForCalendaredTrialSessionInteractor');
const {
  TRIAL_SESSION_PROCEEDING_TYPES,
} = require('../../entities/EntityConstants');
const { MOCK_TRIAL_REGULAR } = require('../../../test/mockTrial');
const { PARTY_TYPES, ROLES } = require('../../entities/EntityConstants');
const { testPdfDoc } = require('../../test/getFakeFile');
const { User } = require('../../entities/User');

describe('setNoticesForCalendaredTrialSessionInteractor', () => {
  const mockPdfUrl = 'www.example.com';
  const unAuthorizedUser = new User({
    name: PARTY_TYPES.petitioner,
    role: ROLES.petitioner,
    userId: '6805d1ab-18d0-43ec-bafb-654e83405416',
  });

  const user = new User({
    name: PARTY_TYPES.petitioner,
    role: ROLES.petitionsClerk,
    userId: '6805d1ab-18d0-43ec-bafb-654e83405416',
  });

  beforeEach(() => {
    applicationContext
      .getPersistenceGateway()
      .getCalendaredCasesForTrialSession.mockResolvedValue([
        {
          docketNumber: '101-20',
        },
        {
          docketNumber: '102-20',
        },
        {
          docketNumber: '103-20',
        },
      ]);
    applicationContext.getCurrentUser.mockReturnValue(user);
    applicationContext
      .getPersistenceGateway()
      .getTrialSessionById.mockResolvedValue({
        ...MOCK_TRIAL_REGULAR,
        proceedingType: TRIAL_SESSION_PROCEEDING_TYPES.inPerson,
      });
    applicationContext.getNotificationGateway().sendNotificationToUser =
      jest.fn();
    applicationContext
      .getPersistenceGateway()
      .getJobStatus.mockResolvedValueOnce({
        unfinishedCases: 0,
      })
      .mockResolvedValueOnce({
        unfinishedCases: 1,
      });
    applicationContext
      .getUseCaseHelpers()
      .savePaperServicePdf.mockResolvedValue({
        hasPaper: true,
        url: mockPdfUrl,
      });
    applicationContext
      .getPersistenceGateway()
      .isFileExists.mockResolvedValue(true);

    applicationContext
      .getPersistenceGateway()
      .getDocument.mockResolvedValue(testPdfDoc);

    jest.spyOn(global, 'setInterval').mockImplementation(async cb => {
      await cb();
      await cb();
    });
  });

  it('should return an unauthorized error if the user does not have the TRIAL_SESSIONS permission', async () => {
    applicationContext.getCurrentUser.mockReturnValue(unAuthorizedUser);
    let error;

    try {
      await setNoticesForCalendaredTrialSessionInteractor(applicationContext, {
        trialSessionId: '6805d1ab-18d0-43ec-bafb-654e83405416',
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
  });

  it('should NOT attempt to paper service a case with no corresponding case data information', async () => {
    applicationContext
      .getPersistenceGateway()
      .isFileExists.mockResolvedValue(false);

    await setNoticesForCalendaredTrialSessionInteractor(applicationContext, {
      trialSessionId: '6805d1ab-18d0-43ec-bafb-654e83405416',
    });

    expect(
      applicationContext.getPersistenceGateway().getDocument,
    ).not.toHaveBeenCalled();
    expect(
      applicationContext.getUtilities().copyPagesFromPdf,
    ).not.toHaveBeenCalled();

    const pdfDoc =
      applicationContext.getUseCaseHelpers().savePaperServicePdf.mock
        .calls[0][0].document;
    expect(pdfDoc.getPages().length).toBe(0);
  });

  it('should send a notification with no paper service indicator for trial sessions with no calendared cases', async () => {
    applicationContext
      .getPersistenceGateway()
      .getCalendaredCasesForTrialSession.mockResolvedValue([]);

    await setNoticesForCalendaredTrialSessionInteractor(applicationContext, {
      trialSessionId: '6805d1ab-18d0-43ec-bafb-654e83405416',
    });

    expect(
      applicationContext.getNotificationGateway().sendNotificationToUser,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        message: {
          action: 'notice_generation_complete',
          hasPaper: false,
        },
        userId: user.userId,
      }),
    );
  });

  it('should create 3 trial session events and send 3 notifications for each completed trial session calendering job', async () => {
    await setNoticesForCalendaredTrialSessionInteractor(applicationContext, {
      trialSessionId: '6805d1ab-18d0-43ec-bafb-654e83405416',
    });

    expect(
      applicationContext.getMessageGateway().sendSetTrialSessionCalendarEvent,
    ).toHaveBeenCalledTimes(3);
    const {
      message: { hasPaper, pdfUrl },
      userId,
    } =
      applicationContext.getNotificationGateway().sendNotificationToUser.mock
        .calls[0][0];
    expect(pdfUrl).toBe(mockPdfUrl);

    applicationContext
      .getUseCaseHelpers()
      .savePaperServicePdf.mockResolvedValue({
        url: null,
      });

    await setNoticesForCalendaredTrialSessionInteractor(applicationContext, {
      trialSessionId: '6805d1ab-18d0-43ec-bafb-654e83405416',
    });

    const { pdfUrl: pdfUrlNull } =
      applicationContext.getNotificationGateway().sendNotificationToUser.mock
        .calls[1][0].message;
    expect(pdfUrlNull).toBe(null);
    expect(hasPaper).toBe(true);
    expect(userId).toBe(user.userId);
  });

  it('should save the combined copies of the calendared cases for the trial sessions', async () => {
    await setNoticesForCalendaredTrialSessionInteractor(applicationContext, {
      trialSessionId: '6805d1ab-18d0-43ec-bafb-654e83405416',
    });

    expect(
      applicationContext.getPersistenceGateway().getDocument,
    ).toHaveBeenCalledTimes(3);
    expect(
      applicationContext.getUtilities().copyPagesAndAppendToTargetPdf,
    ).toHaveBeenCalledTimes(3);

    const pdfDoc =
      applicationContext.getUseCaseHelpers().savePaperServicePdf.mock
        .calls[0][0].document;
    expect(pdfDoc.getPages().length).toBe(3);
  });
});
