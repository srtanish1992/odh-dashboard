import React from 'react';
import {
  Card,
  CardBody,
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  ExpandableSection,
  Flex,
  FlexItem,
  Modal,
  ModalBody,
  ModalHeader,
  ModalVariant,
  Progress,
  ProgressMeasureLocation,
  Radio,
  Stack,
  StackItem,
  Tab,
  Tabs,
  TabTitleText,
  Title,
} from '@patternfly/react-core';
import type {
  AutoRAGEvaluationResult,
  AutoRAGPattern,
  AutoRAGPatternScoreMetric,
  AutoRAGPatternSettings,
} from '~/app/types/autoragPattern';
import './PatternDetailsModal.scss';

type PatternDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  data: AutoRAGPattern;
  evaluationResults?: AutoRAGEvaluationResult[];
};

const OVERVIEW_KEY = 'pattern_information';
const SAMPLE_QA_KEY = 'sample_qa';

const humanize = (key: string): string =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const KeyValueList: React.FC<{ entries: Record<string, unknown> }> = ({ entries }) => (
  <DescriptionList isHorizontal>
    {Object.entries(entries).map(([key, value]) => (
      <DescriptionListGroup key={key}>
        <DescriptionListTerm>{humanize(key)}</DescriptionListTerm>
        <DescriptionListDescription>{String(value)}</DescriptionListDescription>
      </DescriptionListGroup>
    ))}
  </DescriptionList>
);

type ScoreType = 'mean' | 'ci_high' | 'ci_low';

/* eslint-disable camelcase */
const scoreTypeLabels: Record<ScoreType, string> = {
  mean: 'Mean',
  ci_high: 'CI High',
  ci_low: 'CI Low',
};
/* eslint-enable camelcase */

const ScoresList: React.FC<{
  scores: Record<string, AutoRAGPatternScoreMetric | undefined>;
  scoreType: ScoreType;
}> = ({ scores, scoreType }) => (
  <DescriptionList isHorizontal horizontalTermWidthModifier={{ default: '20ch' }}>
    {Object.entries(scores).map(([key, score]) => {
      if (!score) {
        return null;
      }
      const value = score[scoreType];
      return (
        <DescriptionListGroup key={key}>
          <DescriptionListTerm>
            {humanize(key)} ({scoreTypeLabels[scoreType]})
          </DescriptionListTerm>
          <DescriptionListDescription>
            <Progress
              value={value * 100}
              title=""
              label={`${value.toFixed(3)}`}
              measureLocation={ProgressMeasureLocation.outside}
            />
          </DescriptionListDescription>
        </DescriptionListGroup>
      );
    })}
  </DescriptionList>
);

const settingsSectionEntries = (
  settings: AutoRAGPatternSettings,
  section: string,
): Record<string, unknown> => {
  for (const [key, value] of Object.entries(settings)) {
    if (key === section) {
      return value;
    }
  }
  return {};
};

