import { state } from 'cerebral';

/**
 * initiates the document to be served
 *
 * @param {object} providers the providers object
 * @param {object} providers.applicationContext the application context used for getting the getUser use case
 * @param {Function} providers.get the cerebral get function
 * @param {object} providers.router the riot.router object containing the createObjectURL function
 * @returns {object} the user
 */
export const setShowAllLocationsFalseAction = async ({ store }) => {
  store.set(state.modal.showAllLocations, false);
};
