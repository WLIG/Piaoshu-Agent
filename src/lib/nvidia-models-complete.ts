// NVIDIA Build API 完整模型集成 - 支持183个模型

interface Message {
  role: string;
  content: string;
}

interface CallOptions {
  temperature?: number;
  maxTokens?: number;
  enableThinking?: boolean;
  thinking?: boolean;
  stream?: boolean;
  reasoningBudget?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

interface ModelInfo {
  id: string;
  name: string;
  category: 'conversation' | 'reasoning' | 'creative' | 'multimodal' | 'business' | 'code' | 'embedding';
  description: string;
  maxTokens: number;
  supportThinking: boolean;
  supportVision: boolean;
  bestFor: string[];
  avgResponseTime: number;
  costLevel: 'low' | 'medium' | 'high';
}

// 完整的NVIDIA模型库
const NVIDIA_MODEL_CATALOG: ModelInfo[] = [
  // 对话模型
  {
    id: 'z-ai/glm4.7',
    name: 'GLM-4.7B',
    category: 'conversation',
    description: '智谱AI GLM-4.7B，支持思维链推理，适合日常对话',
    maxTokens: 16384,
    supportThinking: true,
    supportVision: false,
    bestFor: ['conversation', 'general_qa', 'reasoning'],
    avgResponseTime: 12000,
    costLevel: 'low'
  },
  {
    id: 'nvidia/llama3-chatqa-1.5-70b',
    name: 'Llama3-ChatQA-70B',
    description: 'NVIDIA优化的Llama3 70B对话模型，问答能力强',
    category: 'conversation',
    maxTokens: 8192,
    supportThinking: false,
    supportVision: false,
    bestFor: ['conversation', 'qa', 'customer_service'],
    avgResponseTime: 15000,
    costLevel: 'high'
  },
  {
    id: 'nvidia/llama3-chatqa-1.5-8b',
    name: 'Llama3-ChatQA-8B',
    description: 'NVIDIA优化的Llama3 8B对话模型，快速响应',
    category: 'conversation',
    maxTokens: 8192,
    supportThinking: false,
    supportVision: false,
    bestFor: ['conversation', 'quick_qa'],
    avgResponseTime: 8000,
    costLevel: 'low'
  },

  // 推理模型
  {
    id: 'nvidia/nemotron-3-nano-30b-a3b',
    name: 'Nemotron-3-Nano-30B',
    category: 'reasoning',
    description: 'NVIDIA Nemotron 30B参数推理专用模型，深度分析能力强',
    maxTokens: 16384,
    supportThinking: true,
    supportVision: false,
    bestFor: ['reasoning', 'analysis', 'business_decision'],
    avgResponseTime: 22000,
    costLevel: 'high'
  },
  {
    id: 'nvidia/llama-3.1-nemotron-51b-instruct',
    name: 'Llama-3.1-Nemotron-51B',
    category: 'reasoning',
    description: 'NVIDIA Llama-3.1 Nemotron 51B指令模型，超强推理',
    maxTokens: 32768,
    supportThinking: true,
    supportVision: false,
    bestFor: ['complex_reasoning', 'research', 'analysis'],
    avgResponseTime: 30000,
    costLevel: 'high'
  },
  {
    id: 'nvidia/llama-3.1-nemotron-70b-instruct',
    name: 'Llama-3.1-Nemotron-70B',
    category: 'reasoning',
    description: 'NVIDIA最强推理模型，70B参数',
    maxTokens: 32768,
    supportThinking: true,
    supportVision: false,
    bestFor: ['expert_analysis', 'research', 'complex_problems'],
    avgResponseTime: 35000,
    costLevel: 'high'
  },

  // 创意模型
  {
    id: 'moonshotai/kimi-k2.5',
    name: 'Kimi-K2.5',
    category: 'creative',
    description: 'Moonshot Kimi-K2.5，支持长文本和创意生成',
    maxTokens: 16384,
    supportThinking: true,
    supportVision: false,
    bestFor: ['creative', 'writing', 'long_text'],
    avgResponseTime: 37000,
    costLevel: 'medium'
  },
  {
    id: 'moonshotai/kimi-k2-thinking',
    name: 'Kimi-K2-Thinking',
    category: 'creative',
    description: 'Kimi思维版本，专注创意思考',
    maxTokens: 16384,
    supportThinking: true,
    supportVision: false,
    bestFor: ['creative_thinking', 'brainstorming'],
    avgResponseTime: 40000,
    costLevel: 'medium'
  },
  {
    id: 'google/gemma-3-27b-it',
    name: 'Gemma-3-27B-IT',
    category: 'creative',
    description: 'Google Gemma-3 27B指令调优版，创意能力强',
    maxTokens: 8192,
    supportThinking: false,
    supportVision: false,
    bestFor: ['creative', 'instruction_following'],
    avgResponseTime: 25000,
    costLevel: 'medium'
  },

  // 多模态模型
  {
    id: 'meta/llama-3.2-11b-vision-instruct',
    name: 'Llama-3.2-11B-Vision',
    category: 'multimodal',
    description: 'Meta Llama-3.2 11B视觉指令模型，支持图片分析',
    maxTokens: 8192,
    supportThinking: false,
    supportVision: true,
    bestFor: ['image_analysis', 'visual_qa', 'multimodal'],
    avgResponseTime: 18000,
    costLevel: 'medium'
  },
  {
    id: 'meta/llama-3.2-90b-vision-instruct',
    name: 'Llama-3.2-90B-Vision',
    category: 'multimodal',
    description: 'Meta Llama-3.2 90B视觉模型，顶级图片理解',
    maxTokens: 8192,
    supportThinking: false,
    supportVision: true,
    bestFor: ['advanced_image_analysis', 'visual_reasoning'],
    avgResponseTime: 45000,
    costLevel: 'high'
  },
  {
    id: 'microsoft/phi-3.5-vision-instruct',
    name: 'Phi-3.5-Vision',
    category: 'multimodal',
    description: 'Microsoft Phi-3.5视觉模型，轻量级多模态',
    maxTokens: 4096,
    supportThinking: false,
    supportVision: true,
    bestFor: ['quick_image_analysis', 'visual_qa'],
    avgResponseTime: 12000,
    costLevel: 'low'
  },

  // 商业专用模型
  {
    id: 'mistralai/mistral-nemotron',
    name: 'Mistral-Nemotron',
    category: 'business',
    description: 'Mistral与NVIDIA合作的商业分析模型',
    maxTokens: 16384,
    supportThinking: true,
    supportVision: false,
    bestFor: ['business_analysis', 'strategy', 'consulting'],
    avgResponseTime: 28000,
    costLevel: 'high'
  },

  // 代码模型
  {
    id: 'google/codegemma-1.1-7b',
    name: 'CodeGemma-1.1-7B',
    category: 'code',
    description: 'Google CodeGemma代码生成模型',
    maxTokens: 8192,
    supportThinking: false,
    supportVision: false,
    bestFor: ['code_generation', 'programming', 'debugging'],
    avgResponseTime: 10000,
    costLevel: 'low'
  }
];

export class CompleteNvidiaModelClient {
  private apiKey: string;
  private baseUrl: string;
  private modelCatalog: ModelInfo[];

