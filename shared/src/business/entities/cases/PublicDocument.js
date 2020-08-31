const joi = require('joi');
const {
  ALL_DOCUMENT_TYPES,
  ALL_EVENT_CODES,
  DOCUMENT_PROCESSING_STATUS_OPTIONS,
} = require('../EntityConstants');
const {
  JoiValidationConstants,
} = require('../../../utilities/JoiValidationConstants');
const {
  joiValidationDecorator,
  validEntityDecorator,
} = require('../../../utilities/JoiValidationDecorator');

/**
 * PublicDocument
 *
 * @param {object} rawDocument the raw document
 * @constructor
 */
function PublicDocument() {}
PublicDocument.prototype.init = function init(rawDocument) {
  this.additionalInfo = rawDocument.additionalInfo;
  this.additionalInfo2 = rawDocument.additionalInfo2;
  this.createdAt = rawDocument.createdAt;
  this.description = rawDocument.description;
  this.docketNumber = rawDocument.docketNumber;
  this.documentId = rawDocument.documentId;
  this.documentTitle = rawDocument.documentTitle;
  this.documentType = rawDocument.documentType;
  this.eventCode = rawDocument.eventCode;
  this.filedBy = rawDocument.filedBy;
  this.filingDate = rawDocument.filingDate;
  this.index = rawDocument.index;
  this.isOnDocketRecord = rawDocument.isOnDocketRecord;
  this.isPaper = rawDocument.isPaper;
  this.isStricken = rawDocument.isStricken;
  this.numberOfPages = rawDocument.numberOfPages;
  this.processingStatus = rawDocument.processingStatus;
  this.receivedAt = rawDocument.receivedAt;
  this.servedAt = rawDocument.servedAt;
  this.servedParties = rawDocument.servedParties;
  this.isMinuteEntry = rawDocument.isMinuteEntry;
};

PublicDocument.VALIDATION_RULES = joi.object().keys({
  additionalInfo: JoiValidationConstants.STRING.max(500).optional(),
  additionalInfo2: JoiValidationConstants.STRING.max(500).optional(),
  createdAt: JoiValidationConstants.ISO_DATE.optional(),
  docketNumber: JoiValidationConstants.DOCKET_NUMBER.optional(),
  documentId: JoiValidationConstants.UUID.optional(),
  documentTitle: JoiValidationConstants.STRING.max(500).optional(),
  documentType: JoiValidationConstants.STRING.valid(
    ...ALL_DOCUMENT_TYPES,
  ).optional(),
  eventCode: JoiValidationConstants.STRING.valid(...ALL_EVENT_CODES).optional(),
  filedBy: JoiValidationConstants.STRING.max(500).optional().allow(null),
  isMinuteEntry: joi.boolean().optional(),
  isPaper: joi.boolean().optional(),
  processingStatus: JoiValidationConstants.STRING.valid(
    ...Object.values(DOCUMENT_PROCESSING_STATUS_OPTIONS),
  ).optional(),
  receivedAt: JoiValidationConstants.ISO_DATE.optional(),
  servedAt: JoiValidationConstants.ISO_DATE.optional(),
  servedParties: joi
    .array()
    .items({ name: JoiValidationConstants.STRING.max(500).required() })
    .optional(),
});

joiValidationDecorator(PublicDocument, PublicDocument.VALIDATION_RULES, {});

module.exports = { PublicDocument: validEntityDecorator(PublicDocument) };
