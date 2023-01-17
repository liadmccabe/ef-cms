import { clearAlertsAction } from '../actions/clearAlertsAction';
import { clearModalStateAction } from '../actions/clearModalStateAction';
import { computeCertificateOfServiceFormDateAction } from '../actions/FileDocument/computeCertificateOfServiceFormDateAction';
import { generateTitleForPaperFilingAction } from '../actions/FileDocument/generateTitleForPaperFilingAction';
import { getComputedFormDateFactoryAction } from '../actions/getComputedFormDateFactoryAction';
import { getConsolidatedCasesByCaseAction } from '../actions/CaseConsolidation/getConsolidatedCasesByCaseAction';
import { getConstants } from '../../getConstants';
import { getFeatureFlagValueFactoryAction } from '../actions/getFeatureFlagValueFactoryAction';
import { setComputeFormDateFactoryAction } from '../actions/setComputeFormDateFactoryAction';
import { setConsolidatedCasesForCaseAction } from '../actions/CaseConsolidation/setConsolidatedCasesForCaseAction';
import { setDocumentIsRequiredAction } from '../actions/DocketEntry/setDocumentIsRequiredAction';
import { setFilersFromFilersMapAction } from '../actions/setFilersFromFilersMapAction';
import { setMultiDocketingCheckboxesAction } from '../actions/CaseConsolidation/setMultiDocketingCheckboxesAction';
import { setShowModalFactoryAction } from '../actions/setShowModalFactoryAction';
import { setValidationAlertErrorsAction } from '../actions/setValidationAlertErrorsAction';
import { setValidationErrorsAction } from '../actions/setValidationErrorsAction';
import { shouldSetupConsolidatedCasesAction } from '../actions/CaseConsolidation/shouldSetupConsolidatedCasesAction';
import { startShowValidationAction } from '../actions/startShowValidationAction';
import { suggestSaveForLaterValidationAction } from '../actions/DocketEntry/suggestSaveForLaterValidationAction';
import { validateDocketEntryAction } from '../actions/DocketEntry/validateDocketEntryAction';

export const openConfirmPaperServiceModalSequence = [
  getFeatureFlagValueFactoryAction(
    getConstants().ALLOWLIST_FEATURE_FLAGS.MULTI_DOCKETABLE_PAPER_FILINGS,
    true,
  ),
  clearAlertsAction,
  clearModalStateAction,
  startShowValidationAction,
  getComputedFormDateFactoryAction('serviceDate'),
  setComputeFormDateFactoryAction('serviceDate'),
  computeCertificateOfServiceFormDateAction,
  getComputedFormDateFactoryAction('dateReceived'),
  setComputeFormDateFactoryAction('dateReceived'),
  shouldSetupConsolidatedCasesAction,
  {
    no: [],
    yes: [
      getConsolidatedCasesByCaseAction,
      setConsolidatedCasesForCaseAction,
      setMultiDocketingCheckboxesAction,
    ],
  },
  setDocumentIsRequiredAction,
  generateTitleForPaperFilingAction,
  setFilersFromFilersMapAction,
  validateDocketEntryAction,
  {
    error: [
      suggestSaveForLaterValidationAction,
      setValidationErrorsAction,
      setValidationAlertErrorsAction,
    ],
    success: [
      setShowModalFactoryAction('ConfirmInitiatePaperFilingServiceModal'),
    ],
  },
];
