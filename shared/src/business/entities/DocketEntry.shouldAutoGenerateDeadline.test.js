const { MOCK_DOCUMENTS } = require('../../test/mockDocuments');
const { shouldAutoGenerateDeadline } = require('./DocketEntry');

describe('shouldAutoGenerateDeadline', () => {
  it('should return true when the docket entry is one of AUTO_GENERATED_DEADLINE_DOCUMENT_TYPES', () => {
    const mockDocketEntry = { ...MOCK_DOCUMENTS[0], eventCode: 'OF' };
    const result = shouldAutoGenerateDeadline(mockDocketEntry);

    expect(result).toBe(true);
  });

  // it('should return true when the docket entry is one of AUTO_GENERATED_DEADLINE_DOCUMENT_TYPES', () => {
  //   const mockDocketEntry = { ...MOCK_DOCUMENTS[0], eventCode: 'OF' };
  //   const result = shouldAutoGenerateDeadline(mockDocketEntry);

  //   expect(result).toBe(true);
  // });
});
