import { cloneDeep } from 'lodash';
import { state } from 'cerebral';

/**
 * sets props.caseDetail on state.form
 *
 * @param {object} providers the providers object
 * @param {object} providers.props the cerebral props object
 * @param {object} providers.store the cerebral store
 */
export const setCaseOnFormAction = async ({
  applicationContext,
  props,
  store,
}) => {
  const caseDetail = cloneDeep(props.caseDetail);
  store.set(state.form, caseDetail);

  const contactPrimary = applicationContext
    .getUtilities()
    .getContactPrimary(caseDetail);
  store.set(state.form.contactPrimary, contactPrimary);
  const contactSecondary = applicationContext
    .getUtilities()
    .getContactSecondary(caseDetail);
  store.set(state.form.contactSecondary, contactSecondary);
};
