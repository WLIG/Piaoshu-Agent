// NVIDIA Build API 增强版本 - 集成GLM4.7、Kimi2.5和Nemotron

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
}

interface StreamChunk {
  choices?: Array<{
    delta?: {
      content?: string;
      reasoning_content?: string;
    };
  }>;
}

export class NvidiaModelClient {
  private apiKey: string;
  private baseUrl: string;
  private username: string;

  constructor() {
    this.apiKey = process.env.NVIDIA_API_KEY || '';
    this.baseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
    this.username = process.env.NVIDIA_USERNAME || 'NVIDIABuild-Autogen-37';
  }

  // GLM4.7 调用 - 思维链推理专家
  async callGLM47(messages: Message[], options: CallOptions = {}): Promise<any> {
    const {
      temperature = 1,
      maxTokens = 16384,
      enableThinking = true,
      stream = false
    } = options;

    const payload = {
      model: 'z-ai/glm4.7',
      messages,
      temperature,
      top_p: 1,
      max_tokens: maxTokens,
      stream,
      extra_body: {
        chat_template_kwargs: {
          enable_thinking: enableThinking,
          clear_thinking: false
        }
      }
    };

    return this.makeRequest(payload, stream, 'GLM4.7');
  }

  // Kimi2.5 调用 - 创意生成大师
  async callKimi25(messages: Message[], options: CallOptions = {}): Promise<any> {
    const {
      temperature = 1.00,
      maxTokens = 16384,
      thinking = true,
      stream = false
    } = options;

    const payload = {
      model: 'moonshotai/kimi-k2.5',
      messages,
      temperature,
      top_p: 1.00,
      max_tokens: maxTokens,
      stream,
      chat_template_kwargs: {
        thinking
      }
    };

    return this.makeRequest(payload, stream, 'Kimi2.5');
  }

  // Nemotron 调用 - 专业推理分析
  async callNemotron(messages: Message[], options: CallOptions = {}): Promise<any> {
    const {
      temperature = 0.8,
      maxTokens = 2048,
      enableThinking = true,
      reasoningBudget = 1024,
      stream = false
    } = options;

    const payload = {
      model: 'nvidia/nemotron-3-nano-30b-a3b',
      messages,
      temperature,
      top_p: 1,
      max_tokens: maxTokens,
      stream,
      extra_body: {
        reasoning_budget: reasoningBudget,
        chat_template_kwargs: {
          enable_thinking: enableThinking
        }
      }
    };

    return this.makeRequest(payload, stream, 'Nemotron');
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
              const parsed = JSON.parse(data) as StreamChunk;
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

  // 智能模型选择 - 增强版
  async smartCall(messages: Message[], taskType: string = 'conversation', options: CallOptions = {}): Promise<any> {
    const messageLength = messages.reduce((sum: number, msg: Message) => sum + (msg.content?.length || 0), 0);
    
    // 复杂推理任务 - 使用Nemotron
    if (taskType === 'reasoning' || taskType === 'analysis' || messageLength > 10000) {
      console.log('🧠 使用 Nemotron 进行深度推理分析');
      return this.callNemotron(messages, { enableThinking: true, ...options });
    }
    // 创意任务 - 使用Kimi2.5
    else if (taskType === 'creative' || taskType === 'writing') {
      console.log('🎨 使用 Kimi2.5 进行创意生成');
      return this.callKimi25(messages, { thinking: true, ...options });
    }
    // 中等复杂度推理 - 使用GLM4.7
    else if (taskType === 'conversation' && messageLength > 5000) {
      console.log('💭 使用 GLM4.7 进行思维推理');
      return this.callGLM47(messages, { enableThinking: true, ...options });
    }
    // 简单对话 - 使用GLM4.7快速模式
    else {
      console.log('💬 使用 GLM4.7 进行快速对话');
      return this.callGLM47(messages, { enableThinking: false, ...options });
    }
  }

  // 专业商业分析调用
  async businessAnalysis(messages: Message[], options: CallOptions = {}): Promise<any> {
    console.log('📊 使用 Nemotron 进行专业商业分析');
    return this.callNemotron(messages, {
      temperature: 0.7,
      maxTokens: 2048,
      enableThinking: true,
      reasoningBudget: 1024,
      ...options
    });
  }

  // 视觉模型调用 (支持图片分析)
  async callVisionModel(messages: Message[], options: CallOptions = {}): Promise<any> {
    const {
      temperature = 0.3,
      maxTokens = 1000
    } = options;

    const payload = {
      model: 'meta/llama-3.2-11b-vision-instruct',
      messages,
      temperature,
      top_p: 0.9,
      max_tokens: maxTokens,
      stream: false
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Piaoshu-Agent/1.0'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Vision model error:', response.status, errorText);
        throw new Error(`Vision model API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Vision model call failed:', error);
      throw error;
    }
  }

  // 连接测试
  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.callGLM47([
        { role: 'user', content: 'Hello' }
      ], { maxTokens: 10 });
      
      return response.choices?.[0]?.message?.content ? true : false;
    } catch (error) {
      console.error('NVIDIA API connection failed:', error);
      return false;
    }
  }

  // 获取可用模型信息
  getAvailableModels(): any[] {
    return [
      {
        model: 'z-ai/glm4.7',
        name: 'GLM-4.7B',
        description: '智谱AI GLM-4.7B，支持思维链推理，适合对话和中等复杂度分析',
        maxTokens: 16384,
        supportThinking: true,
        bestFor: ['conversation', 'general_reasoning']
      },
      {
        model: 'moonshotai/kimi-k2.5',
        name: 'Kimi-K2.5',
        description: 'Moonshot Kimi-K2.5，支持长文本和创意生成',
        maxTokens: 16384,
        supportThinking: true,
        bestFor: ['creative', 'writing', 'long_text']
      },
      {
        model: 'nvidia/nemotron-3-nano-30b-a3b',
        name: 'Nemotron-3-Nano-30B',
        description: 'NVIDIA Nemotron 30B参数推理专用模型，适合复杂分析和商业决策',
        maxTokens: 16384,
        supportThinking: true,
        supportReasoning: true,
        bestFor: ['reasoning', 'analysis', 'business_decision']
      }
    ];
  }

  // 模型性能统计
  getModelStats(): any {
    return {
      'GLM4.7': {
        avgResponseTime: '13s',
        complexity: 'medium',
        reliability: 'high'
      },
      'Kimi2.5': {
        avgResponseTime: '75s',
        complexity: 'high',
        reliability: 'medium'
      },
      'Nemotron': {
        avgResponseTime: '15s',
        complexity: 'high',
        reliability: 'high'
      }
    };
  }
}