import clearAlerts from '../actions/clearAlertsAction';
import getCasesByUser from '../actions/getCasesByUserAction';
import getCasesNew from '../actions/getCasesNewAction';
import getUserRole from '../actions/getUserRoleAction';
import getUsersInSection from '../actions/getUsersInSectionAction';
import getWorkItemsByUser from '../actions/getWorkItemsByUserAction';
import getWorkItemsForSection from '../actions/getWorkItemsForSectionAction';
import isLoggedIn from '../actions/isLoggedInAction';
import navigateToLogin from '../actions/navigateToLoginAction';
import setAlertError from '../actions/setAlertErrorAction';
import setCases from '../actions/setCasesAction';
import setCurrentPage from '../actions/setCurrentPageAction';
import setPath from '../actions/setPathAction';
import setSectionWorkQueue from '../actions/setSectionWorkQueueAction';
import setUsers from '../actions/setUsersAction';
import setWorkItems from '../actions/setWorkItemsAction';
import setFormSubmitting from '../actions/setFormSubmittingAction';
import unsetFormSubmitting from '../actions/unsetFormSubmittingAction';

const goToDashboard = [
  setFormSubmitting,
  getUserRole,
  {
    taxpayer: [
      getCasesByUser,
      {
        error: [setAlertError],
        success: [setCases],
      },
      setCurrentPage('DashboardPetitioner'),
    ],
    petitionsclerk: [
      clearAlerts,
      getCasesNew,
      {
        error: [setAlertError],
        success: [setCases],
      },
      setCurrentPage('DashboardPetitionsClerk'),
    ],
    docketclerk: [
      clearAlerts,
      getUsersInSection('docket'),
      {
        error: [setAlertError],
        success: [setUsers],
      },
      getWorkItemsForSection('docket'),
      setSectionWorkQueue,
      getWorkItemsByUser,
      setWorkItems,
      setCurrentPage('DashboardDocketClerk'),
    ],
    intakeclerk: [clearAlerts, setCurrentPage('DashboardIntakeClerk')],
    respondent: [
      clearAlerts,
      getCasesByUser,
      {
        error: [setAlertError],
        success: [setCases],
      },
      setCurrentPage('DashboardRespondent'),
    ],
    seniorattorney: [
      clearAlerts,
      getWorkItemsByUser,
      setWorkItems,
      setCurrentPage('DashboardSeniorAttorney'),
    ],
  },
  unsetFormSubmitting,
];

export default [
  isLoggedIn,
  {
    unauthorized: [setPath, navigateToLogin],
    isLoggedIn: goToDashboard,
  },
];
