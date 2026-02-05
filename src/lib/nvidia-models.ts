// NVIDIA Build API 多模型集成
// 支持 GLM4.7 和 Kimi2.5 等多种大模型

export interface NvidiaModelConfig {
  model: string;
  name: string;
  description: string;
  maxTokens: number;
  supportThinking: boolean;
  supportVision: boolean;
}

export const NVIDIA_MODELS: { [key: string]: NvidiaModelConfig } = {
  'glm4.7': {
    model: 'z-ai/glm4.7',
    name: 'GLM-4.7B',
    description: '智谱AI GLM-4.7B，支持思维链推理',
    maxTokens: 16384,
    supportThinking: true,
    supportVision: false
  },
  'kimi2.5': {
    model: 'moonshotai/kimi-k2.5',
    name: 'Kimi-K2.5',
    description: 'Moonshot Kimi-K2.5，支持长文本和思维推理',
    maxTokens: 16384,
    supportThinking: true,
    supportVision: true
  }
};

export interface NvidiaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface NvidiaResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      reasoning_content?: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class NvidiaModelClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.NVIDIA_API_KEY || '';
    this.baseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
    
    if (!this.apiKey) {
      throw new Error('NVIDIA_API_KEY is required');
    }
  }

  // GLM4.7 调用 - 支持思维链推理
  async callGLM47(
    messages: NvidiaMessage[],
    options: {
      temperature?: number;
      topP?: number;
      maxTokens?: number;
      enableThinking?: boolean;
      clearThinking?: boolean;
      stream?: boolean;
    } = {}
  ): Promise<NvidiaResponse> {
    const {
      temperature = 0.7,
      topP = 0.9,
      maxTokens = 4096,
      enableThinking = true,
      clearThinking = false,
      stream = false
    } = options;

    const payload = {
      model: NVIDIA_MODELS.glm4.7.model,
      messages,
      temperature,
      top_p: topP,
      max_tokens: maxTokens,
      stream,
      extra_body: {
        chat_template_kwargs: {
          enable_thinking: enableThinking,
          clear_thinking: clearThinking
        }
      }
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': stream ? 'text/event-stream' : 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`GLM4.7 API error: ${response.status} ${response.statusText}`);
    }

    if (stream) {
      return this.handleStreamResponse(response);
    }

    return await response.json();
  }

  // Kimi2.5 调用 - 支持长文本和视觉
  async callKimi25(
    messages: NvidiaMessage[],
    options: {
      temperature?: number;
      topP?: number;
      maxTokens?: number;
      thinking?: boolean;
      stream?: boolean;
    } = {}
  ): Promise<NvidiaResponse> {
    const {
      temperature = 0.8,
      topP = 0.95,
      maxTokens = 8192,
      thinking = true,
      stream = false
    } = options;

    const payload = {
      model: NVIDIA_MODELS['kimi2.5'].model,
      messages,
      temperature,
      top_p: topP,
      max_tokens: maxTokens,
      stream,
      chat_template_kwargs: {
        thinking
      }
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': stream ? 'text/event-stream' : 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Kimi2.5 API error: ${response.status} ${response.statusText}`);
    }

    if (stream) {
      return this.handleStreamResponse(response);
    }

    return await response.json();
  }

  // 智能模型选择 - 根据任务类型自动选择最适合的模型
  async smartCall(
    messages: NvidiaMessage[],
    taskType: 'reasoning' | 'creative' | 'analysis' | 'conversation' = 'conversation',
    options: any = {}
  ): Promise<NvidiaResponse> {
    const messageLength = messages.reduce((sum: number, msg: NvidiaMessage) => sum + msg.content.length, 0);
    
    // 根据任务类型和消息长度智能选择模型
    if (taskType === 'reasoning' || messageLength > 8000) {
      console.log('🧠 使用 GLM4.7 进行推理任务');
      return this.callGLM47(messages, {
        enableThinking: true,
        ...options
      });
    } else if (taskType === 'creative' || taskType === 'analysis') {
      console.log('🎨 使用 Kimi2.5 进行创意/分析任务');
      return this.callKimi25(messages, {
        thinking: true,
        ...options
      });
    } else {
      // 默认使用GLM4.7进行对话
      console.log('💬 使用 GLM4.7 进行对话');
      return this.callGLM47(messages, {
        enableThinking: false,
        ...options
      });
    }
  }

  // 处理流式响应
  private async handleStreamResponse(response: Response): Promise<NvidiaResponse> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    let fullContent = '';
    let reasoningContent = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;
              
              if (delta?.reasoning_content) {
                reasoningContent += delta.reasoning_content;
              }
              
              if (delta?.content) {
                fullContent += delta.content;
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

    // 返回模拟的完整响应
    return {
      id: `nvidia-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'nvidia-model',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: fullContent,
          reasoning_content: reasoningContent
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    };
  }

  // 获取可用模型列表
  getAvailableModels(): NvidiaModelConfig[] {
    return Object.values(NVIDIA_MODELS);
  }

  // 检查API连接状态
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
}