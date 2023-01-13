import { Case, isLeadCase } from '../../entities/cases/Case';
import { DOCUMENT_RELATIONSHIPS } from '../../entities/EntityConstants';
import { DocketEntry } from '../../entities/DocketEntry';
import { NotFoundError, UnauthorizedError } from '../../../errors/errors';
import {
  ROLE_PERMISSIONS,
  isAuthorized,
} from '../../../authorization/authorizationClientService';

interface IEditPaperFilingRequest {
  documentMetadata: any;
  isSavingForLater: boolean;
  docketEntryId: string;
  consolidatedGroupDocketNumbers?: string[];
}

/**
 *
 * @param {object} applicationContext the application context
 * @param {object} providers the providers object
 * @param {string[]} providers.consolidatedGroupDocketNumbers list of consolidatedDocketNumbers to file docket entry on
 * @param {object} providers.documentMetadata the document metadata
 * @param {Boolean} providers.isSavingForLater true if saving for later, false otherwise
 * @param {string} providers.docketEntryId the id of the docket entry
 * @returns {object} The paper service PDF url
 */
export const editPaperFilingInteractor = async (
  applicationContext: IApplicationContext,
  request: IEditPaperFilingRequest,
): Promise<{ paperServicePdfUrl?: string }> => {
  request.consolidatedGroupDocketNumbers =
    request.consolidatedGroupDocketNumbers || [];

  const { caseEntity, docketEntryEntity } = await getDocketEntryToEdit({
    applicationContext,
    docketEntryId: request.docketEntryId,
    docketNumber: request.documentMetadata.docketNumber,
  });

  validateDocketEntryCanBeEdited({
    docketEntry: docketEntryEntity,
    docketEntryId: request.docketEntryId,
  });

  const editPaperFilingStrategy = getEditPaperFilingStrategy({
    consolidatedGroupDocketNumbers: request.consolidatedGroupDocketNumbers,
    isSavingForLater: request.isSavingForLater,
  });

  const paperServicePdfUrl = await editPaperFilingStrategy({
    applicationContext,
    caseEntity,
    docketEntryEntity,
    request,
  });

  return paperServicePdfUrl;
};

const getEditPaperFilingStrategy = ({
  consolidatedGroupDocketNumbers,
  isSavingForLater,
}: {
  isSavingForLater: boolean;
  consolidatedGroupDocketNumbers?: string[];
}) => {
  if (isSavingForLater) {
    return saveForLaterStrategy;
  }

  if (consolidatedGroupDocketNumbers.length) {
    return multiDocketServeStrategy;
  }

  if (consolidatedGroupDocketNumbers.length === 0) {
    return singleDocketServeStrategy;
  }

  throw new Error('No strategy found to edit paper filing');
};

const saveForLaterStrategy = async ({
  applicationContext,
  caseEntity,
  docketEntryEntity,
  request,
}: {
  applicationContext: IApplicationContext;
  request: IEditPaperFilingRequest;
  caseEntity: TCaseEntity;
  docketEntryEntity: TDocketEntryEntity;
}): Promise<{ paperServicePdfUrl?: string }> => {
  const authorizedUser = authorizeRequest(applicationContext);

  // TODO: do we need this???
  const user = await applicationContext
    .getPersistenceGateway()
    .getUserById({ applicationContext, userId: authorizedUser.userId });

  const updatedDocketEntryEntity = await updateDocketEntry({
    applicationContext,
    caseEntity,
    docketEntry: docketEntryEntity,
    documentMetadata: request.documentMetadata,
    userId: user.userId,
  });

  await updateAndSaveWorkItem({
    applicationContext,
    docketEntry: updatedDocketEntryEntity,
    user,
  });

  await applicationContext.getUseCaseHelpers().updateCaseAndAssociations({
    applicationContext,
    caseToUpdate: caseEntity,
  });

  return { paperServicePdfUrl: undefined };
};

const multiDocketServeStrategy = async ({
  applicationContext,
  caseEntity,
  docketEntryEntity,
  request,
}: {
  applicationContext: IApplicationContext;
  caseEntity: TCaseEntity;
  docketEntryEntity: TDocketEntryEntity;
  request: IEditPaperFilingRequest;
}): Promise<{ paperServicePdfUrl?: string }> => {
  const authorizedUser = authorizeRequest(applicationContext);

  validateDocketEntryCanBeServed({
    documentMetadata: request.documentMetadata,
  });

  let consolidatedCaseRecords = await Promise.all(
    request.consolidatedGroupDocketNumbers.map(consolidatedGroupDocketNumber =>
      applicationContext.getPersistenceGateway().getCaseByDocketNumber({
        applicationContext,
        docketNumber: consolidatedGroupDocketNumber,
      }),
    ),
  );

  let consolidatedCaseEntities = consolidatedCaseRecords.map(
    consolidatedCase => new Case(consolidatedCase, { applicationContext }),
  );

  validateMultiDocketPaperFilingRequest({
    caseEntity,
    consolidatedCases: consolidatedCaseEntities,
  });

  const caseEntitiesToFileOn = [caseEntity, ...consolidatedCaseEntities];

  const paperServicePdfUrl = await doAllTheServyStuff({
    applicationContext,
    caseEntitiesToFileOn,
    docketEntryEntity,
    documentMetadata: request.documentMetadata,
    subjectCaseEntity: caseEntity,
    userId: authorizedUser.userId,
  });

  return paperServicePdfUrl;
};

