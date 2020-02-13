import { closeFileUploadStatusModalAction } from '../actions/closeFileUploadStatusModalAction';
import { computeDateReceivedAction } from '../actions/DocketEntry/computeDateReceivedAction';
import { computeIrsNoticeDateAction } from '../actions/StartCaseInternal/computeIrsNoticeDateAction';
import { computeMailingDateAction } from '../actions/StartCaseInternal/computeMailingDateAction';
import { createCaseFromPaperAction } from '../actions/createCaseFromPaperAction';
import { getServeToIrsAlertSuccessAction } from '../actions/StartCaseInternal/getServeToIrsAlertSuccessAction';
import { navigateToCaseDetailAction } from '../actions/navigateToCaseDetailAction';
import { openFileUploadErrorModal } from '../actions/openFileUploadErrorModal';
import { openFileUploadStatusModalAction } from '../actions/openFileUploadStatusModalAction';
import { runBatchProcessAction } from '../actions/runBatchProcessAction';
import { sendPetitionToIRSHoldingQueueAction } from '../actions/sendPetitionToIRSHoldingQueueAction';
import { setAlertSuccessAction } from '../actions/setAlertSuccessAction';
import { setCaseAction } from '../actions/setCaseAction';
import { setPetitionIdAction } from '../actions/setPetitionIdAction';

export const serveToIrsSequence = [
  computeDateReceivedAction,
  computeMailingDateAction,
  computeIrsNoticeDateAction,
  openFileUploadStatusModalAction,
  createCaseFromPaperAction,
  {
    error: [openFileUploadErrorModal],
    success: [
      setCaseAction,
      setPetitionIdAction,
      closeFileUploadStatusModalAction,
      sendPetitionToIRSHoldingQueueAction,
      runBatchProcessAction,
      getServeToIrsAlertSuccessAction,
      setAlertSuccessAction,
      navigateToCaseDetailAction,
    ],
  },
];
