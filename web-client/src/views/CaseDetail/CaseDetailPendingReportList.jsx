import { Button } from '../../ustc-ui/Button/Button';
import { ConfirmRemoveCaseDetailPendingItemModal } from './ConfirmRemoveCaseDetailPendingItemModal';
import { FilingsAndProceedings as FilingsAndProceedingsNew } from '../DocketRecord/FilingsAndProceedings';
import { FilingsAndProceedings as FilingsAndProceedingsOld } from '../DocketRecord/FilingsAndProceedings.old';
import { connect } from '@cerebral/react';
import { isCodeEnabled } from '../../../../codeToggles';
import { sequences, state } from 'cerebral';
import React from 'react';

const FilingsAndProceedings = isCodeEnabled(7184)
  ? FilingsAndProceedingsNew
  : FilingsAndProceedingsOld;

export const CaseDetailPendingReportList = connect(
  {
    formattedCaseDetail: state.formattedCaseDetail,
    openConfirmRemoveCaseDetailPendingItemModalSequence:
      sequences.openConfirmRemoveCaseDetailPendingItemModalSequence,
    showModal: state.modal.showModal,
  },
  function CaseDetailPendingReportList({
    formattedCaseDetail,
    openConfirmRemoveCaseDetailPendingItemModalSequence,
    showModal,
  }) {
    return (
      <>
        <div className="margin-top-neg-3">
          <Button
            link
            aria-describedby="tab-pending-report"
            className="margin-top-neg-1 margin-bottom-1"
            href={`/case-detail/${formattedCaseDetail.docketNumber}/pending-report`}
            icon="print"
          >
            Printable Report
          </Button>
        </div>
        <table
          aria-describedby="judgeFilter"
          aria-label="pending items"
          className="usa-table ustc-table pending-items subsection"
          id="pending-items"
        >
          <thead>
            <tr>
              <th>
                <span>
                  <span className="usa-sr-only">Number</span>
                  <span aria-hidden="true">No.</span>
                </span>
              </th>
              <th>Date Filed</th>
              <th>Filings and Proceedings</th>
              <th>Filed By</th>
              <th></th>
            </tr>
          </thead>
          {formattedCaseDetail.formattedPendingDocketEntriesOnDocketRecord.map(
            (entry, arrayIndex) => (
              <tbody key={arrayIndex}>
                <tr className="pending-item-row">
                  <td>{entry.index}</td>
                  <td>
                    <span className="no-wrap">{entry.createdAtFormatted}</span>
                  </td>
                  <td>
                    <FilingsAndProceedings
                      arrayIndex={entry.index}
                      entry={entry}
                    />
                  </td>
                  <td>{entry.filedBy}</td>
                  <td>
                    <Button
                      link
                      className="padding-0 no-wrap"
                      icon="trash"
                      onClick={() =>
                        openConfirmRemoveCaseDetailPendingItemModalSequence({
                          docketEntryId: entry.docketEntryId,
                        })
                      }
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              </tbody>
            ),
          )}
        </table>
        {formattedCaseDetail.formattedPendingDocketEntriesOnDocketRecord
          .length === 0 && <p>There is nothing pending.</p>}
        {showModal === 'ConfirmRemoveCaseDetailPendingItemModal' && (
          <ConfirmRemoveCaseDetailPendingItemModal />
        )}
      </>
    );
  },
);
