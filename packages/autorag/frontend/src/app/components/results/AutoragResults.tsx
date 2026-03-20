import React from 'react';
import {
  Bullseye,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  Spinner,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import type { PipelineRun } from '~/app/types';
import type { RunDetailsKF } from '~/app/types/pipeline';
import PipelineTopology from '~/app/topology/PipelineTopology';
import { useAutoRAGTaskTopology } from '~/app/topology/useAutoRAGTaskTopology';
import { usePatternsQuery } from '~/app/hooks/queries';
import PatternDetailsModal from './PatternDetailsModal';
import './AutoragResults.scss';

type AutoragResultsProps = {
  pipelineRun?: PipelineRun;
  namespace?: string;
};

function AutoragResults({ pipelineRun, namespace }: AutoragResultsProps): React.JSX.Element {
  const [selectedIds, setSelectedIds] = React.useState<string[] | undefined>();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const runDetails = pipelineRun?.run_details as RunDetailsKF | undefined;
  const nodes = useAutoRAGTaskTopology(pipelineRun?.pipeline_spec, runDetails);

  const { data: patternsData, isLoading: patternsLoading } = usePatternsQuery(
    pipelineRun?.run_id,
    namespace,
  );

  const patterns = patternsData ?? [];
  const selectedEntry = patterns[selectedIndex];

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
        {patternsLoading ? (
          <Bullseye>
            <Spinner size="lg" />
          </Bullseye>
        ) : patterns.length > 0 ? (
          <>
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
                  View pattern details — {selectedEntry.pattern.name}
                </MenuToggle>
              )}
            >
              <DropdownList>
                {patterns.map((entry, i) => (
                  <DropdownItem key={entry.pattern.name} value={i}>
                    {entry.pattern.name} (score: {entry.pattern.final_score.toFixed(2)})
                  </DropdownItem>
                ))}
              </DropdownList>
            </Dropdown>
            <PatternDetailsModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              data={selectedEntry.pattern}
              evaluationResults={selectedEntry.evaluation_results}
            />
          </>
        ) : null}
      </StackItem>
    </Stack>
  );
}

export default AutoragResults;
