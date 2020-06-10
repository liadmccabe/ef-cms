import { CASE_STATUS_TYPES } from '../../../shared/src/business/entities/EntityConstants';
import { Case } from '../../../shared/src/business/entities/cases/Case';

export const chambersUserViewsCaseDetail = (
  test,
  expectedDocumentCount = 2,
) => {
  return it('Chambers user views case detail', async () => {
    test.setState('caseDetail', {});

    await test.runSequence('gotoCaseDetailSequence', {
      docketNumber: test.docketNumber,
    });

    expect(test.getState('currentPage')).toEqual('CaseDetailInternal');
    expect(test.getState('caseDetail.docketNumber')).toEqual(test.docketNumber);
    expect(test.getState('caseDetail.status')).toEqual(CASE_STATUS_TYPES.new);
    expect(test.getState('caseDetail.documents').length).toEqual(
      expectedDocumentCount,
    );
    expect(test.getState('caseDetail.associatedJudge')).toEqual(
      Case.CHIEF_JUDGE,
    );
  });
};
