import { clearErrorAlertsAction } from '../actions/clearErrorAlertsAction';
import { clearSelectedWorkItemsAction } from '../actions/clearSelectedWorkItemsAction';
import { closeMobileMenuAction } from '../actions/closeMobileMenuAction';
import { getConstants } from '../../getConstants';
import { getInboxMessagesForUserAction } from '../actions/getInboxMessagesForUserAction';
import { getJudgeForCurrentUserAction } from '../actions/getJudgeForCurrentUserAction';
import { getMaintenanceModeAction } from '../actions/getMaintenanceModeAction';
import { getOpenAndClosedCasesByUserAction } from '../actions/CaseConsolidation/getOpenAndClosedCasesByUserAction';
import { getTrialSessionsAction } from '../actions/TrialSession/getTrialSessionsAction';
import { getUserAction } from '../actions/getUserAction';
import { gotoMaintenanceSequence } from './gotoMaintenanceSequence';
import { isLoggedInAction } from '../actions/isLoggedInAction';
import { navigateToMessagesAction } from '../actions/navigateToMessagesAction';
import { navigateToSectionDocumentQCAction } from '../actions/navigateToSectionDocumentQCAction';
import { redirectToCognitoAction } from '../actions/redirectToCognitoAction';
import { runPathForUserRoleAction } from '../actions/runPathForUserRoleAction';
import { setCasesAction } from '../actions/setCasesAction';
import { setCurrentPageAction } from '../actions/setCurrentPageAction';
import { setDefaultCaseTypeToDisplayAction } from '../actions/setDefaultCaseTypeToDisplayAction';
import { setJudgeUserAction } from '../actions/setJudgeUserAction';
import { setMessageInboxPropsAction } from '../actions/setMessageInboxPropsAction';
import { setMessagesAction } from '../actions/setMessagesAction';
import { setShowModalFactoryAction } from '../actions/setShowModalFactoryAction';
import { setTrialSessionsAction } from '../actions/TrialSession/setTrialSessionsAction';
import { setUserAction } from '../actions/setUserAction';
import { startWebSocketConnectionAction } from '../actions/WebSocketConnection/startWebSocketConnectionAction';
import { takePathForRoles } from './takePathForRoles';

const { USER_ROLES } = getConstants();

const proceedToMessages = [navigateToMessagesAction];

const getMessages = [getInboxMessagesForUserAction, setMessagesAction];

const goToDashboard = [
  setCurrentPageAction('Interstitial'),
  closeMobileMenuAction,
  getUserAction,
  setUserAction,
  clearSelectedWorkItemsAction,
  clearErrorAlertsAction,
  getMaintenanceModeAction,
  {
    maintenanceOff: [
      startWebSocketConnectionAction,
      {
        error: [setShowModalFactoryAction('WebSocketErrorModal')],
        success: [
          runPathForUserRoleAction,
          {
            ...takePathForRoles(
              [
                USER_ROLES.adc,
                USER_ROLES.admin,
                USER_ROLES.admissionsClerk,
                USER_ROLES.clerkOfCourt,
                USER_ROLES.docketClerk,
                USER_ROLES.floater,
                USER_ROLES.petitionsClerk,
                USER_ROLES.reportersOffice,
                USER_ROLES.trialClerk,
              ],
              proceedToMessages,
            ),
            chambers: [
              setMessageInboxPropsAction,
              getMessages,
              getJudgeForCurrentUserAction,
              setJudgeUserAction,
              getTrialSessionsAction,
              setTrialSessionsAction,
              setCurrentPageAction('DashboardChambers'),
            ],
            general: [navigateToSectionDocumentQCAction],
            inactivePractitioner: [setCurrentPageAction('DashboardInactive')],
            irsPractitioner: [
              setDefaultCaseTypeToDisplayAction,
              getOpenAndClosedCasesByUserAction,
              setCasesAction,
              setCurrentPageAction('DashboardRespondent'),
            ],
            irsSuperuser: [setCurrentPageAction('DashboardIrsSuperuser')],
            judge: [
              setMessageInboxPropsAction,
              getMessages,
              getTrialSessionsAction,
              setTrialSessionsAction,
              setCurrentPageAction('DashboardJudge'),
            ],
            petitioner: [
              setDefaultCaseTypeToDisplayAction,
              getOpenAndClosedCasesByUserAction,
              setCasesAction,
              setCurrentPageAction('DashboardPetitioner'),
            ],
            privatePractitioner: [
              setDefaultCaseTypeToDisplayAction,
              getOpenAndClosedCasesByUserAction,
              setCasesAction,
              setCurrentPageAction('DashboardPractitioner'),
            ],
          },
        ],
      },
    ],
    maintenanceOn: [gotoMaintenanceSequence],
  },
];

export const gotoDashboardSequence = [
  isLoggedInAction,
  {
    isLoggedIn: [goToDashboard],
    unauthorized: [redirectToCognitoAction],
  },
];