const singleDocketServeStrategy = async ({
  applicationContext,
  caseEntity,
  docketEntryEntity,
  request,
}: {
  applicationContext: IApplicationContext;
  caseEntity: TCaseEntity;
  docketEntryEntity: TDocketEntryEntity;
  request: IEditPaperFilingRequest;
}): Promise<{ paperServicePdfUrl?: string }> => {
  const authorizedUser = authorizeRequest(applicationContext);

  validateDocketEntryCanBeServed({
    documentMetadata: request.documentMetadata,
  });

  const caseEntitiesToFileOn = [caseEntity];

  const paperServicePdfUrl = await doAllTheServyStuff({
    applicationContext,
    caseEntitiesToFileOn,
    docketEntryEntity,
    documentMetadata: request.documentMetadata,
    subjectCaseEntity: caseEntity,
    userId: authorizedUser.userId,
  });

  return paperServicePdfUrl;
};

// *********************************** Small Helper Functions ***********************************
const doAllTheServyStuff = async ({
  applicationContext,
  caseEntitiesToFileOn,
  docketEntryEntity,
  documentMetadata,
  subjectCaseEntity,
  userId,
}: {
  applicationContext: IApplicationContext;
  caseEntitiesToFileOn: TCaseEntity[];
  docketEntryEntity: TDocketEntryEntity;
  documentMetadata: any;
  userId: string;
  subjectCaseEntity: TCaseEntity;
}) => {
  await applicationContext
    .getPersistenceGateway()
    .updateDocketEntryPendingServiceStatus({
      applicationContext,
      docketEntryId: docketEntryEntity.docketEntryId,
      docketNumber: subjectCaseEntity.docketNumber,
      status: true,
    });

  try {
    // TODO: do we need this???
    const user = await applicationContext
      .getPersistenceGateway()
      .getUserById({ applicationContext, userId });

    const updatedDocketEntryEntity = await updateDocketEntry({
      applicationContext,
      caseEntity: subjectCaseEntity,
      docketEntry: docketEntryEntity,
      documentMetadata,
      userId: user.userId,
    });

    const paperServicePdfUrl = await serveDocketEntryOnCases({
      applicationContext,
      caseEntitiesToFileOn,
      docketEntryEntity: updatedDocketEntryEntity,
      subjectCaseDocketNumber: subjectCaseEntity.docketNumber,
      user,
    });

    await applicationContext
      .getPersistenceGateway()
      .updateDocketEntryPendingServiceStatus({
        applicationContext,
        docketEntryId: docketEntryEntity.docketEntryId,
        docketNumber: subjectCaseEntity.docketNumber,
        status: false,
      });

    return paperServicePdfUrl;
  } catch (e) {
    await applicationContext
      .getPersistenceGateway()
      .updateDocketEntryPendingServiceStatus({
        applicationContext,
        docketEntryId: docketEntryEntity.docketEntryId,
        docketNumber: subjectCaseEntity.docketNumber,
        status: false,
      });

    throw e;
  }
};

const validateDocketEntryCanBeEdited = ({
  docketEntry,
  docketEntryId,
}: {
  docketEntry: TDocketEntryEntity;
  docketEntryId: string;
}): void => {
  console.log('I AM DOCKET ENTRY: ', docketEntry);
  if (!docketEntry) {
    throw new NotFoundError(`Docket entry ${docketEntryId} was not found.`);
  } else if (docketEntry.servedAt) {
    throw new Error('Docket entry has already been served');
  } else if (docketEntry.isPendingService) {
    throw new Error('Docket entry is already being served');
  }
};

const validateDocketEntryCanBeServed = ({
  documentMetadata,
}: {
  documentMetadata: any;
}): void => {
  if (!documentMetadata.isFileAttached) {
    throw new Error('Docket entry cannot be served without a file attached');
  }
};

const validateMultiDocketPaperFilingRequest = ({
  caseEntity,
  consolidatedCases,
}: {
  caseEntity: Case;
  consolidatedCases: Case[];
}): void => {
  if (!isLeadCase(caseEntity)) {
    throw new Error('Cannot multi-docket on a case that is not consolidated');
  }

  consolidatedCases.forEach(consolidatedCase => {
    if (consolidatedCase.leadDocketNumber !== caseEntity.docketNumber) {
      throw new Error('Cannot multi-docket on a case that is not consolidated');
    }
  });
};

const authorizeRequest = (applicationContext: IApplicationContext): TUser => {
  const authorizedUser = applicationContext.getCurrentUser();

  if (!isAuthorized(authorizedUser, ROLE_PERMISSIONS.DOCKET_ENTRY)) {
    throw new UnauthorizedError('Unauthorized');
  }

  return authorizedUser;
};

