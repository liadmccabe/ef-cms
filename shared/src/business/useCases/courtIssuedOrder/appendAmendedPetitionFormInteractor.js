// const {
//   AMENDED_PETITION_FORM_NAME,
// } = require('../../entities/EntityConstants');

const {
  isAuthorized,
  ROLE_PERMISSIONS,
} = require('../../../authorization/authorizationClientService');
const { UnauthorizedError } = require('../../../errors/errors');

exports.appendAmendedPetitionFormInteractor = async (
  applicationContext,
  { docketEntryId },
) => {
  const authorizedUser = applicationContext.getCurrentUser();

  const hasPermission = isAuthorized(
    authorizedUser,
    ROLE_PERMISSIONS.EDIT_ORDER,
  );

  if (!hasPermission) {
    throw new UnauthorizedError('Unauthorized');
  }

  // const { Body: amendedPetitionFormData } = await applicationContext
  //   .getStorageClient()
  //   .getObject({
  //     Bucket: applicationContext.environment.documentsBucketName,
  //     Key: AMENDED_PETITION_FORM_NAME,
  //   })
  //   .promise();
  // return await applicationContext.getUtilities().combineTwoPdfs({
  //   applicationContext,
  //   firstPdf: new Uint8Array(orderContent),
  //   secondPdf: new Uint8Array(amendedPetitionFormData),
  // });
};
