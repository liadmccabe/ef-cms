const {
  DocketEntryFactory,
} = require('../../entities/docketEntry/DocketEntryFactory');

/**
 * validateDocketEntryInteractor
 *
 * @param {object} providers the providers object
 * @param {object} providers.entryMetadata the docket entry metadata
 * @returns {object} errors (null if no errors)
 */
exports.validateDocketEntryInteractor = ({ entryMetadata }) => {
  const docketEntry = DocketEntryFactory(entryMetadata);
  return docketEntry.getFormattedValidationErrors();
};
