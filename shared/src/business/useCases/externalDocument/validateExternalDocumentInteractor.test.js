const {
  ExternalDocumentFactory,
} = require('../../entities/externalDocument/ExternalDocumentFactory');
const {
  validateExternalDocumentInteractor,
} = require('./validateExternalDocumentInteractor');
const {
  VALIDATION_ERROR_MESSAGES,
} = require('../../entities/externalDocument/ExternalDocumentInformationFactory');

describe('validateExternalDocumentInteractor', () => {
  it('returns the expected errors object on an empty message', () => {
    const errors = validateExternalDocumentInteractor({
      applicationContext: {
        getEntityConstructors: () => ({
          ExternalDocumentFactory,
        }),
      },
      documentMetadata: {},
    });

    expect(errors).toEqual({
      category: VALIDATION_ERROR_MESSAGES.category,
      documentType: VALIDATION_ERROR_MESSAGES.documentType,
    });
  });

  it('returns no errors when all fields are defined', () => {
    const errors = validateExternalDocumentInteractor({
      applicationContext: {
        getEntityConstructors: () => ({
          ExternalDocumentFactory,
        }),
      },
      documentMetadata: {
        category: 'Application',
        documentType: 'Application for Waiver of Filing Fee',
        scenario: 'Standard',
      },
    });

    expect(errors).toEqual(null);
  });
});