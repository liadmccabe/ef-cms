import { Button } from '../../ustc-ui/Button/Button';
import { SortableColumnHeaderButton } from '../../ustc-ui/SortableColumnHeaderButton/SortableColumnHeaderButton';
import { connect } from '@cerebral/react';
import { sequences, state } from 'cerebral';
import React from 'react';

const chronAsc = 'Oldest to newest';
const chronDesc = 'Newest to oldest';
const alphaAsc = 'In A-Z ascending order';
const alphaDesc = 'In Z-A descending order';

export const MessagesSectionOutbox = connect(
  {
    formattedMessages: state.formattedMessages.messages,
    sortSectionMessagesSequence: sequences.sortSectionMessagesSequence,
    tableSort: state.tableSort,
  },
  function MessagesSectionOutbox({
    formattedMessages,
    sortSectionMessagesSequence,
    tableSort,
  }) {
    return (
      <>
        <table className="usa-table ustc-table subsection">
          <thead>
            <tr>
              <th aria-label="Docket Number" className="small" colSpan="2">
                <SortableColumnHeaderButton
                  ascText={chronAsc}
                  defaultSort="desc"
                  descText={chronDesc}
                  sortField="docketNumber"
                  tableSort={tableSort}
                  title="Docket No."
                  onClickSequence={sortSectionMessagesSequence}
                />
              </th>
              <th className="small">
                <SortableColumnHeaderButton
                  ascText={chronAsc}
                  defaultSort="desc"
                  descText={chronDesc}
                  sortField="createdAt"
                  tableSort={tableSort}
                  title="Sent"
                  onClickSequence={sortSectionMessagesSequence}
                />
              </th>
              <th>
                <SortableColumnHeaderButton
                  ascText={alphaAsc}
                  defaultSort="asc"
                  descText={alphaDesc}
                  sortField="subject"
                  tableSort={tableSort}
                  title="Message"
                  onClickSequence={sortSectionMessagesSequence}
                />
              </th>
              <th>Case Title</th>
              <th>Case Status</th>
              <th>To</th>
              <th>From</th>
              <th>Section</th>
            </tr>
          </thead>
          {formattedMessages.map(message => {
            return (
              <tbody key={message.messageId}>
                <tr>
                  <td aria-hidden="true" className="focus-toggle" />
                  <td className="message-queue-row small">
                    {message.docketNumberWithSuffix}
                  </td>
                  <td className="message-queue-row small">
                    <span className="no-wrap">
                      {message.createdAtFormatted}
                    </span>
                  </td>
                  <td className="message-queue-row message-subject">
                    <div className="message-document-title">
                      <Button
                        link
                        className="padding-0"
                        href={message.messageDetailLink}
                      >
                        {message.subject}
                      </Button>
                    </div>

                    <div className="message-document-detail">
                      {message.message}
                    </div>
                  </td>
                  <td className="message-queue-row max-width-25">
                    {message.caseTitle}
                  </td>
                  <td className="message-queue-row">{message.caseStatus}</td>
                  <td className="message-queue-row to">{message.to}</td>
                  <td className="message-queue-row from">{message.from}</td>
                  <td className="message-queue-row small">
                    {message.toSection}
                  </td>
                </tr>
              </tbody>
            );
          })}
        </table>
        {formattedMessages.length === 0 && <div>There are no messages.</div>}
      </>
    );
  },
);
