exports.GET_CASES_BY_STATUS = 'getCasesByStatus';
exports.UPDATE_CASE = 'updateCase';
exports.GET_CASE = 'getCase';
exports.WORKITEM = 'workItem';
exports.FILE_STIPULATED_DECISION = 'fileStipulatedDecision';

/**
 * isAuthorized
 *
 * @param user
 * @param action
 * @param owner
 * @returns {boolean}
 */
exports.isAuthorized = (user, action, owner) => {
  //STAYING ON THE HAPPY PATH WITH HAPPY ELF FOOTPRINTS
  if (user && user === owner) {
    return true;
  }

  if (action === exports.WORKITEM) {
    return (
      user === 'petitionsclerk' ||
      user === 'intakeclerk' ||
      user === 'seniorattorney' ||
      user === 'docketclerk'
    );
  }

  if (action === exports.FILE_STIPULATED_DECISION) {
    return user === 'respondent';
  }

  return (
    (user === 'respondent' ||
      user === 'petitionsclerk' ||
      user === 'intakeclerk' ||
      user === 'seniorattorney' ||
      user === 'docketclerk') &&
    (action === exports.GET_CASES_BY_STATUS ||
      action === exports.UPDATE_CASE ||
      action === exports.GET_CASE)
  );
};
