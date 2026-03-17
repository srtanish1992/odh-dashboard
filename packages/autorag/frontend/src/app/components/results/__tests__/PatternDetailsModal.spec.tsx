/* eslint-disable camelcase */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import type { AutoRAGEvaluationResult, AutoRAGPattern } from '~/app/types/autoragPattern';
import PatternDetailsModal from '~/app/components/results/PatternDetailsModal';

const mockPattern: AutoRAGPattern = {
  name: 'pattern0',
  iteration: 0,
  max_combinations: 20,
  duration_seconds: 120,
  settings: {
    vector_store: { datasource_type: 'ls_milvus', collection_name: 'collection0' },
    chunking: { method: 'recursive', chunk_size: 256, chunk_overlap: 128 },
    embedding: { model_id: 'mock-embed-a', distance_metric: 'cosine' },
    retrieval: { method: 'window', number_of_chunks: 5 },
    generation: {
      model_id: 'granite-3.1-8b-instruct',
      context_template_text: '{document}',
      user_message_text: '',
      system_message_text: '',
    },
  },
  scores: {
    answer_correctness: { mean: 0.65, ci_low: 0.4, ci_high: 0.8 },
    faithfulness: { mean: 0.42, ci_low: 0.2, ci_high: 0.6 },
    context_correctness: { mean: 0.91, ci_low: 0.85, ci_high: 0.95 },
  },
  final_score: 0.66,
};

const mockEvaluationResults: AutoRAGEvaluationResult[] = [
  {
    question: 'What models are available?',
    correct_answers: ['Model A is available.', 'Model B is also available.'],
    question_id: 'q0',
    answer: 'Several models are available.',
    answer_contexts: [{ text: 'Models include A and B.', document_id: 'doc0' }],
    scores: { answer_correctness: 0.75, faithfulness: 0.5, context_correctness: 0.9 },
  },
  {
    question: 'How does RAG work?',
    correct_answers: ['RAG retrieves documents and generates answers.'],
    question_id: 'q1',
    answer: 'RAG uses retrieval and generation.',
    answer_contexts: [{ text: 'RAG is a pattern.', document_id: 'doc1' }],
    scores: { answer_correctness: 0.6, faithfulness: 0.8, context_correctness: 0.7 },
  },
];

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  data: mockPattern,
};