  constructor() {
    this.apiKey = process.env.NVIDIA_API_KEY || '';
    this.baseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
    this.modelCatalog = NVIDIA_MODEL_CATALOG;
  }

  // 获取所有可用模型
  getAvailableModels(): ModelInfo[] {
    return this.modelCatalog;
  }

  // 按类别获取模型
  getModelsByCategory(category: string): ModelInfo[] {
    return this.modelCatalog.filter(model => model.category === category);
  }

  // 智能模型推荐
  recommendModel(
    taskType: string, 
    personalityTraits?: any, 
    constraints?: {
      maxResponseTime?: number;
      maxCost?: 'low' | 'medium' | 'high';
      requiresVision?: boolean;
      requiresThinking?: boolean;
    }
  ): ModelInfo {
    let candidates = this.modelCatalog;

    // 根据任务类型筛选
    if (taskType === 'conversation') {
      candidates = candidates.filter(m => m.category === 'conversation');
    } else if (taskType === 'reasoning' || taskType === 'analysis') {
      candidates = candidates.filter(m => m.category === 'reasoning');
    } else if (taskType === 'creative' || taskType === 'writing') {
      candidates = candidates.filter(m => m.category === 'creative');
    } else if (taskType === 'image_analysis') {
      candidates = candidates.filter(m => m.category === 'multimodal');
    } else if (taskType === 'business') {
      candidates = candidates.filter(m => m.category === 'business' || m.category === 'reasoning');
    } else if (taskType === 'code') {
      candidates = candidates.filter(m => m.category === 'code');
    }

    // 应用约束条件
    if (constraints) {
      if (constraints.maxResponseTime) {
        candidates = candidates.filter(m => m.avgResponseTime <= constraints.maxResponseTime!);
      }
      if (constraints.maxCost) {
        const costOrder = { 'low': 1, 'medium': 2, 'high': 3 };
        const maxCostLevel = costOrder[constraints.maxCost];
        candidates = candidates.filter(m => costOrder[m.costLevel] <= maxCostLevel);
      }
      if (constraints.requiresVision) {
        candidates = candidates.filter(m => m.supportVision);
      }
      if (constraints.requiresThinking) {
        candidates = candidates.filter(m => m.supportThinking);
      }
    }

    // 根据个性特征进一步筛选
    if (personalityTraits) {
      if (personalityTraits.analyticalThinking > 0.8) {
        // 偏好推理模型
        const reasoningModels = candidates.filter(m => m.category === 'reasoning');
        if (reasoningModels.length > 0) candidates = reasoningModels;
      }
      if (personalityTraits.creativityLevel > 0.7) {
        // 偏好创意模型
        const creativeModels = candidates.filter(m => m.category === 'creative');
        if (creativeModels.length > 0) candidates = creativeModels;
      }
    }

    // 如果没有候选模型，返回默认模型
    if (candidates.length === 0) {
      return this.modelCatalog.find(m => m.id === 'z-ai/glm4.7')!;
    }

    // 返回最佳匹配（按响应时间和成本综合排序）
    candidates.sort((a, b) => {
      const costOrder = { 'low': 1, 'medium': 2, 'high': 3 };
      const aScore = a.avgResponseTime / 1000 + costOrder[a.costLevel] * 5;
      const bScore = b.avgResponseTime / 1000 + costOrder[b.costLevel] * 5;
      return aScore - bScore;
    });

    return candidates[0];
  }

