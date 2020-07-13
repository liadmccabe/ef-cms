import { state } from 'cerebral';

/**
 * deletes the statistic from the case
 *
 * @param {object} providers the providers object
 * @param {object} providers.get the cerebral get function
 * @param {object} providers.applicationContext the applicationContext
 * @param {object} providers.path the next object in the path
 * @returns {Promise<*>} the success or error path
 */
export const deleteDeficiencyStatisticsAction = async ({
  applicationContext,
  get,
  path,
}) => {
  const { caseId } = get(state.caseDetail);
  const { lastDateOfPeriod, statisticId, year, yearOrPeriod } = get(state.form);

  try {
    await applicationContext.getUseCases().deleteDeficiencyStatisticInteractor({
      applicationContext,
      caseId,
      statisticId,
    });

    let successMessageDate;

    if (yearOrPeriod === 'Year') {
      successMessageDate = year;
    } else {
      successMessageDate = applicationContext
        .getUtilities()
        .formatDateString(lastDateOfPeriod, 'MMDDYY');
    }

    return path.success({
      alertSuccess: {
        message: `${successMessageDate} statistics deleted.`,
      },
    });
  } catch (e) {
    return path.error({
      alertError: {
        title: 'Errors were found. Please correct your form and resubmit.',
      },
    });
  }
};