describe('PatternDetailsModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the modal with the pattern name in the title', () => {
    render(<PatternDetailsModal {...defaultProps} />);
    expect(screen.getByText(`Pattern details — ${mockPattern.name}`)).toBeInTheDocument();
  });

  it('should not render modal content when isOpen is false', () => {
    render(<PatternDetailsModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText(`Pattern details — ${mockPattern.name}`)).not.toBeInTheDocument();
  });

  it('should display all settings tabs plus Pattern information', () => {
    render(<PatternDetailsModal {...defaultProps} />);

    expect(screen.getByText('Pattern information')).toBeInTheDocument();
    expect(screen.getByText('Vector Store')).toBeInTheDocument();
    expect(screen.getByText('Chunking')).toBeInTheDocument();
    expect(screen.getByText('Embedding')).toBeInTheDocument();
    expect(screen.getByText('Retrieval')).toBeInTheDocument();
    expect(screen.getByText('Generation')).toBeInTheDocument();
  });

  it('should not display Sample Q&A tab when evaluationResults are not provided', () => {
    render(<PatternDetailsModal {...defaultProps} />);
    expect(screen.queryByText('Sample Q&A')).not.toBeInTheDocument();
  });

  it('should display Sample Q&A tab when evaluationResults are provided', () => {
    render(<PatternDetailsModal {...defaultProps} evaluationResults={mockEvaluationResults} />);
    expect(screen.getByText('Sample Q&A')).toBeInTheDocument();
  });

  describe('Pattern information tab (default)', () => {
    it('should show top-level fields', () => {
      render(<PatternDetailsModal {...defaultProps} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('pattern0')).toBeInTheDocument();
      expect(screen.getByText('Iteration')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Max Combinations')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('Duration Seconds')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('Final Score')).toBeInTheDocument();
      expect(screen.getByText('0.66')).toBeInTheDocument();
    });

    it('should show score type radio buttons with Mean selected by default', () => {
      render(<PatternDetailsModal {...defaultProps} />);

      const meanRadio = screen.getByLabelText('Mean');
      const ciHighRadio = screen.getByLabelText('CI High');
      const ciLowRadio = screen.getByLabelText('CI Low');

      expect(meanRadio).toBeChecked();
      expect(ciHighRadio).not.toBeChecked();
      expect(ciLowRadio).not.toBeChecked();
    });

    it('should show score values for mean by default', () => {
      render(<PatternDetailsModal {...defaultProps} />);

      expect(screen.getByText('0.650')).toBeInTheDocument();
      expect(screen.getByText('0.420')).toBeInTheDocument();
      expect(screen.getByText('0.910')).toBeInTheDocument();
    });

    it('should switch to CI High scores when radio is clicked', async () => {
      const user = userEvent.setup();
      render(<PatternDetailsModal {...defaultProps} />);

      await user.click(screen.getByLabelText('CI High'));

      expect(screen.getByLabelText('CI High')).toBeChecked();
      expect(screen.getByText('0.800')).toBeInTheDocument();
      expect(screen.getByText('0.600')).toBeInTheDocument();
      expect(screen.getByText('0.950')).toBeInTheDocument();
    });

    it('should switch to CI Low scores when radio is clicked', async () => {
      const user = userEvent.setup();
      render(<PatternDetailsModal {...defaultProps} />);

      await user.click(screen.getByLabelText('CI Low'));

      expect(screen.getByLabelText('CI Low')).toBeChecked();
      expect(screen.getByText('0.400')).toBeInTheDocument();
      expect(screen.getByText('0.200')).toBeInTheDocument();
      expect(screen.getByText('0.850')).toBeInTheDocument();
    });

    it('should display score metric names with score type label', () => {
      render(<PatternDetailsModal {...defaultProps} />);

      expect(screen.getByText('Answer Correctness (Mean)')).toBeInTheDocument();
      expect(screen.getByText('Faithfulness (Mean)')).toBeInTheDocument();
      expect(screen.getByText('Context Correctness (Mean)')).toBeInTheDocument();
    });
  });

  describe('Settings tabs', () => {
    it('should show chunking settings when Chunking tab is clicked', async () => {
      const user = userEvent.setup();
      render(<PatternDetailsModal {...defaultProps} />);

      await user.click(screen.getByText('Chunking'));

      expect(screen.getByText('Method')).toBeInTheDocument();
      expect(screen.getByText('recursive')).toBeInTheDocument();
      expect(screen.getByText('Chunk Size')).toBeInTheDocument();
      expect(screen.getByText('256')).toBeInTheDocument();
      expect(screen.getByText('Chunk Overlap')).toBeInTheDocument();
      expect(screen.getByText('128')).toBeInTheDocument();
    });

    it('should show vector store settings when Vector Store tab is clicked', async () => {
      const user = userEvent.setup();
      render(<PatternDetailsModal {...defaultProps} />);

      await user.click(screen.getByText('Vector Store'));

      expect(screen.getByText('Datasource Type')).toBeInTheDocument();
      expect(screen.getByText('ls_milvus')).toBeInTheDocument();
      expect(screen.getByText('Collection Name')).toBeInTheDocument();
      expect(screen.getByText('collection0')).toBeInTheDocument();
    });

    it('should show generation settings when Generation tab is clicked', async () => {
      const user = userEvent.setup();
      render(<PatternDetailsModal {...defaultProps} />);

      await user.click(screen.getByText('Generation'));

      expect(screen.getByText('Model Id')).toBeInTheDocument();
      expect(screen.getByText('granite-3.1-8b-instruct')).toBeInTheDocument();
    });
  });

  describe('Sample Q&A tab', () => {
    it('should display evaluation results when Sample Q&A tab is clicked', async () => {
      const user = userEvent.setup();
      render(<PatternDetailsModal {...defaultProps} evaluationResults={mockEvaluationResults} />);

      await user.click(screen.getByText('Sample Q&A'));

      expect(screen.getByText('What models are available?')).toBeInTheDocument();
      expect(screen.getByText('Several models are available.')).toBeInTheDocument();
      expect(screen.getByText('How does RAG work?')).toBeInTheDocument();
      expect(screen.getByText('RAG uses retrieval and generation.')).toBeInTheDocument();
    });

    it('should display Question and Answer labels for each entry', async () => {
      const user = userEvent.setup();
      render(<PatternDetailsModal {...defaultProps} evaluationResults={mockEvaluationResults} />);

      await user.click(screen.getByText('Sample Q&A'));

      const questionLabels = screen.getAllByText('Question');
      const answerLabels = screen.getAllByText('Answer');
      expect(questionLabels).toHaveLength(2);
      expect(answerLabels).toHaveLength(2);
    });

    it('should show expected answer count in expandable toggle', async () => {
      const user = userEvent.setup();
      render(<PatternDetailsModal {...defaultProps} evaluationResults={mockEvaluationResults} />);

      await user.click(screen.getByText('Sample Q&A'));

      expect(screen.getByText('View expected answer (2)')).toBeInTheDocument();
      expect(screen.getByText('View expected answer (1)')).toBeInTheDocument();
    });

    it('should expand expected answers when toggle is clicked', async () => {
      const user = userEvent.setup();
      render(<PatternDetailsModal {...defaultProps} evaluationResults={mockEvaluationResults} />);

      await user.click(screen.getByText('Sample Q&A'));
      await user.click(screen.getByText('View expected answer (2)'));

      expect(screen.getByText('Model A is available.')).toBeVisible();
      expect(screen.getByText('Model B is also available.')).toBeVisible();
      expect(screen.getByText('Expected answer 2')).toBeVisible();
    });

    it('should collapse expected answers when toggle is clicked again', async () => {
      const user = userEvent.setup();
      render(<PatternDetailsModal {...defaultProps} evaluationResults={mockEvaluationResults} />);

      await user.click(screen.getByText('Sample Q&A'));
      await user.click(screen.getByText('View expected answer (2)'));

      expect(screen.getByText('Model A is available.')).toBeVisible();

      await user.click(screen.getByText('View expected answer (2)'));

      expect(screen.getByText('Model A is available.')).not.toBeVisible();
    });
  });

  describe('Tab reset behavior', () => {
    it('should reset to Pattern information tab when data changes', () => {
      const { rerender } = render(
        <PatternDetailsModal {...defaultProps} evaluationResults={mockEvaluationResults} />,
      );

      const secondPattern: AutoRAGPattern = {
        ...mockPattern,
        name: 'pattern1',
        iteration: 1,
      };

      rerender(
        <PatternDetailsModal
          {...defaultProps}
          data={secondPattern}
          evaluationResults={mockEvaluationResults}
        />,
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('pattern1')).toBeInTheDocument();
    });

    it('should reset score type to Mean when modal reopens', () => {
      const { rerender } = render(<PatternDetailsModal {...defaultProps} />);

      rerender(<PatternDetailsModal {...defaultProps} isOpen={false} />);
      rerender(<PatternDetailsModal {...defaultProps} isOpen />);

      expect(screen.getByLabelText('Mean')).toBeChecked();
    });
  });

  describe('onClose callback', () => {
    it('should call onClose when the modal close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<PatternDetailsModal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByLabelText('Close');
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle pattern with no scores gracefully', () => {
      const patternNoScores: AutoRAGPattern = {
        ...mockPattern,
        scores: {},
      };
      render(<PatternDetailsModal {...defaultProps} data={patternNoScores} />);

      expect(screen.getByText('Scores')).toBeInTheDocument();
    });

    it('should not show Sample Q&A tab when evaluationResults is empty', () => {
      render(<PatternDetailsModal {...defaultProps} evaluationResults={[]} />);
      expect(screen.queryByText('Sample Q&A')).not.toBeInTheDocument();
    });
  });
});