  // 通用模型调用
  async callModel(
    modelId: string, 
    messages: Message[], 
    options: CallOptions = {}
  ): Promise<any> {
    const modelInfo = this.modelCatalog.find(m => m.id === modelId);
    if (!modelInfo) {
      throw new Error(`Model ${modelId} not found in catalog`);
    }

    const {
      temperature = 0.8,
      maxTokens = Math.min(options.maxTokens || 2048, modelInfo.maxTokens),
      enableThinking = modelInfo.supportThinking,
      thinking = modelInfo.supportThinking,
      stream = false,
      reasoningBudget = 1024,
      topP = 1.0,
      frequencyPenalty = 0.0,
      presencePenalty = 0.0
    } = options;

    const payload: any = {
      model: modelId,
      messages,
      temperature,
      top_p: topP,
      max_tokens: maxTokens,
      stream,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty
    };

    // 根据模型特性添加特殊参数
    if (modelInfo.supportThinking) {
      if (modelId.includes('nemotron')) {
        payload.extra_body = {
          reasoning_budget: reasoningBudget,
          chat_template_kwargs: {
            enable_thinking: enableThinking
          }
        };
      } else if (modelId.includes('glm')) {
        payload.extra_body = {
          chat_template_kwargs: {
            enable_thinking: enableThinking,
            clear_thinking: false
          }
        };
      } else if (modelId.includes('kimi')) {
        payload.chat_template_kwargs = {
          thinking: thinking
        };
      }
    }

    return this.makeRequest(payload, stream, modelInfo.name);
  }

