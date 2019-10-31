const {
  isAuthorized,
  START_PAPER_CASE,
} = require('../../authorization/authorizationClientService');
const { Case } = require('../entities/cases/Case');
const { Document } = require('../entities/Document');
const { Message } = require('../entities/Message');
const { replaceBracketed } = require('../utilities/replaceBracketed');
const { UnauthorizedError } = require('../../errors/errors');
const { WorkItem } = require('../entities/WorkItem');

const addPetitionDocumentWithWorkItemToCase = ({
  applicationContext,
  caseToAdd,
  documentEntity,
  user,
}) => {
  const message = `${documentEntity.documentType} filed by ${documentEntity.filedBy} is ready for review.`;

  const workItemEntity = new WorkItem(
    {
      assigneeId: user.userId,
      assigneeName: user.name,
      caseId: caseToAdd.caseId,
      caseStatus: caseToAdd.status,
      caseTitle: Case.getCaseCaptionNames(Case.getCaseCaption(caseToAdd)),
      docketNumber: caseToAdd.docketNumber,
      docketNumberSuffix: caseToAdd.docketNumberSuffix,
      document: {
        ...documentEntity.toRawObject(),
        createdAt: documentEntity.createdAt,
      },
      isInitializeCase: documentEntity.isPetitionDocument(),
      isQC: true,
      section: user.section,
      sentBy: user.name,
      sentBySection: user.section,
      sentByUserId: user.userId,
    },
    { applicationContext },
  );

  const newMessage = new Message(
    {
      from: user.name,
      fromUserId: user.userId,
      message,
      to: user.name,
      toUserId: user.userId,
    },
    { applicationContext },
  );

  workItemEntity.addMessage(newMessage);

  documentEntity.addWorkItem(workItemEntity);
  caseToAdd.addDocument(documentEntity);

  return {
    message: newMessage,
    workItem: workItemEntity,
  };
};

/**
 *
 * @param {object} providers the providers object
 * @param {object} providers.applicationContext the application context
 * @param {string} providers.ownershipDisclosureFileId the id of the ownership disclosure file
 * @param {string} providers.petitionFileId the id of the petition file
 * @param {string} providers.petitionMetadata the petition metadata
 * @param {string} providers.requestForPlaceOfTrialFileId the id of the request for place of trial file
 * @param {string} providers.stinFileId the id of the stin file
 * @returns {object} the created case
 */
