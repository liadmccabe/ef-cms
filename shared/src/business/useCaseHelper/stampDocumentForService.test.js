const {
  ENTERED_AND_SERVED_EVENT_CODES,
} = require('../entities/courtIssuedDocument/CourtIssuedDocumentConstants');
const { applicationContext } = require('../test/createTestApplicationContext');
const { stampDocumentForService } = require('./stampDocumentForService');

describe('stampDocumentForService', () => {
  beforeEach(() => {});

  it('should set `Served` as the serviceStampType when the documentType is NOT order and the document eventCode is not one of ENTERED_AND_SERVED_EVENT_CODES', async () => {
    await stampDocumentForService({
      applicationContext,
      documentToStamp: {
        documentType: 'Motion to Withdraw as Counsel',
        eventCode: 'M112',
      },
      pdfData: {},
    });

    expect(
      applicationContext.getUseCaseHelpers().addServedStampToDocument.mock
        .calls[0][0].serviceStampText,
    ).toContain('Served');
  });

  it('should set serviceStampType from the document when the documentType is Order', async () => {
    const mockServiceStamp = 'This document is urgent!';

    await stampDocumentForService({
      applicationContext,
      documentToStamp: {
        documentType: 'Order',
        serviceStamp: mockServiceStamp,
      },
      pdfData: {},
    });

    expect(
      applicationContext.getUseCaseHelpers().addServedStampToDocument.mock
        .calls[0][0].serviceStampText,
    ).toContain(mockServiceStamp);
  });

  it('should include `Entered and Served` in the serviceStampType when the eventCode is in ENTERED_AND_SERVED_EVENT_CODES', async () => {
    await stampDocumentForService({
      applicationContext,
      documentToStamp: {
        eventCode: ENTERED_AND_SERVED_EVENT_CODES[0],
      },
      pdfData: {},
    });

    expect(
      applicationContext.getUseCaseHelpers().addServedStampToDocument.mock
        .calls[0][0].serviceStampText,
    ).toContain('Entered and Served');
  });
});
