import {
  FILING_FEE_DEADLINE_DESCRIPTION,
  PAYMENT_STATUS,
  SYSTEM_GENERATED_DOCUMENT_TYPES,
} from '../../shared/src/business/entities/EntityConstants';
import { caseDetailHelper as caseDetailHelperComputed } from '../src/presenter/computeds/caseDetailHelper';
import { fakeFile, loginAs, setupTest } from './helpers';
import { petitionsClerkCreatesNewCaseFromPaper } from './journey/petitionsClerkCreatesNewCaseFromPaper';
import { petitionsClerkReviewsPaperCaseBeforeServing } from './journey/petitionsClerkReviewsPaperCaseBeforeServing';
import { runCompute } from 'cerebral/test';
import { withAppContextDecorator } from '../src/withAppContext';

describe('Petitions Clerk something', () => {
  const cerebralTest = setupTest();
  cerebralTest.draftOrders = [];
  const caseDetailHelper = withAppContextDecorator(caseDetailHelperComputed);

  beforeAll(() => {
    jest.setTimeout(40000);
    jest.spyOn(
      cerebralTest.applicationContext.getUseCases(),
      'createMessageInteractor',
    );
  });

  afterAll(() => {
    cerebralTest.closeSocket();
  });

  loginAs(cerebralTest, 'petitionsclerk@example.com');
  petitionsClerkCreatesNewCaseFromPaper(cerebralTest, fakeFile, {
    paymentStatus: PAYMENT_STATUS.UNPAID,
  });
  petitionsClerkReviewsPaperCaseBeforeServing(cerebralTest, {
    hasIrsNoticeFormatted: 'No',
    ordersAndNoticesInDraft: [
      'Order Designating Place of Trial',
      'Order for Filing Fee',
    ],
    ordersAndNoticesNeeded: ['Order for Ratification of Petition'],
    petitionPaymentStatusFormatted: PAYMENT_STATUS.UNPAID,
    receivedAtFormatted: '01/01/01',
    shouldShowIrsNoticeDate: false,
  });

  it('petitions clerk serves petition', async () => {
    await cerebralTest.runSequence('gotoCaseDetailSequence', {
      docketNumber: cerebralTest.docketNumber,
    });

    const petitionDocketEntryId = cerebralTest
      .getState('caseDetail.docketEntries')
      .find(d => d.eventCode === 'P').docketEntryId;

    await cerebralTest.runSequence('gotoPetitionQcSequence', {
      docketNumber: cerebralTest.docketNumber,
      redirectUrl: `/case-detail/${cerebralTest.docketNumber}/document-view?docketEntryId=${petitionDocketEntryId}`,
    });

    await cerebralTest.runSequence('updateFormValueSequence', {
      key: 'hasVerifiedIrsNotice',
      value: false,
    });

    expect(cerebralTest.getState('currentPage')).toEqual('PetitionQc');

    await cerebralTest.runSequence('saveSavedCaseForLaterSequence');

    expect(cerebralTest.getState('currentPage')).toEqual('ReviewSavedPetition');

    await cerebralTest.runSequence('openConfirmServeToIrsModalSequence');

    await cerebralTest.runSequence('serveCaseToIrsSequence');

    expect(cerebralTest.getState('currentPage')).toEqual(
      'PrintPaperPetitionReceipt',
    );
  });

  loginAs(cerebralTest, 'docketclerk@example.com');
  it('should view the draft order and sign it', async () => {
    await cerebralTest.runSequence('gotoCaseDetailSequence', {
      docketNumber: cerebralTest.docketNumber,
    });

    const docketEntries = cerebralTest.getState('caseDetail.docketEntries');
    const draftOrderForFilingFeeDocketEntry = docketEntries.find(
      doc =>
        doc.eventCode ===
        SYSTEM_GENERATED_DOCUMENT_TYPES.orderForFilingFee.eventCode,
    );

    expect(draftOrderForFilingFeeDocketEntry).toBeTruthy();

    cerebralTest.draftDocketEntryId =
      draftOrderForFilingFeeDocketEntry.docketEntryId;

    await cerebralTest.runSequence('gotoSignOrderSequence', {
      docketEntryId: cerebralTest.draftDocketEntryId,
      docketNumber: cerebralTest.docketNumber,
    });

    await cerebralTest.runSequence('setPDFSignatureDataSequence', {
      signatureData: {
        scale: 1,
        x: 100,
        y: 100,
      },
    });
    await cerebralTest.runSequence('saveDocumentSigningSequence');
  });

  it('petitions clerk adds a docket entry for order for filing fee and serves it', async () => {
    await cerebralTest.runSequence('gotoAddCourtIssuedDocketEntrySequence', {
      docketEntryId: cerebralTest.draftDocketEntryId,
      docketNumber: cerebralTest.docketNumber,
    });
    const mockDeadlineDate = '2019-03-01T21:40:46.415Z';

    await cerebralTest.runSequence(
      'updateCourtIssuedDocketEntryFormValueSequence',
      {
        key: 'date',
        value: mockDeadlineDate,
      },
    );

    await cerebralTest.runSequence(
      'updateCourtIssuedDocketEntryFormValueSequence',
      {
        key: 'month',
        value: '2',
      },
    );

    await cerebralTest.runSequence(
      'updateCourtIssuedDocketEntryFormValueSequence',
      {
        key: 'day',
        value: '2',
      },
    );

    await cerebralTest.runSequence(
      'updateCourtIssuedDocketEntryFormValueSequence',
      {
        key: 'year',
        value: '2050',
      },
    );

    await cerebralTest.runSequence('submitCourtIssuedDocketEntrySequence');

    expect(cerebralTest.getState('validationErrors')).toEqual({});

    expect(cerebralTest.getState('alertSuccess').message).toEqual(
      'Your entry has been added to the docket record.',
    );
  });

  it('petitions clerk verifies there is a new case deadline with date from previous step and correct description', async () => {
    await cerebralTest.runSequence('gotoCaseDetailSequence', {
      docketNumber: cerebralTest.docketNumber,
    });

    console.log('***cerebralTest.docketNumber', cerebralTest.docketNumber);

    const helper = runCompute(caseDetailHelper, {
      state: cerebralTest.getState(),
    });

    console.log('helper.caseDeadlines', helper.caseDeadlines);

    expect(helper.caseDeadlines[0].date).toEqual(mockDeadlineDate);
    expect(helper.caseDeadlines[0].description).toEqual(
      FILING_FEE_DEADLINE_DESCRIPTION,
    );
  });

  //create a new paper case with filing fee not paid
  //serve the case
  //verify OF in drafts
  //sign OF
  //add docket entry from OF
  //serve docket entry
  //verify there is a new case deadline with date from previous step and correct description

  //create a new paper case with filing fee not paid
  //serve the case
  //sign OF
  //add docket entry from OF
  //save for later
  //serve docket entry from document viewer
  //verify there is a new case deadline with date from previous step and correct description
});
