/* eslint-disable camelcase */
import type { AutoRAGEvaluationResult } from '~/app/types/autoragPattern';

export const mockAutoRAGEvaluationResults: AutoRAGEvaluationResult[] = [
  {
    question: 'What foundation models are available in watsonx.ai?',
    correct_answers: [
      'The following models are available in watsonx.ai: \nflan-t5-xl-3b\nFlan-t5-xxl-11b\nflan-ul2-20b\ngpt-neox-20b\ngranite-13b-chat-v2\ngranite-13b-chat-v1\ngranite-13b-instruct-v2\ngranite-13b-instruct-v1\nllama-2-13b-chat\nllama-2-70b-chat\nmpt-7b-instruct2\nmt0-xxl-13b\nstarcoder-15.5b',
      'IBM watsonx.ai offers a variety of foundation models including the Granite family (granite-13b-chat-v2, granite-13b-instruct-v2), open-source models like Llama 2 (13b, 70b), Flan-T5 variants, MPT-7B, StarCoder, and others. Use the model catalog to see the full list.',
    ],
    question_id: 'q_id_0',
    answer: 'I cannot answer this question, because I am just a mocked model.',
    answer_contexts: [
      {
        text: '*  asset_name_or_item: (Required) Either a string with the name of a stored data asset or an item like those returned by list_stored_data().',
        document_id: '0ECEAC44DA213D067B5B5EA66694E6283457A441_9.txt',
      },
      {
        text: 'Model architecture   The architecture of the model influences how the model behaves.',
        document_id: '120CAE8361AE4E0B6FE4D6F0D32EEE9517F11190_1.txt',
      },
      {
        text: 'Learn more \n\nParent topic:[Governing assets in AI use cases]',
        document_id: '391DBD504569F02CCC48B181E3B953198C8F3C8A_8.txt',
      },
    ],
    scores: {
      answer_correctness: 0.0,
      faithfulness: 0.0909,
      context_correctness: 0.0,
    },
  },
  {
    question: 'What foundation models are available on Watsonx, and which of these has IBM built?',
    correct_answers: [
      'The following foundation models are available on Watsonx:\n\n1. flan-t5-xl-3b\n2. flan-t5-xxl-11b\n3. flan-ul2-20b\n4. gpt-neox-20b\n5. granite-13b-chat-v2 (IBM built)\n6. granite-13b-chat-v1 (IBM built)\n7. granite-13b-instruct-v2 (IBM built)\n8. granite-13b-instruct-v1 (IBM built)\n9. llama-2-13b-chat\n10. llama-2-70b-chat\n11. mpt-7b-instruct2\n12. mt0-xxl-13b\n13. starcoder-15.5b\n\n The Granite family of foundation models, including granite-13b-chat-v2, granite-13b-chat-v1, and granite-13b-instruct-v2 has been build by IBM.',
    ],
    question_id: 'q_id_1',
    answer: 'I cannot answer this question, because I am just a mocked model.',
    answer_contexts: [
      {
        text: 'Retrieval-augmented generation \n\nYou can use foundation models in IBM watsonx.ai to generate factually accurate output.',
        document_id: '752D982C2F694FFEE2A312CEA6ADF22C2384D4B2_0.txt',
      },
      {
        text: 'Methods for tuning foundation models \n\nLearn more about different tuning methods and how they work.',
        document_id: '15A014C514B00FF78C689585F393E21BAE922DB2_0.txt',
      },
      {
        text: 'Foundation models built by IBM \n\nIn IBM watsonx.ai, you can use IBM foundation models that are built with integrity and designed for business.',
        document_id: 'B2593108FA446C4B4B0EF5ADC2CD5D9585B0B63C_0.txt',
      },
    ],
    scores: {
      answer_correctness: 0.0,
      faithfulness: 0.1818,
      context_correctness: 0.2,
    },
  },
  {
    question:
      'How can I ensure that the generated answers will be accurate, factual and based on my information?',
    correct_answers: [
      "To ensure a language model provides the most accurate and factual answers to questions based on your data, you can follow these steps:\n1. Utilize Retrieval-augmented generation pattern. In this pattaern, you provide the relevant facts from your dataset as context in your prompt text. This will guide the model to generate responses grounded in the provided data\n2. Prompt Engineering: Experiment with prompt engineering techniques to shape the model's output. Understand the capabilities and limitations of the foundation model by fine-tuning prompts and adjusting inputs to align with the desired output. This process helps in refining the generated responses for accuracy.\n3. Review and Validate Output: Regularly review the generated output for biased, inappropriate, or incorrect content. Third-party models may produce outputs containing misinformation, offensive language, or biased content. Implement mechanisms to evaluate and validate the accuracy of the model's responses, ensuring alignment with factual information from your dataset.\n",
      'Use the Retrieval-Augmented Generation (RAG) pattern to ground model responses in your own data. Provide relevant documents as context in your prompt, and always review the output for accuracy.',
      'You can improve accuracy by combining RAG with prompt engineering techniques and enabling AI guardrails in the Prompt Lab to filter harmful or incorrect content.',
    ],
    question_id: 'q_id_2',
    answer: 'I cannot answer this question, because I am just a mocked model.',
    answer_contexts: [
      {
        text: "Functions used in Watson Pipelines's Expression Builder \n\nUse these functions in Pipelines code editors.",
        document_id: 'E933C12C1DF97E13CBA40BCD54E4F4B8133DA10C_0.txt',
      },
      {
        text: 'Table 1. Supported values, defaults, and usage notes for sampling decoding\n\n Parameter        Supported values                                                                                 Default  Use',
        document_id: '42AE491240EF740E6A8C5CF32B817E606F554E49_1.txt',
      },
      {
        text: 'applygmm properties \n\nYou can use the Gaussian Mixture node to generate a Gaussian Mixture model nugget.',
        document_id: 'F2D3C76D5EABBBF72A0314F29374527C8339591A_0.txt',
      },
    ],
    scores: {
      answer_correctness: 0.0146,
      faithfulness: 0.1818,
      context_correctness: 0.0,
    },
  },
];
