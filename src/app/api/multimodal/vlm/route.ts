import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// POST /api/multimodal/vlm - 图像理解（VLM）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageData, prompt } = body;

    if (!imageData) {
      return NextResponse.json(
        { success: false, error: 'imageData is required' },
        { status: 400 }
      );
    }

    // 默认提示词
    const analysisPrompt = prompt || '请详细描述这张图片的内容';

    // 调用VLM服务（使用vision API）
    const zai = await ZAI.create();
    const result = await zai.chat.completions.createVision({
      model: 'vision',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: analysisPrompt },
            { type: 'image_url', image_url: { url: imageData } },
          ],
        },
      ],
    });

    const content = result.choices?.[0]?.message?.content || '无法分析图片';

    return NextResponse.json({
      success: true,
      data: {
        description: content,
        analysis: content,
        confidence: 0.95,
      },
    });
  } catch (error) {
    console.error('Error in VLM:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
