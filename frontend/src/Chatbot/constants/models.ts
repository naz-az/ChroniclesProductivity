export interface Model {
  id: string;
  name: string;
  description: string;
}

export interface ModelGroup {
  id: string;
  name: string;
  color: string;
  models: Model[];
}

export const MODEL_GROUPS: ModelGroup[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    color: '#10a37f',
    models: [
      { id: 'deepseek', name: 'DeepSeek-R1', description: 'Advanced reasoning and instruction following' }
    ]
  },
  {
    id: 'qwen',
    name: 'Qwen',
    color: '#ff8a00',
    models: [
      { id: 'qwen', name: 'Qwen3:8b', description: 'Balanced model for various tasks' },
      { id: 'qwen14b', name: 'Qwen3:14b', description: 'Faster, capable model' }
    ]
  },
  {
    id: 'gemini',
    name: 'Gemini',
    color: '#4285F4',
    models: [
      { id: 'gemini-flash', name: 'Gemini 1.5 Flash', description: 'Fast responses for everyday tasks' },
      { id: 'gemini-pro', name: 'Gemini 1.5 Pro', description: 'Advanced reasoning with multimodal capabilities' },
      { id: 'gemini-preview', name: 'Gemini 2.5 Flash', description: 'Preview of latest Gemini capabilities' },
      { id: 'gemini-2.5-pro-exp-03-25', name: 'Gemini 2.5 Pro Exp', description: 'Experimental Gemini 2.5 Pro model' }
    ]
  },
  /* <-- Comment out Claude group
  {
    id: 'claude',
    name: 'Claude',
    color: '#a374ff',
    models: [
      { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', description: "Anthropic's latest Sonnet model" }
    ]
  },
  */ // <-- End comment for Claude group
  /* <-- Comment out Palm group
  {
    id: 'palm',
    name: 'Palm',
    color: '#ff5a5f',
    models: [
      { id: 'palm', name: 'PaLM', description: 'Optimized for code and technical tasks' }
    ]
  }
  */ // <-- End comment for Palm group
];

// Helper function to get all models flattened
export const getAllModels = () => {
  const allModels = [];
  for (const group of MODEL_GROUPS) {
    for (const model of group.models) {
      allModels.push({...model, groupColor: group.color});
    }
  }
  return allModels;
};

// Helper function to get model details by ID
export const getModelById = (modelId: string) => {
  for (const group of MODEL_GROUPS) {
    const foundModel = group.models.find(model => model.id === modelId);
    if (foundModel) {
      return {
        ...foundModel,
        groupColor: group.color
      };
    }
  }
  // Default to first model if not found
  return {
    ...MODEL_GROUPS[0].models[0],
    groupColor: MODEL_GROUPS[0].color
  };
}; 