const updateDocketEntry = async ({
  applicationContext,
  caseEntity,
  docketEntry,
  documentMetadata,
  userId,
}: {
  applicationContext: IApplicationContext;
  caseEntity: TCaseEntity;
  docketEntry: TDocketEntryEntity;
  documentMetadata: any;
  userId: string;
}): Promise<TDocketEntryEntity> => {
  const editableFields = {
    addToCoversheet: documentMetadata.addToCoversheet,
    additionalInfo: documentMetadata.additionalInfo,
    additionalInfo2: documentMetadata.additionalInfo2,
    attachments: documentMetadata.attachments,
    certificateOfService: documentMetadata.certificateOfService,
    certificateOfServiceDate: documentMetadata.certificateOfServiceDate,
    documentTitle: documentMetadata.documentTitle,
    documentType: documentMetadata.documentType,
    eventCode: documentMetadata.eventCode,
    filers: documentMetadata.filers,
    freeText: documentMetadata.freeText,
    freeText2: documentMetadata.freeText2,
    hasOtherFilingParty: documentMetadata.hasOtherFilingParty,
    isFileAttached: documentMetadata.isFileAttached,
    lodged: documentMetadata.lodged,
    mailingDate: documentMetadata.mailingDate,
    objections: documentMetadata.objections,
    ordinalValue: documentMetadata.ordinalValue,
    otherFilingParty: documentMetadata.otherFilingParty,
    partyIrsPractitioner: documentMetadata.partyIrsPractitioner,
    pending: documentMetadata.pending,
    receivedAt: documentMetadata.receivedAt,
    scenario: documentMetadata.scenario,
    serviceDate: documentMetadata.serviceDate,
  };

  const updatedDocketEntryEntity: TDocketEntryEntity = new DocketEntry(
    {
      ...docketEntry,
      ...editableFields,
      editState: JSON.stringify(editableFields),
      isOnDocketRecord: true,
      relationship: DOCUMENT_RELATIONSHIPS.PRIMARY,
      userId,
    },
    { applicationContext, petitioners: caseEntity.petitioners },
  );

  if (editableFields.isFileAttached) {
    updatedDocketEntryEntity.numberOfPages = await applicationContext
      .getUseCaseHelpers()
      .countPagesInDocument({
        applicationContext,
        docketEntryId: docketEntry.docketEntryId,
      });
  }

  caseEntity.updateDocketEntry(updatedDocketEntryEntity);

  return updatedDocketEntryEntity;
};

const updateAndSaveWorkItem = async ({
  applicationContext,
  docketEntry,
  user,
}: {
  applicationContext: IApplicationContext;
  docketEntry: TDocketEntryEntity;
  user: TUser;
}): Promise<void> => {
  const { workItem } = docketEntry;
  workItem.docketEntry = docketEntry.toRawObject();
  workItem.inProgress = true;

  workItem.assignToUser({
    assigneeId: user.userId,
    assigneeName: user.name,
    section: user.section,
    sentBy: user.name,
    sentBySection: user.section,
    sentByUserId: user.userId,
  });

  await applicationContext.getPersistenceGateway().saveWorkItem({
    applicationContext,
    workItem: workItem.validate().toRawObject(),
  });
};

const getDocketEntryToEdit = async ({
  applicationContext,
  docketEntryId,
  docketNumber,
}: {
  applicationContext: IApplicationContext;
  docketNumber: string;
  docketEntryId: string;
}): Promise<{
  caseEntity: TCaseEntity;
  docketEntryEntity: TDocketEntryEntity;
}> => {
  const caseToUpdate = await applicationContext
    .getPersistenceGateway()
    .getCaseByDocketNumber({
      applicationContext,
      docketNumber,
    });

  const caseEntity = new Case(caseToUpdate, { applicationContext });

  const docketEntryEntity = caseEntity.getDocketEntryById({
    docketEntryId,
  });

  return { caseEntity, docketEntryEntity };
};

const serveDocketEntryOnCases = async ({
  applicationContext,
  caseEntitiesToFileOn,
  docketEntryEntity,
  subjectCaseDocketNumber,
  user,
}: {
  applicationContext: IApplicationContext;
  caseEntitiesToFileOn: TCaseEntity[];
  docketEntryEntity: TDocketEntryEntity;
  subjectCaseDocketNumber: string;
  user: TUser;
}): Promise<{ paperServicePdfUrl?: string }> => {
  caseEntitiesToFileOn = await Promise.all(
    caseEntitiesToFileOn.map(aCase =>
      applicationContext.getUseCaseHelpers().fileAndServeDocumentOnOneCase({
        applicationContext,
        caseEntity: aCase,
        docketEntryEntity,
        subjectCaseDocketNumber,
        user,
      }),
    ),
  );

  const paperServiceResult = await applicationContext // TODO: Rename?
    .getUseCaseHelpers()
    .serveDocumentAndGetPaperServicePdf({
      applicationContext,
      caseEntities: caseEntitiesToFileOn,
      docketEntryId: docketEntryEntity.docketEntryId,
    });

  const paperServicePdfUrl = paperServiceResult?.pdfUrl;
  return { paperServicePdfUrl };
};
