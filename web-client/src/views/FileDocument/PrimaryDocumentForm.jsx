import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { InclusionsForm } from './InclusionsForm';
import { ObjectionsForm } from './ObjectionsForm';
import { StateDrivenFileInput } from './StateDrivenFileInput';
import { Text } from '../../ustc-ui/Text/Text';
import { connect } from '@cerebral/react';
import { state } from 'cerebral';
import React from 'react';
import classNames from 'classnames';

export const PrimaryDocumentForm = connect(
  {
    constants: state.constants,
    fileDocumentHelper: state.fileDocumentHelper,
    form: state.form,
    validationErrors: state.validationErrors,
  },
  ({ constants, fileDocumentHelper, form, validationErrors }) => {
    return (
      <React.Fragment>
        <h2 className="margin-top-4">{form.documentTitle}</h2>
        <div className="blue-container">
          <div
            className={classNames(
              'usa-form-group',
              validationErrors.primaryDocumentFile && 'usa-form-group--error',
            )}
          >
            <label
              className={classNames(
                'usa-label ustc-upload with-hint',
                fileDocumentHelper.showPrimaryDocumentValid && 'validated',
              )}
              htmlFor="primary-document"
              id="primary-document-label"
            >
              Upload your document{' '}
              <span className="success-message padding-left-1">
                <FontAwesomeIcon icon="check-circle" size="sm" />
              </span>
            </label>
            <span className="usa-hint">
              File must be in PDF format (.pdf). Max file size{' '}
              {constants.MAX_FILE_SIZE_MB}MB.
            </span>
            <StateDrivenFileInput
              aria-describedby="primary-document-label"
              id="primary-document"
              name="primaryDocumentFile"
              updateFormValueSequence="updateFileDocumentWizardFormValueSequence"
              validationSequence="validateExternalDocumentInformationSequence"
            />
            <Text
              bind="validationErrors.primaryDocumentFile"
              className="usa-error-message"
            />
          </div>

          <InclusionsForm
            bind="form"
            type="primaryDocument"
            validationBind="validationErrors"
          />
          {fileDocumentHelper.primaryDocument.showObjection && (
            <ObjectionsForm
              bind="form"
              type="primaryDocument"
              validationBind="validationErrors"
            />
          )}
        </div>
      </React.Fragment>
    );
  },
);
