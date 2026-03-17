import React from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { mockAutoRAGEvaluationResults } from '~/app/mocks/mockAutoRAGEvaluationResults';
import { mockAutoRAGPatterns } from '~/app/mocks/mockAutoRAGPatterns';
import PatternDetailsModal from './PatternDetailsModal';

function AutoragResults(): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const selectedPattern = mockAutoRAGPatterns[selectedIndex];

  return (
    <div>
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
    </div>
  );
}

export default AutoragResults;