const SampleQAEntry: React.FC<{ result: AutoRAGEvaluationResult }> = ({ result }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <Card isCompact>
      <CardBody>
        <Flex>
          <FlexItem flex={{ default: 'flex_1' }}>
            <Content component={ContentVariants.small}>
              <strong>Question</strong>
            </Content>
            <Content component={ContentVariants.p}>{result.question}</Content>
          </FlexItem>
          <FlexItem flex={{ default: 'flex_1' }}>
            <Content component={ContentVariants.small}>
              <strong>Answer</strong>
            </Content>
            <Content component={ContentVariants.p}>{result.answer}</Content>
            <ExpandableSection
              toggleText={`View expected answer (${result.correct_answers.length})`}
              isExpanded={isExpanded}
              onToggle={(_e, expanded) => setIsExpanded(expanded)}
              isIndented
            >
              <Stack hasGutter>
                {result.correct_answers.map((answer, i) => (
                  <StackItem key={`answer-${result.question_id}-${i}`}>
                    <Content component={ContentVariants.small}>
                      <strong>Expected answer {i + 1}</strong>
                    </Content>
                    <Content component={ContentVariants.p} className="autorag-pre-wrap">
                      {answer}
                    </Content>
                  </StackItem>
                ))}
              </Stack>
            </ExpandableSection>
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

const SampleQAContent: React.FC<{ results: AutoRAGEvaluationResult[] }> = ({ results }) => (
  <Stack hasGutter>
    <StackItem>
      <Title headingLevel="h3">Sample Q&A</Title>
    </StackItem>
    {results.map((result) => (
      <StackItem key={result.question_id}>
        <SampleQAEntry result={result} />
      </StackItem>
    ))}
  </Stack>
);

const PatternDetailsModal: React.FC<PatternDetailsModalProps> = ({
  isOpen,
  onClose,
  data,
  evaluationResults,
}) => {
  const [activeSection, setActiveSection] = React.useState<string>(OVERVIEW_KEY);
  const [scoreType, setScoreType] = React.useState<ScoreType>('mean');

  React.useEffect(() => {
    if (isOpen) {
      setActiveSection(OVERVIEW_KEY);
      setScoreType('mean');
    }
  }, [isOpen, data]);

  const settingsKeys = Object.keys(data.settings);
  const allSections = [
    OVERVIEW_KEY,
    ...settingsKeys,
    ...(evaluationResults?.length ? [SAMPLE_QA_KEY] : []),
  ];

  const topLevelFields: Record<string, unknown> = {
    name: data.name,
    iteration: data.iteration,
    // eslint-disable-next-line camelcase
    max_combinations: data.max_combinations,
    // eslint-disable-next-line camelcase
    duration_seconds: data.duration_seconds,
    // eslint-disable-next-line camelcase
    final_score: data.final_score,
  };

  const renderContent = (): React.ReactNode => {
    if (activeSection === OVERVIEW_KEY) {
      return (
        <Stack hasGutter>
          <StackItem>
            <KeyValueList entries={topLevelFields} />
          </StackItem>
          <StackItem>
            <DescriptionList isHorizontal>
              <DescriptionListGroup>
                <DescriptionListTerm>Score type</DescriptionListTerm>
                <DescriptionListDescription>
                  <Flex gap={{ default: 'gapLg' }}>
                    {(['mean', 'ci_high', 'ci_low'] satisfies ScoreType[]).map((type) => (
                      <FlexItem key={type}>
                        <Radio
                          id={`score-type-${type}`}
                          name="score-type"
                          label={scoreTypeLabels[type]}
                          isChecked={scoreType === type}
                          onChange={() => setScoreType(type)}
                        />
                      </FlexItem>
                    ))}
                  </Flex>
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </StackItem>
          <StackItem>
            <Title headingLevel="h4">Scores</Title>
          </StackItem>
          <StackItem>
            <ScoresList scores={data.scores} scoreType={scoreType} />
          </StackItem>
        </Stack>
      );
    }
    if (activeSection === SAMPLE_QA_KEY && evaluationResults) {
      return <SampleQAContent results={evaluationResults} />;
    }
    return <KeyValueList entries={settingsSectionEntries(data.settings, activeSection)} />;
  };

  const getTabLabel = (key: string): string => {
    if (key === OVERVIEW_KEY) {
      return 'Pattern information';
    }
    if (key === SAMPLE_QA_KEY) {
      return 'Sample Q&A';
    }
    return humanize(key);
  };

  return (
    <Modal variant={ModalVariant.large} isOpen={isOpen} onClose={onClose}>
      <ModalHeader title={`Pattern details — ${data.name}`} />
      <ModalBody>
        <Flex>
          <FlexItem>
            <Tabs
              activeKey={activeSection}
              onSelect={(_e, key) => setActiveSection(String(key))}
              isVertical
              aria-label="Pattern detail sections"
            >
              {allSections.map((key) => (
                <Tab
                  key={key}
                  eventKey={key}
                  title={<TabTitleText>{getTabLabel(key)}</TabTitleText>}
                />
              ))}
            </Tabs>
          </FlexItem>
          <FlexItem flex={{ default: 'flex_1' }}>{renderContent()}</FlexItem>
        </Flex>
      </ModalBody>
    </Modal>
  );
};

export default PatternDetailsModal;
