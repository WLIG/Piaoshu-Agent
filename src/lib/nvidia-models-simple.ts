// NVIDIA Build API 增强版本 - 集成GLM4.7、Kimi2.5和Nemotron

import { Record } from "@prisma/client/runtime/library";

import { Record } from "@prisma/client/runtime/library";

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

  // GLM4.7 调用 - 基于提供的Python代码
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

    const headers: Record<string, string> = {
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
      throw new Error(`GLM4.7 API error: ${response.status} - ${errorText}`);
    }

    if (stream) {
      return this.handleStreamResponse(response);
    }

    return await response.json();
  }

  // Kimi2.5 调用 - 基于提供的Python代码
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

    const headers: Record<string, string> = {
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
      throw new Error(`Kimi2.5 API error: ${response.status} - ${errorText}`);
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

  // 智能模型选择
  async smartCall(messages: Message[], taskType: string = 'conversation', options: CallOptions = {}): Promise<any> {
    const messageLength = messages.reduce((sum: number, msg: Message) => sum + msg.content.length, 0);
    
    if (taskType === 'reasoning' || messageLength > 8000) {
      console.log('🧠 使用 GLM4.7 进行推理任务');
      return this.callGLM47(messages, { enableThinking: true, ...options });
    } else if (taskType === 'creative' || taskType === 'analysis') {
      console.log('🎨 使用 Kimi2.5 进行创意/分析任务');
      return this.callKimi25(messages, { thinking: true, ...options });
    } else {
      console.log('💬 使用 GLM4.7 进行对话');
      return this.callGLM47(messages, { enableThinking: false, ...options });
    }
  }

  // 视觉模型调用 (支持图片分析)
  async callVisionModel(messages: Message[], options: CallOptions = {}): Promise<any> {
    const {
      temperature = 0.3,
      maxTokens = 1000
    } = options;

    // 使用支持的视觉模型
    const payload = {
      model: 'meta/llama-3.2-11b-vision-instruct', // 更换为支持的视觉模型
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

  // 获取模型信息
  getAvailableModels(): any[] {
    return [
      {
        model: 'z-ai/glm4.7',
        name: 'GLM-4.7B',
        description: '智谱AI GLM-4.7B，支持思维链推理',
        maxTokens: 16384,
        supportThinking: true
      },
      {
        model: 'moonshotai/kimi-k2.5',
        name: 'Kimi-K2.5',
        description: 'Moonshot Kimi-K2.5，支持长文本和思维推理',
        maxTokens: 16384,
        supportThinking: true
      }
    ];
  }
}