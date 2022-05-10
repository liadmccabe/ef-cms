const {
  applicationContext,
} = require('../../test/createTestApplicationContext');
const {
  MOCK_TRIAL_INPERSON,
  MOCK_TRIAL_REMOTE,
} = require('../../../test/mockTrial');
const {
  setNoticeOfChangeToRemoteProceeding,
} = require('./setNoticeOfChangeToRemoteProceeding');
const { Case } = require('../../entities/cases/Case');
const { CASE_STATUS_TYPES } = require('../../entities/EntityConstants');
const { getFakeFile } = require('../../test/getFakeFile');
const { MOCK_CASE } = require('../../../test/mockCase');

describe('setNoticeOfChangeToRemoteProceeding', () => {
  const mockDocumentId = '98c6b1c8-1eed-44b6-932a-967af060597a';
  const trialSessionId = '76a5b1c8-1eed-44b6-932a-967af060597a';
  const userId = '85a5b1c8-1eed-44b6-932a-967af060597a';

  const inPersonTrialSession = { ...MOCK_TRIAL_INPERSON, trialSessionId };
  const remoteTrialSession = { ...MOCK_TRIAL_REMOTE, trialSessionId };

  const mockPdfDocument = {
    load: () => jest.fn().mockReturnValue(getFakeFile),
  };
  const mockOpenCase = new Case(
    {
      ...MOCK_CASE,
      trialDate: '2019-03-01T21:42:29.073Z',
      trialSessionId,
    },
    { applicationContext },
  );
  const mockClosedCase = new Case(
    {
      ...MOCK_CASE,
      closedDate: '2020-03-01T21:42:29.073Z',
      docketNumber: '999-99',
      status: CASE_STATUS_TYPES.closed,
      trialDate: '2019-03-01T21:42:29.073Z',
      trialSessionId,
    },
    { applicationContext },
  );

  beforeEach(() => {
    applicationContext.getUseCaseHelpers().appendPaperServiceAddressPageToPdf =
      jest.fn();

    applicationContext
      .getUseCases()
      .generateNoticeOfChangeToRemoteProceedingInteractor.mockReturnValue(
        getFakeFile,
      );

    applicationContext.getUniqueId.mockReturnValue(mockDocumentId);
  });

  it('should generate a NORP when the proceeding type changes from in person to remote and the case status is not closed', async () => {
    await setNoticeOfChangeToRemoteProceeding(applicationContext, {
      PDFDocument: mockPdfDocument,
      caseEntity: mockOpenCase,
      currentTrialSession: inPersonTrialSession,
      newPdfDoc: getFakeFile,
      newTrialSessionEntity: remoteTrialSession,
      userId,
    });

    expect(
      applicationContext.getUseCases()
        .generateNoticeOfChangeToRemoteProceedingInteractor.mock.calls[0][1],
    ).toMatchObject({
      docketNumber: mockOpenCase.docketNumber,
      trialSessionInformation: {
        chambersPhoneNumber: '1111111',
        joinPhoneNumber: '0987654321',
        judgeName: 'Chief Judge',
        meetingId: '1234567890',
        password: 'abcdefg',
        startDate: '2025-12-01T00:00:00.000Z',
        startTime: undefined,
        trialLocation: 'Birmingham, Alabama',
      },
    });
  });

  it('should not do anything when the case status is closed', async () => {
    await setNoticeOfChangeToRemoteProceeding(applicationContext, {
      PDFDocument: mockPdfDocument,
      caseEntity: mockClosedCase,
      currentTrialSession: inPersonTrialSession,
      newPdfDoc: getFakeFile,
      newTrialSessionEntity: remoteTrialSession,
      userId,
    });

    expect(
      applicationContext.getUseCases()
        .generateNoticeOfChangeToRemoteProceedingInteractor,
    ).not.toHaveBeenCalled();
    expect(
      applicationContext.getPersistenceGateway().saveDocumentFromLambda,
    ).not.toHaveBeenCalled();
    expect(
      applicationContext.getUseCaseHelpers().serveDocumentAndGetPaperServicePdf,
    ).not.toHaveBeenCalled();
  });

  it('should not do anything when the case status is open but the trial session proceeding type has not changed', async () => {
    await setNoticeOfChangeToRemoteProceeding(applicationContext, {
      PDFDocument: mockPdfDocument,
      caseEntity: mockOpenCase,
      currentTrialSession: inPersonTrialSession,
      newPdfDoc: getFakeFile,
      newTrialSessionEntity: inPersonTrialSession,
      userId,
    });

    expect(
      applicationContext.getUseCases()
        .generateNoticeOfChangeToRemoteProceedingInteractor,
    ).not.toHaveBeenCalled();
    expect(
      applicationContext.getPersistenceGateway().saveDocumentFromLambda,
    ).not.toHaveBeenCalled();
    expect(
      applicationContext.getUseCaseHelpers().serveDocumentAndGetPaperServicePdf,
    ).not.toHaveBeenCalled();
  });
});
