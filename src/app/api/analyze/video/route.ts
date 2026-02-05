import { NextRequest, NextResponse } from 'next/server';
import { generateResponse } from '@/lib/agent/llm';

// POST /api/analyze/video - 视频分析API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoUrl } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Video URL is required' },
        { status: 400 }
      );
    }

    console.log('🎥 开始分析视频:', videoUrl);

    // 获取视频基本信息
    const videoExtension = videoUrl.split('.').pop()?.toLowerCase();
    const supportedFormats = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    
    if (!videoExtension || !supportedFormats.includes(videoExtension)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported video format' },
        { status: 400 }
      );
    }

    // 构建视频分析提示（由于无法直接分析视频内容，这里提供基于文件信息的分析）
    const analysisPrompt = `我收到了一个视频文件，格式为 ${videoExtension}。
    
虽然我无法直接观看视频内容，但我可以为用户提供以下帮助：

1. 视频格式信息和兼容性建议
2. 可能的视频用途和应用场景
3. 视频处理和编辑的建议
4. 如何更好地利用视频内容进行交流

请用中文回复，语言要友好专业，符合飘叔的风格。提供实用的建议和帮助。`;

    // 调用LLM进行视频分析
    const response = await generateResponse([
      { role: 'user', content: analysisPrompt }
    ], 'anonymous');

    const analysis = {
      description: response.content || '视频文件已接收，我可以为您提供相关的建议和帮助',
      details: {
        type: 'video',
        format: videoExtension,
        url: videoUrl,
        analyzedAt: new Date().toISOString(),
        confidence: 0.75,
        note: '视频内容分析需要专门的视频处理工具，当前提供基于文件信息的分析'
      },
      capabilities: [
        '视频格式转换建议',
        '视频编辑工具推荐',
        '视频压缩和优化建议',
        '视频分享和发布指导'
      ],
      suggestions: [
        '可以询问视频处理相关问题',
        '可以要求视频编辑建议',
        '可以讨论视频内容的应用场景'
      ]
    };

    console.log('✅ 视频分析完成');

    return NextResponse.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Video analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Analysis failed' },
      { status: 500 }
    );
  }
}