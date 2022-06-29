import { Button } from '../../ustc-ui/Button/Button';
import { CaseDetailHeader } from '../CaseDetail/CaseDetailHeader';
import { EditDocketEntryMetaDocketEntryPreview } from './EditDocketEntryMetaDocketEntryPreview';
import { EditDocketEntryMetaFormCourtIssued } from './EditDocketEntryMetaFormCourtIssued';
import { EditDocketEntryMetaFormDocument } from './EditDocketEntryMetaFormDocument';
import { EditDocketEntryMetaFormNoDocument } from './EditDocketEntryMetaFormNoDocument';
import { EditDocketEntryMetaTabAction } from './EditDocketEntryMetaTabAction';
import { EditDocketEntryMetaTabService } from './EditDocketEntryMetaTabService';
import { ErrorNotification } from '../ErrorNotification';
import { FormCancelModalDialog } from '../FormCancelModalDialog';
import { FormGroup } from '../../ustc-ui/FormGroup/FormGroup';
import { Tab, Tabs } from '../../ustc-ui/Tabs/Tabs';
import { connect } from '@cerebral/react';
import { sequences, state } from 'cerebral';
import React from 'react';

export const ApplyStampForm = connect(
  { form: state.form, validationErrors: state.validationErrors },
  function ApplyStampForm({ form, validationErrors }) {
    return (
      <>
        <CaseDetailHeader />

        <section className="usa-section grid-container">
          <ErrorNotification />
          <div className="grid-row grid-gap">
            <h1 className="heading-1" id="page-title">
              Apply Stamp
            </h1>
          </div>
          <div className="grid-row grid-gap">
            <Button
              link
              className="margin-bottom-3"
              href="/trial-sessions"
              icon={['fa', 'arrow-alt-circle-left']}
            >
              Back to Document View
            </Button>
          </div>

          <div className="blue-container docket-entry-form">
            <FormGroup errorText={validationErrors.status}>
              <fieldset className="usa-fieldset">
                <legend className="usa-legend">Stamp Order</legend>
                {['Granted', 'Denied'].map(option => (
                  <div className="usa-radio usa-radio__inline" key={option}>
                    <input
                      checked={form.lodged === (option === 'Granted')}
                      className="usa-radio__input"
                      id={`motion-status-${option}`}
                      name="status"
                      type="radio"
                      value={option}
                      //   onChange={e => {
                      //     updateDocketEntryFormValueSequence({
                      //       key: e.target.name,
                      //       value: e.target.value === 'Lodge',
                      //     });
                      //     validateDocketEntrySequence();
                      //   }}
                    />
                    <label
                      className="usa-radio__label"
                      htmlFor={`motion-status-${option}`}
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </fieldset>
            </FormGroup>
            <hr />
            <FormGroup>
              <label className="usa-label" htmlFor="stricken-case-radio">
                Select any that apply{' '}
                <span className="usa-hint">(optional)</span>
              </label>
              <div className="usa-radio usa-radio__inline">
                <input
                  checked={true}
                  className="usa-radio__input"
                  id="stricken-case-radio"
                  name="stricken-case"
                  type="radio"
                  //   value={}
                  //   onChange={e => {
                  //     updateDocketEntryFormValueSequence({
                  //       key: e.target.name,
                  //       value: e.target.value === 'Lodge',
                  //     });
                  //     validateDocketEntrySequence();
                  //   }}
                />
                <label className="usa-radio__label" htmlFor={'stricken-case'}>
                  This case is stricken from the trial session
                </label>
              </div>
            </FormGroup>
            <hr />
            <FormGroup>
              {/* is it bad to remove label from this formgroup? */}
              {/* <label className="usa-label" htmlFor="jurisdiction">
                Select any that apply{' '}
                <span className="usa-hint">(optional)</span>
              </label> */}
              <div className="usa-radio">
                <input
                  checked={true}
                  className="usa-radio__input"
                  name="general-docket"
                  type="radio"
                  //   value={}
                  //   onChange={e => {
                  //     updateDocketEntryFormValueSequence({
                  //       key: e.target.name,
                  //       value: e.target.value === 'Lodge',
                  //     });
                  //     validateDocketEntrySequence();
                  //   }}
                />
                <label className="usa-radio__label" htmlFor={'general-docket'}>
                  The case is restored to the general docket
                </label>
              </div>
              <div className="usa-radio">
                <input
                  checked={true}
                  className="usa-radio__input"
                  name="undersigned"
                  type="radio"
                  //   value={}
                  //   onChange={e => {
                  //     updateDocketEntryFormValueSequence({
                  //       key: e.target.name,
                  //       value: e.target.value === 'Lodge',
                  //     });
                  //     validateDocketEntrySequence();
                  //   }}
                />
                <label className="usa-radio__label" htmlFor={'undersigned'}>
                  Jurisdiction is retained by the undersigned
                </label>
              </div>
            </FormGroup>
            <hr />
            <FormGroup>
              <div className="usa-radio">
                <input
                  checked={true}
                  className="usa-radio__input"
                  name="status-report"
                  type="radio"
                  //   value={}
                  //   onChange={e => {
                  //     updateDocketEntryFormValueSequence({
                  //       key: e.target.name,
                  //       value: e.target.value === 'Lodge',
                  //     });
                  //     validateDocketEntrySequence();
                  //   }}
                />
                <label className="usa-radio__label" htmlFor={'status-report'}>
                  The parties shall file a status report by [DATE]
                </label>
              </div>
              <div className="usa-radio">
                <input
                  checked={true}
                  className="usa-radio__input"
                  name="status-report-or-stip-decision"
                  type="radio"
                  //   value={}
                  //   onChange={e => {
                  //     updateDocketEntryFormValueSequence({
                  //       key: e.target.name,
                  //       value: e.target.value === 'Lodge',
                  //     });
                  //     validateDocketEntrySequence();
                  //   }}
                />
                <label
                  className="usa-radio__label"
                  htmlFor={'status-report-or-stip-decision'}
                >
                  The parties shall file a status report or proposed stipulated
                  decision by [DATE]
                </label>
              </div>
            </FormGroup>
            <hr />
            <FormGroup errorText={validationErrors.customOrderText}>
              <div>
                <label
                  className="usa-label"
                  htmlFor="custom-order-text"
                  id="custom-order-text-label"
                >
                  Custom order text <span className="usa-hint">(optional)</span>
                </label>
                <input
                  aria-describedby="custom-order-text-label"
                  className="usa-input"
                  id="custom-order-text"
                  name="custom-order-text"
                  type="text"
                  value={form.customOrderText || ''}
                  // onChange={e => {
                  //   updateSequence({
                  //     key: e.target.name,
                  //     value: e.target.value,
                  //   });
                  // }}
                />
              </div>
            </FormGroup>
          </div>
        </section>
      </>
    );
  },
);