exports.createCaseFromPaperInteractor = async ({
  applicationContext,
  applicationForWaiverOfFilingFeeFileId,
  ownershipDisclosureFileId,
  petitionFileId,
  petitionMetadata,
  requestForPlaceOfTrialFileId,
  stinFileId,
}) => {
  const authorizedUser = applicationContext.getCurrentUser();

  if (!isAuthorized(authorizedUser, START_PAPER_CASE)) {
    throw new UnauthorizedError('Unauthorized');
  }

  const user = await applicationContext
    .getPersistenceGateway()
    .getUserById({ applicationContext, userId: authorizedUser.userId });

  const { CaseInternal } = applicationContext.getEntityConstructors();
  const petitionEntity = new CaseInternal({
    ...petitionMetadata,
    applicationForWaiverOfFilingFeeFileId,
    ownershipDisclosureFileId,
    petitionFileId,
    stinFileId,
  }).validate();

  // invoke the createCase interactor
  const docketNumber = await applicationContext.docketNumberGenerator.createDocketNumber(
    {
      applicationContext,
    },
  );

  const caseToAdd = new Case(
    {
      userId: user.userId,
      ...petitionEntity.toRawObject(),
      docketNumber,
      isPaper: true,
    },
    {
      applicationContext,
    },
  );

  caseToAdd.caseCaption = petitionEntity.caseCaption;

  let partySecondary = false;
  if (
    petitionMetadata.contactSecondary &&
    petitionMetadata.contactSecondary.name
  ) {
    partySecondary = true;
  }

  const petitionDocumentEntity = new Document(
    {
      createdAt: caseToAdd.receivedAt,
      documentId: petitionFileId,
      documentType: Document.INITIAL_DOCUMENT_TYPES.petition.documentType,
      eventCode: Document.INITIAL_DOCUMENT_TYPES.petition.eventCode,
      isPaper: true,
      partyPrimary: true,
      partySecondary,
      receivedAt: caseToAdd.receivedAt,
      userId: user.userId,
    },
    { applicationContext },
  );
  petitionDocumentEntity.generateFiledBy(caseToAdd);

  const {
    message: newMessage,
    workItem: newWorkItem,
  } = addPetitionDocumentWithWorkItemToCase({
    applicationContext,
    caseToAdd,
    documentEntity: petitionDocumentEntity,
    user,
  });

  if (applicationForWaiverOfFilingFeeFileId) {
    let {
      documentTitle,
    } = Document.INITIAL_DOCUMENT_TYPES.applicationForWaiverOfFilingFee;

    const applicationForWaiverOfFilingFeeDocumentEntity = new Document(
      {
        createdAt: caseToAdd.receivedAt,
        documentId: applicationForWaiverOfFilingFeeFileId,
        documentTitle,
        documentType:
          Document.INITIAL_DOCUMENT_TYPES.applicationForWaiverOfFilingFee
            .documentType,
        eventCode:
          Document.INITIAL_DOCUMENT_TYPES.applicationForWaiverOfFilingFee
            .eventCode,
        isPaper: true,
        partyPrimary: true,
        partySecondary,
        receivedAt: caseToAdd.receivedAt,
        userId: user.userId,
      },
      { applicationContext },
    );

    applicationForWaiverOfFilingFeeDocumentEntity.generateFiledBy(caseToAdd);
    caseToAdd.addDocument(applicationForWaiverOfFilingFeeDocumentEntity);
  }

  if (requestForPlaceOfTrialFileId) {
    let {
      documentTitle,
    } = Document.INITIAL_DOCUMENT_TYPES.requestForPlaceOfTrial;
    if (caseToAdd.preferredTrialCity) {
      documentTitle = replaceBracketed(
        documentTitle,
        caseToAdd.preferredTrialCity,
      );
    }

    const requestForPlaceOfTrialDocumentEntity = new Document(
      {
        createdAt: caseToAdd.receivedAt,
        documentId: requestForPlaceOfTrialFileId,
        documentTitle,
        documentType:
          Document.INITIAL_DOCUMENT_TYPES.requestForPlaceOfTrial.documentType,
        eventCode:
          Document.INITIAL_DOCUMENT_TYPES.requestForPlaceOfTrial.eventCode,
        isPaper: true,
        partyPrimary: true,
        partySecondary,
        receivedAt: caseToAdd.receivedAt,
        userId: user.userId,
      },
      { applicationContext },
    );
    requestForPlaceOfTrialDocumentEntity.generateFiledBy(caseToAdd);
    caseToAdd.addDocument(requestForPlaceOfTrialDocumentEntity);
  }

  if (stinFileId) {
    const stinDocumentEntity = new Document(
      {
        createdAt: caseToAdd.receivedAt,
        documentId: stinFileId,
        documentType: Document.INITIAL_DOCUMENT_TYPES.stin.documentType,
        eventCode: Document.INITIAL_DOCUMENT_TYPES.stin.eventCode,
        isPaper: true,
        partyPrimary: true,
        partySecondary,
        receivedAt: caseToAdd.receivedAt,
        userId: user.userId,
      },
      { applicationContext },
    );
    stinDocumentEntity.generateFiledBy(caseToAdd);
    caseToAdd.addDocumentWithoutDocketRecord(stinDocumentEntity);
  }

  if (ownershipDisclosureFileId) {
    const odsDocumentEntity = new Document(
      {
        createdAt: caseToAdd.receivedAt,
        documentId: ownershipDisclosureFileId,
        documentType:
          Document.INITIAL_DOCUMENT_TYPES.ownershipDisclosure.documentType,
        eventCode:
          Document.INITIAL_DOCUMENT_TYPES.ownershipDisclosure.eventCode,
        isPaper: true,
        partyPrimary: true,
        partySecondary,
        receivedAt: caseToAdd.receivedAt,
        userId: user.userId,
      },
      { applicationContext },
    );
    odsDocumentEntity.generateFiledBy(caseToAdd);
    caseToAdd.addDocument(odsDocumentEntity);
  }

  await applicationContext.getPersistenceGateway().createCase({
    applicationContext,
    caseToCreate: caseToAdd.validate().toRawObject(),
  });

  await applicationContext.getPersistenceGateway().saveWorkItemForPaper({
    applicationContext,
    messageId: newMessage.messageId,
    workItem: newWorkItem.validate().toRawObject(),
  });

  return new Case(caseToAdd, { applicationContext }).toRawObject();
};