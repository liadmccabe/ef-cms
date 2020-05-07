import { clearFormsAction } from '../actions/clearFormsAction';
import { getCaseAction } from '../actions/getCaseAction';
import { setCaseAction } from '../actions/setCaseAction';
import { setCaseOnFormAction } from '../actions/setCaseOnFormAction';
import { setCurrentPageAction } from '../actions/setCurrentPageAction';
import { setFormForCaseAction } from '../actions/setFormForCaseAction';
import { stopShowValidationAction } from '../actions/stopShowValidationAction';

export const gotoPetitionQcSequence = [
  setCurrentPageAction('Interstitial'),
  clearFormsAction,
  stopShowValidationAction,
  getCaseAction,
  setCaseAction,
  setCaseOnFormAction,
  setFormForCaseAction,
  setCurrentPageAction('PetitionQc'),
];
