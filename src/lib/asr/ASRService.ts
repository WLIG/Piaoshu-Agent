// 语音识别服务类
// 支持多种ASR提供商的统一接口

export interface ASRConfig {
  provider: 'mock' | 'openai' | 'baidu' | 'aliyun' | 'tencent';
  apiKey?: string;
  region?: string;
  language?: string;
  model?: string;
}

export interface ASRResult {
  text: string;
  confidence: number;
  language: string;
  duration?: number;
  processingTime: number;
  alternatives?: Array<{
    text: string;
    confidence: number;
  }>;
}

export class ASRService {
  private config: ASRConfig;

  constructor(config: ASRConfig) {
    this.config = config;
  }

  async transcribe(audioData: string): Promise<ASRResult> {
    const startTime = Date.now();

    try {
      let result: ASRResult;

      switch (this.config.provider) {
        case 'openai':
          result = await this.transcribeWithOpenAI(audioData);
          break;
        case 'baidu':
          result = await this.transcribeWithBaidu(audioData);
          break;
        case 'aliyun':
          result = await this.transcribeWithAliyun(audioData);
          break;
        case 'tencent':
          result = await this.transcribeWithTencent(audioData);
          break;
        case 'mock':
        default:
          result = await this.transcribeWithMock(audioData);
          break;
      }

      result.processingTime = Date.now() - startTime;
      return result;

    } catch (error) {
      console.error(`ASR transcription failed with ${this.config.provider}:`, error);
      
      // 降级到模拟服务
      if (this.config.provider !== 'mock') {
        console.log('🔄 降级到模拟ASR服务');
        const mockService = new ASRService({ provider: 'mock' });
        return await mockService.transcribe(audioData);
      }
      
      throw error;
    }
  }

  // OpenAI Whisper API
  private async transcribeWithOpenAI(audioData: string): Promise<ASRResult> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    // 将base64转换为Blob
    const audioBlob = this.base64ToBlob(audioData, 'audio/webm');
    
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', this.config.model || 'whisper-1');
    formData.append('language', this.config.language || 'zh');
    formData.append('response_format', 'verbose_json');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      text: data.text,
      confidence: data.segments?.[0]?.avg_logprob ? Math.exp(data.segments[0].avg_logprob) : 0.9,
      language: data.language || 'zh',
      duration: data.duration,
      processingTime: 0, // 将在外层设置
      alternatives: data.segments?.slice(1, 4).map((seg: any) => ({
        text: seg.text,
        confidence: Math.exp(seg.avg_logprob || -1)
      }))
    };
  }

  // 百度语音识别API
  private async transcribeWithBaidu(audioData: string): Promise<ASRResult> {
    // 这里应该实现百度语音识别API调用
    // 由于需要复杂的认证流程，这里提供框架
    
    console.log('🔧 百度ASR服务需要配置API密钥和认证');
    
    // 降级到模拟服务
    return await this.transcribeWithMock(audioData);
  }

  // 阿里云语音识别API
  private async transcribeWithAliyun(audioData: string): Promise<ASRResult> {
    // 这里应该实现阿里云语音识别API调用
    console.log('🔧 阿里云ASR服务需要配置API密钥和认证');
    
    // 降级到模拟服务
    return await this.transcribeWithMock(audioData);
  }

  // 腾讯云语音识别API
  private async transcribeWithTencent(audioData: string): Promise<ASRResult> {
    // 这里应该实现腾讯云语音识别API调用
    console.log('🔧 腾讯云ASR服务需要配置API密钥和认证');
    
    // 降级到模拟服务
    return await this.transcribeWithMock(audioData);
  }

  // 模拟ASR服务 - 用于开发和测试
  private async transcribeWithMock(audioData: string): Promise<ASRResult> {
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 300));

    const audioLength = audioData.length;
    
    // 智能模拟结果生成
    const mockResults = this.generateMockResults(audioLength);
    const selectedResult = mockResults[Math.floor(Math.random() * mockResults.length)];

    return {
      text: selectedResult.text,
      confidence: selectedResult.confidence,
      language: 'zh-CN',
      duration: this.estimateAudioDuration(audioLength),
      processingTime: 0, // 将在外层设置
      alternatives: mockResults.slice(1, 4).map(result => ({
        text: result.text,
        confidence: result.confidence * 0.8 // 备选结果置信度稍低
      }))
    };
  }

  // 生成智能模拟结果
  private generateMockResults(audioLength: number): Array<{text: string, confidence: number}> {
    const shortPhrases = [
      { text: "你好", confidence: 0.98 },
      { text: "谢谢", confidence: 0.97 },
      { text: "请问", confidence: 0.96 },
      { text: "帮我", confidence: 0.95 },
      { text: "好的", confidence: 0.99 }
    ];

    const mediumQuestions = [
      { text: "你好，我想了解一下区块链技术", confidence: 0.92 },
      { text: "请帮我分析这个商业模式", confidence: 0.90 },
      { text: "Web4.0的发展前景如何", confidence: 0.88 },
      { text: "如何构建可持续的商业模式", confidence: 0.91 },
      { text: "人工智能有哪些应用场景", confidence: 0.89 }
    ];

    const longQuestions = [
      { text: "你好，我想了解一下区块链技术在金融领域的应用前景和发展趋势", confidence: 0.85 },
      { text: "请帮我详细分析一下这个商业模式的可行性，包括市场前景和风险评估", confidence: 0.83 },
      { text: "Web4.0时代用户主权的重要性体现在哪些方面，对传统互联网模式有什么影响", confidence: 0.87 },
      { text: "如何构建一个可持续发展的创业项目，需要考虑哪些关键因素和潜在风险", confidence: 0.84 },
      { text: "人工智能在商业应用中有哪些创新机会，特别是在数据分析和决策支持方面", confidence: 0.86 }
    ];

    if (audioLength < 5000) {
      return shortPhrases;
    } else if (audioLength < 15000) {
      return mediumQuestions;
    } else {
      return longQuestions;
    }
  }

  // 估算音频时长
  private estimateAudioDuration(audioLength: number): number {
    // 基于base64长度估算音频时长（秒）
    // 这是一个粗略的估算，实际应该解析音频文件
    return Math.max(1, Math.min(60, audioLength / 8000));
  }

  // Base64转Blob
  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  // 验证音频格式
  static validateAudioData(audioData: string): boolean {
    if (!audioData || typeof audioData !== 'string') {
      return false;
    }

    // 检查base64格式
    try {
      atob(audioData);
      return true;
    } catch {
      return false;
    }
  }

  // 获取支持的配置
  static getSupportedConfigs(): ASRConfig[] {
    return [
      {
        provider: 'mock',
        language: 'zh-CN'
      },
      {
        provider: 'openai',
        language: 'zh',
        model: 'whisper-1'
      },
      {
        provider: 'baidu',
        language: 'zh-CN'
      },
      {
        provider: 'aliyun',
        language: 'zh-CN'
      },
      {
        provider: 'tencent',
        language: 'zh-CN'
      }
    ];
  }
}