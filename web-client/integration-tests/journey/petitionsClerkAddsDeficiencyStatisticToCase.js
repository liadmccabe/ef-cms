import { Case } from '../../../shared/src/business/entities/cases/Case';

export const petitionsClerkAddsDeficiencyStatisticToCase = test => {
  return it('petitions clerk adds deficiency statistic to case after QCing', async () => {
    // set up case to allow statistics to be entered
    await test.runSequence('gotoPetitionQcSequence', {
      docketNumber: test.docketNumber,
      tab: 'IrsNotice',
    });
    await test.runSequence('updateFormValueSequence', {
      key: 'hasVerifiedIrsNotice',
      value: false,
    });
    await test.runSequence('updateFormValueSequence', {
      key: 'caseType',
      value: Case.CASE_TYPES_MAP.deficiency,
    });
    await test.runSequence('saveSavedCaseForLaterSequence');

    await test.runSequence('gotoAddDeficiencyStatisticsSequence', {
      docketNumber: test.docketNumber,
    });

    expect(test.getState('currentPage')).toEqual('AddDeficiencyStatistics');

    const statisticsBefore = test.getState('caseDetail.statistics');

    expect(test.getState('form')).toEqual({
      yearOrPeriod: 'Year',
    });

    await test.runSequence('updateFormValueSequence', {
      key: 'year',
      value: 2019,
    });

    await test.runSequence('updateFormValueSequence', {
      key: 'irsDeficiencyAmount',
      value: 1234,
    });
    await test.runSequence('updateFormValueSequence', {
      key: 'irsTotalPenalties',
      value: 0,
    });
    await test.runSequence('updateFormValueSequence', {
      key: 'determinationDeficiencyAmount',
      value: 987,
    });
    await test.runSequence('updateFormValueSequence', {
      key: 'determinationTotalPenalties',
      value: 22.33,
    });

    await test.runSequence('submitAddDeficiencyStatisticsSequence');

    expect(test.getState('validationErrors')).toEqual({});

    expect(test.getState('currentPage')).toEqual('CaseDetailInternal');

    const statisticsAfter = test.getState('caseDetail.statistics');

    expect(statisticsAfter.length).toEqual(statisticsBefore.length + 1);
  });
};
