const joi = require('joi-browser');
const {
  joiValidationDecorator,
} = require('../../../utilities/JoiValidationDecorator');
const { replaceBracketed } = require('../../utilities/replaceBracketed');
const {
  VALIDATION_ERROR_MESSAGES,
} = require('./ExternalDocumentInformationFactory');

/**
 *
 * @param {object} rawProps the raw document data
 * @constructor
 */
function ExternalDocumentNonStandardG(rawProps) {
  this.category = rawProps.category;
  this.documentTitle = rawProps.documentTitle;
  this.documentType = rawProps.documentType;
  this.ordinalValue = rawProps.ordinalValue;
}

ExternalDocumentNonStandardG.prototype.getDocumentTitle = function() {
  return replaceBracketed(
    this.documentTitle,
    this.ordinalValue,
    this.documentType,
  );
};

ExternalDocumentNonStandardG.VALIDATION_ERROR_MESSAGES = {
  ...VALIDATION_ERROR_MESSAGES,
};

ExternalDocumentNonStandardG.schema = {
  category: joi.string().required(),
  documentTitle: joi.string().optional(),
  documentType: joi.string().required(),
  ordinalValue: joi.string().required(),
};

joiValidationDecorator(
  ExternalDocumentNonStandardG,
  ExternalDocumentNonStandardG.schema,
  undefined,
  ExternalDocumentNonStandardG.VALIDATION_ERROR_MESSAGES,
);

module.exports = { ExternalDocumentNonStandardG };