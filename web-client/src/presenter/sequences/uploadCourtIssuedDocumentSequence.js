import { clearAlertsAction } from '../actions/clearAlertsAction';
import { generateCourtIssuedDocumentTitleAction } from '../actions/CourtIssuedDocketEntry/generateCourtIssuedDocumentTitleAction';
import { getUploadCourtIssuedDocumentAlertSuccessAction } from '../actions/uploadCourtIssuedDocument/getUploadCourtIssuedDocumentAlertSuccessAction';
import { navigateToCaseDetailAction } from '../actions/navigateToCaseDetailAction';
import { openFileUploadErrorModal } from '../actions/openFileUploadErrorModal';
import { setAlertErrorAction } from '../actions/setAlertErrorAction';
import { setAlertSuccessAction } from '../actions/setAlertSuccessAction';
import { setCaseAction } from '../actions/setCaseAction';
import { setSaveAlertsForNavigationAction } from '../actions/setSaveAlertsForNavigationAction';
import { setValidationAlertErrorsAction } from '../actions/setValidationAlertErrorsAction';
import { setValidationErrorsAction } from '../actions/setValidationErrorsAction';
import { setWaitingForResponseAction } from '../actions/setWaitingForResponseAction';
import { setupUploadMetadataAction } from '../actions/uploadCourtIssuedDocument/setupUploadMetadataAction';
import { startShowValidationAction } from '../actions/startShowValidationAction';
import { stopShowValidationAction } from '../actions/stopShowValidationAction';
import { submitCourtIssuedOrderAction } from '../actions/CourtIssuedOrder/submitCourtIssuedOrderAction';
import { unsetWaitingForResponseAction } from '../actions/unsetWaitingForResponseAction';
import { uploadOrderFileAction } from '../actions/FileDocument/uploadOrderFileAction';
import { validateUploadCourtIssuedDocumentAction } from '../actions/uploadCourtIssuedDocument/validateUploadCourtIssuedDocumentAction';

export const uploadCourtIssuedDocument = ({
  completeAction,
  getAlertSuccessAction,
}) => [
  startShowValidationAction,
  validateUploadCourtIssuedDocumentAction,
  {
    error: [
      setAlertErrorAction,
      setValidationErrorsAction,
      setValidationAlertErrorsAction,
    ],
    success: [
      stopShowValidationAction,
      clearAlertsAction,
      setWaitingForResponseAction,
      uploadOrderFileAction,
      {
        error: [openFileUploadErrorModal],
        success: [
          generateCourtIssuedDocumentTitleAction,
          setupUploadMetadataAction,
          submitCourtIssuedOrderAction,
          setCaseAction,
          getAlertSuccessAction,
          setAlertSuccessAction,
          setSaveAlertsForNavigationAction,
          completeAction,
        ],
      },
      unsetWaitingForResponseAction,
    ],
  },
];

export const uploadCourtIssuedDocumentSequence = [
  uploadCourtIssuedDocument({
    completeAction: navigateToCaseDetailAction,
    getAlertSuccessAction: getUploadCourtIssuedDocumentAlertSuccessAction,
  }),
];
