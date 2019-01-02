import { state } from 'cerebral';
import { omit } from 'lodash';

export default async ({ applicationContext, get, store }) => {
  const user = get(state.user);
  const caseInitiator = omit(get(state.petition), 'uploadsFinished');
  const useCases = applicationContext.getUseCases();

  const fileHasUploaded = () => {
    store.set(
      state.petition.uploadsFinished,
      get(state.petition.uploadsFinished) + 1,
    );
  };

  const {
    petitionDocumentId,
    requestForPlaceOfTrialDocumentId,
    statementOfTaxpayerIdentificationNumberDocumentId,
  } = await useCases.uploadCasePdfs({
    applicationContext,
    caseInitiator,
    userId: user.userId,
    fileHasUploaded,
  });

  await useCases.createCase({
    applicationContext,
    documents: [
      { documentType: 'Petition', documentId: petitionDocumentId },
      {
        documentType: 'Request for Place of Trial',
        documentId: requestForPlaceOfTrialDocumentId,
      },
      {
        documentType: 'Statement of Taxpayer Identification Number',
        documentId: statementOfTaxpayerIdentificationNumberDocumentId,
      },
    ],
    userId: user.userId,
  });
};