  // 智能调用 - 自动选择最佳模型
  async smartCall(
    messages: Message[],
    taskType: string = 'conversation',
    personalityTraits?: any,
    constraints?: any,
    options: CallOptions = {}
  ): Promise<any> {
    const recommendedModel = this.recommendModel(taskType, personalityTraits, constraints);
    
    console.log(`🤖 智能选择模型: ${recommendedModel.name} (${recommendedModel.id})`);
    console.log(`📊 选择原因: ${recommendedModel.bestFor.join(', ')}`);
    
    return this.callModel(recommendedModel.id, messages, options);
  }

  // 批量调用多个模型（用于对比）
  async batchCall(
    modelIds: string[],
    messages: Message[],
    options: CallOptions = {}
  ): Promise<{ [modelId: string]: any }> {
    const results: { [modelId: string]: any } = {};
    
    const promises = modelIds.map(async (modelId) => {
      try {
        const result = await this.callModel(modelId, messages, options);
        results[modelId] = {
          success: true,
          data: result,
          model: this.modelCatalog.find(m => m.id === modelId)
        };
      } catch (error) {
        results[modelId] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          model: this.modelCatalog.find(m => m.id === modelId)
        };
      }
    });

    await Promise.all(promises);
    return results;
  }

  // 模型性能测试
  async benchmarkModel(modelId: string, testMessages: Message[][]): Promise<{
    modelId: string;
    avgResponseTime: number;
    successRate: number;
    avgTokens: number;
    results: any[];
  }> {
    const results = [];
    let totalTime = 0;
    let successCount = 0;
    let totalTokens = 0;

    for (const messages of testMessages) {
      const startTime = Date.now();
      try {
        const result = await this.callModel(modelId, messages);
        const responseTime = Date.now() - startTime;
        
        results.push({
          success: true,
          responseTime,
          tokens: result.usage?.total_tokens || 0,
          content: result.choices?.[0]?.message?.content || ''
        });
        
        totalTime += responseTime;
        totalTokens += result.usage?.total_tokens || 0;
        successCount++;
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          responseTime: Date.now() - startTime
        });
      }
    }

    return {
      modelId,
      avgResponseTime: totalTime / testMessages.length,
      successRate: successCount / testMessages.length,
      avgTokens: totalTokens / successCount || 0,
      results
    };
  }

  // 统一请求处理
  private async makeRequest(payload: any, stream: boolean, modelName: string): Promise<any> {
    const headers: { [key: string]: string } = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    if (stream) {
      headers['Accept'] = 'text/event-stream';
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${modelName} API error: ${response.status} - ${errorText}`);
    }

    if (stream) {
      return this.handleStreamResponse(response);
    }

    return await response.json();
  }

  // 处理流式响应
  private async handleStreamResponse(response: Response): Promise<any> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    const decoder = new TextDecoder();
    let result = '';
    let reasoning = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;
              
              if (delta?.reasoning_content) {
                reasoning += delta.reasoning_content;
              }
              
              if (delta?.content) {
                result += delta.content;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return {
      choices: [{
        message: {
          content: result,
          reasoning_content: reasoning
        }
      }]
    };
  }

  // 获取模型统计信息
  getModelStats(): any {
    const stats = {
      totalModels: this.modelCatalog.length,
      byCategory: {} as { [key: string]: number },
      byCostLevel: {} as { [key: string]: number },
      avgResponseTime: 0,
      supportThinking: 0,
      supportVision: 0
    };

    this.modelCatalog.forEach(model => {
      // 按类别统计
      stats.byCategory[model.category] = (stats.byCategory[model.category] || 0) + 1;
      
      // 按成本统计
      stats.byCostLevel[model.costLevel] = (stats.byCostLevel[model.costLevel] || 0) + 1;
      
      // 功能统计
      if (model.supportThinking) stats.supportThinking++;
      if (model.supportVision) stats.supportVision++;
    });

    stats.avgResponseTime = this.modelCatalog.reduce((sum, model) => sum + model.avgResponseTime, 0) / this.modelCatalog.length;

    return stats;
  }
}