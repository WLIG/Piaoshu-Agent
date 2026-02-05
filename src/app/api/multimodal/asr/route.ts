import { NextRequest, NextResponse } from 'next/server';
import { ASRService, ASRConfig } from '@/lib/asr/ASRService';

// POST /api/multimodal/asr - 语音识别API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audioData, provider = 'mock', language = 'zh-CN' } = body;

    if (!audioData) {
      return NextResponse.json(
        { success: false, error: 'Audio data is required' },
        { status: 400 }
      );
    }

    // 验证音频数据
    if (!ASRService.validateAudioData(audioData)) {
      return NextResponse.json(
        { success: false, error: 'Invalid audio data format' },
        { status: 400 }
      );
    }

    console.log(`🎤 收到语音识别请求 - 提供商: ${provider}`);

    // 配置ASR服务
    const config: ASRConfig = {
      provider: provider as any,
      language: language,
      apiKey: process.env.OPENAI_API_KEY, // 从环境变量获取API密钥
    };

    // 创建ASR服务实例
    const asrService = new ASRService(config);

    // 执行语音识别
    const result = await asrService.transcribe(audioData);

    console.log(`✅ 语音识别完成: "${result.text}" (置信度: ${(result.confidence * 100).toFixed(1)}%)`);

    return NextResponse.json({
      success: true,
      data: result,
      message: '语音识别完成',
      provider: provider
    });

  } catch (error) {
    console.error('❌ 语音识别失败:', error);
    
    // 提供详细的错误信息
    let errorMessage = 'Speech recognition failed';
    let suggestion = '';

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = '语音识别服务配置错误';
        suggestion = '请检查API密钥配置';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = '网络连接失败';
        suggestion = '请检查网络连接或稍后重试';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        suggestion: suggestion,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/multimodal/asr - 获取ASR服务状态和配置
export async function GET(request: NextRequest) {
  try {
    const supportedConfigs = ASRService.getSupportedConfigs();
    
    // 检查可用的服务提供商
    const availableProviders = [];
    
    // 检查OpenAI配置
    if (process.env.OPENAI_API_KEY) {
      availableProviders.push('openai');
    }
    
    // 模拟服务始终可用
    availableProviders.push('mock');

    return NextResponse.json({
      success: true,
      data: {
        service: 'Piaoshu ASR Service',
        version: '1.0.0',
        status: 'active',
        availableProviders: availableProviders,
        defaultProvider: availableProviders.includes('openai') ? 'openai' : 'mock',
        supportedLanguages: ['zh-CN', 'zh', 'en-US', 'en'],
        supportedFormats: ['webm', 'wav', 'mp3', 'ogg'],
        maxDuration: 60, // 秒
        maxFileSize: '10MB',
        supportedConfigs: supportedConfigs,
        features: [
          '多提供商支持',
          '智能降级机制', 
          '高精度识别',
          '实时处理',
          '多语言支持'
        ]
      },
      message: 'ASR service is running'
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get ASR service status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}