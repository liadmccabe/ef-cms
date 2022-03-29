const {
  isAuthorized,
  ROLE_PERMISSIONS,
} = require('../../../authorization/authorizationClientService');
const { OutboxItem } = require('../../entities/OutboxItem');
const { ROLES } = require('../../entities/EntityConstants');
const { UnauthorizedError } = require('../../../errors/errors');

/**
 *
 * @param {object} applicationContext the application context
 * @param {object} providers the providers object
 * @param {string} providers.section the section to get the document qc served box
 * @returns {object} the work items in the section document served inbox
 */
exports.getDocumentQCServedForSectionInteractor = async (
  applicationContext,
  { section },
) => {
  const user = applicationContext.getCurrentUser();

  if (!isAuthorized(user, ROLE_PERMISSIONS.WORKITEM)) {
    throw new UnauthorizedError(
      'Unauthorized for getting completed work items',
    );
  }

  const workItems = await applicationContext
    .getPersistenceGateway()
    .getDocumentQCServedForSection({
      applicationContext,
      section,
    });

  const filteredWorkItems = workItems
    .filter(workItem =>
      user.role === ROLES.petitionsClerk ? !!workItem.section : true,
    )
    .map(workItem => new OutboxItem(workItem, { applicationContext }));

  return OutboxItem.validateRawCollection(filteredWorkItems, {
    applicationContext,
  });
};
