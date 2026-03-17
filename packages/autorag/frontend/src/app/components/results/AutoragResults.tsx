import React from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import type { PipelineRun } from '~/app/types';
import type { RunDetailsKF } from '~/app/types/pipeline';
import PipelineTopology from '~/app/topology/PipelineTopology';
import { useAutoRAGTaskTopology } from '~/app/topology/useAutoRAGTaskTopology';
import { mockAutoRAGEvaluationResults } from '~/app/mocks/mockAutoRAGEvaluationResults';
import { mockAutoRAGPatterns } from '~/app/mocks/mockAutoRAGPatterns';
import PatternDetailsModal from './PatternDetailsModal';
import './AutoragResults.scss';

type AutoragResultsProps = {
  pipelineRun?: PipelineRun;
};

function AutoragResults({ pipelineRun }: AutoragResultsProps): React.JSX.Element {
  const [selectedIds, setSelectedIds] = React.useState<string[] | undefined>();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const runDetails = pipelineRun?.run_details as RunDetailsKF | undefined;

  const nodes = useAutoRAGTaskTopology(pipelineRun?.pipeline_spec, runDetails);
  const selectedPattern = mockAutoRAGPatterns[selectedIndex];

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2">{pipelineRun?.display_name} configurations</Title>
      </StackItem>
      <StackItem isFilled>
        <PipelineTopology
          nodes={nodes}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          className="autorag-topology-container"
        />
      </StackItem>
      <StackItem>
        <Dropdown
          isOpen={isDropdownOpen}
          onSelect={(_e, value) => {
            setSelectedIndex(Number(value));
            setIsDropdownOpen(false);
            setIsModalOpen(true);
          }}
          onOpenChange={setIsDropdownOpen}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle ref={toggleRef} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              View pattern details — {selectedPattern.name}
            </MenuToggle>
          )}
        >
          <DropdownList>
            {mockAutoRAGPatterns.map((pattern, i) => (
              <DropdownItem key={pattern.name} value={i}>
                {pattern.name} (score: {pattern.final_score.toFixed(2)})
              </DropdownItem>
            ))}
          </DropdownList>
        </Dropdown>
        <PatternDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={selectedPattern}
          evaluationResults={mockAutoRAGEvaluationResults}
        />
      </StackItem>
    </Stack>
  );
}

export default AutoragResults;
