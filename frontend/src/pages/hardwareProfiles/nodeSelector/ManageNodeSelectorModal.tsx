import React from 'react';
import { Modal } from '@patternfly/react-core/deprecated';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';
import DashboardModalFooter from '~/concepts/dashboard/DashboardModalFooter';
import useGenericObjectState from '~/utilities/useGenericObjectState';
import { useValidation } from '~/utilities/useValidation';
import { nodeSelectorSchema } from '~/pages/hardwareProfiles/manage/validationUtils';
import { EMPTY_NODE_SELECTOR, NodeSelectorRow } from './const';

type ManageNodeSelectorModalProps = {
  onClose: () => void;
  existingNodeSelector?: NodeSelectorRow;
  onSave: (nodeSelector: NodeSelectorRow) => void;
};

const ManageNodeSelectorModal: React.FC<ManageNodeSelectorModalProps> = ({
  onClose,
  existingNodeSelector,
  onSave,
}) => {
  const [nodeSelector, setNodeSelector] = useGenericObjectState<NodeSelectorRow>(
    existingNodeSelector || EMPTY_NODE_SELECTOR,
  );

  const handleSubmit = () => {
    onSave(nodeSelector);
    onClose();
  };

  const isValidated = useValidation(nodeSelector, nodeSelectorSchema);

  return (
    <Modal
      title={existingNodeSelector ? 'Edit node selector' : 'Add node selector'}
      variant="medium"
      isOpen
      onClose={onClose}
      footer={
        <DashboardModalFooter
          submitLabel={existingNodeSelector ? 'Update' : 'Add'}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitDisabled={!isValidated.validationResult.success}
        />
      }
    >
      <Form>
        <FormGroup label="Key" fieldId="key" isRequired>
          <TextInput
            aria-label="Node selector key input"
            value={nodeSelector.key}
            onChange={(_, value) => setNodeSelector('key', value)}
            data-testid="node-selector-key-input"
            placeholder="Example, node.kubernetes.io/instance-type"
          />
        </FormGroup>
        <FormGroup label="Value" fieldId="value" isRequired>
          <TextInput
            aria-label="Node selector value input"
            value={nodeSelector.value}
            onChange={(_, value) => setNodeSelector('value', value)}
            data-testid="node-selector-value-input"
            placeholder="Example, m4.xlarge"
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

export default ManageNodeSelectorModal;
