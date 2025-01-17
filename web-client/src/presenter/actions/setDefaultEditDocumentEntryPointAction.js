import { state } from 'cerebral';

/**
 * sets default editDocumentEntryPoint
 *
 * @param {object} providers the providers object
 * @param {object} providers.store the cerebral store used for setting state.editDocumentEntryPoint
 */
export const setDefaultEditDocumentEntryPointAction = ({ store }) => {
  store.set(state.editDocumentEntryPoint, 'CaseDetail');
};
