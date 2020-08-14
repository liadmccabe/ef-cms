import { ModalDialog } from './ModalDialog';
import { connect } from '@cerebral/react';
import { props, sequences } from 'cerebral';
import React from 'react';

export const ConfirmReplacePetitionModal = connect(
  {
    cancelSequence: sequences.dismissModalSequence,
    confirmSequence: sequences[props.confirmSequence],
  },
  function ConfirmReplacePetitionModal({ cancelSequence, confirmSequence }) {
    return (
      <ModalDialog
        cancelLabel="No, Keep Current PDF"
        cancelSequence={cancelSequence}
        className=""
        confirmLabel="Yes, Continue"
        confirmSequence={confirmSequence}
        message="You must scan or upload another Petition PDF, or the original PDF will remain on the case."
        title="Are You Sure you Want to Replace this Petition PDF?"
      ></ModalDialog>
    );
  },
);