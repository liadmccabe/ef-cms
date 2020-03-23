const { getCaseByDocketNumber } = require('./getCaseByDocketNumber');

describe('getCaseByDocketNumber', () => {
  let applicationContext;
  let queryStub = jest.fn().mockReturnValue({
    promise: async () => ({
      Items: [
        {
          caseId: '123',
          pk: 'case|123',
          sk: 'case|123',
          status: 'New',
        },
      ],
    }),
  });

  beforeEach(() => {
    applicationContext = {
      environment: {
        stage: 'local',
      },
      filterCaseMetadata: ({ cases }) => cases,
      getDocumentClient: () => ({
        query: queryStub,
      }),
      isAuthorizedForWorkItems: () => true,
    };
  });

  it('should return data as received from persistence', async () => {
    const result = await getCaseByDocketNumber({
      applicationContext,
      docketNumber: '101-18',
    });
    expect(result).toEqual({
      caseId: '123',
      docketRecord: [],
      documents: [],
      irsPractitioners: [],
      pk: 'case|123',
      privatePractitioners: [],
      sk: 'case|123',
      status: 'New',
    });
  });

  it('should return the case and its associated data', async () => {
    queryStub = jest.fn().mockReturnValue({
      promise: async () => ({
        Items: [
          {
            caseId: '123',
            pk: 'case|123',
            sk: 'case|123',
            status: 'New',
          },
          {
            pk: 'case|123',
            sk: 'irsPractitioner|123',
            userId: 'abc-123',
          },
          {
            pk: 'case|123',
            sk: 'privatePractitioner|123',
            userId: 'abc-123',
          },
          {
            docketRecordId: 'abc-123',
            pk: 'case|123',
            sk: 'docket-record|123',
          },
          {
            documentId: 'abc-123',
            pk: 'case|123',
            sk: 'document|123',
          },
        ],
      }),
    });
    const result = await getCaseByDocketNumber({
      applicationContext,
      docketNumber: '101-18',
    });
    expect(result).toEqual({
      caseId: '123',
      docketRecord: [
        {
          docketRecordId: 'abc-123',
          pk: 'case|123',
          sk: 'docket-record|123',
        },
      ],
      documents: [
        {
          documentId: 'abc-123',
          pk: 'case|123',
          sk: 'document|123',
        },
      ],
      irsPractitioners: [
        { pk: 'case|123', sk: 'irsPractitioner|123', userId: 'abc-123' },
      ],
      pk: 'case|123',
      privatePractitioners: [
        {
          pk: 'case|123',
          sk: 'privatePractitioner|123',
          userId: 'abc-123',
        },
      ],
      sk: 'case|123',
      status: 'New',
    });
  });

  it('should return null if nothing is returned from the client query request', async () => {
    queryStub = jest.fn().mockReturnValue({
      promise: async () => ({ Items: [] }),
    });
    const result = await getCaseByDocketNumber({
      applicationContext,
      docketNumber: '101-18',
    });
    expect(result).toEqual(null);
  });
});
