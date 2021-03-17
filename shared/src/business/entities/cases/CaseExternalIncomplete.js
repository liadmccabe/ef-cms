const joi = require('joi');
const {
  joiValidationDecorator,
  validEntityDecorator,
} = require('../../../utilities/JoiValidationDecorator');
const { Case, getContactPrimary } = require('./Case');
const { CaseExternal } = require('./CaseExternal');
const { ContactFactory } = require('../contacts/ContactFactory');

/**
 * CaseExternalIncomplete
 * Represents a Case without required documents that a Petitioner is attempting to add to the system.
 * After the Case's files have been saved, a Petition is created to include the document metadata.
 *
 * @param {object} rawCase the raw case data
 * @constructor
 */
function CaseExternalIncomplete() {}
CaseExternalIncomplete.prototype.init = function init(
  rawCase,
  { applicationContext },
) {
  CaseExternalIncomplete.prototype.initSelf.call(this, rawCase, {
    applicationContext,
  });
  CaseExternalIncomplete.prototype.initContacts.call(this, rawCase, {
    applicationContext,
  });
};

CaseExternalIncomplete.prototype.initContacts = function (
  rawCase,
  { applicationContext },
) {
  const contacts = ContactFactory.createContacts({
    applicationContext,
    contactInfo: {
      primary: getContactPrimary(rawCase) || rawCase.contactPrimary,
      secondary: rawCase.contactSecondary,
    },
    partyType: rawCase.partyType,
  });
  this.petitioners = [];
  this.petitioners.push(contacts.primary);
  this.contactSecondary = contacts.secondary;

  Object.defineProperty(this, 'contactPrimary', {
    get() {
      return contacts.primary;
    },
  });
};

CaseExternalIncomplete.prototype.initSelf = function (rawCase) {
  this.businessType = rawCase.businessType;
  this.caseType = rawCase.caseType;
  this.contactPrimary = rawCase.contactPrimary;
  this.contactSecondary = rawCase.contactSecondary;
  this.countryType = rawCase.countryType;
  this.filingType = rawCase.filingType;
  this.hasIrsNotice = rawCase.hasIrsNotice;
  this.partyType = rawCase.partyType;
  this.preferredTrialCity = rawCase.preferredTrialCity;
  this.procedureType = rawCase.procedureType;
};

CaseExternalIncomplete.VALIDATION_ERROR_MESSAGES =
  Case.VALIDATION_ERROR_MESSAGES;

joiValidationDecorator(
  CaseExternalIncomplete,
  joi.object().keys({
    businessType: CaseExternal.commonRequirements.businessType,
    caseType: CaseExternal.commonRequirements.caseType,
    contactSecondary: joi.object().optional(),
    countryType: CaseExternal.commonRequirements.countryType,
    filingType: CaseExternal.commonRequirements.filingType,
    hasIrsNotice: CaseExternal.commonRequirements.hasIrsNotice,
    partyType: CaseExternal.commonRequirements.partyType,
    petitioners: joi
      .array()
      .items(ContactFactory.getValidationRules('primary'))
      .description('List of Contact Entities for the case.')
      .optional(),
    preferredTrialCity: CaseExternal.commonRequirements.preferredTrialCity,
    procedureType: CaseExternal.commonRequirements.procedureType,
  }),
  CaseExternalIncomplete.VALIDATION_ERROR_MESSAGES,
);

module.exports = {
  CaseExternalIncomplete: validEntityDecorator(CaseExternalIncomplete),
};
