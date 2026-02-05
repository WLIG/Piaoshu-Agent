import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// POST /api/multimodal/tts - 文本转语音（TTS）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice = 'default', speed = 1.0 } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'text is required' },
        { status: 400 }
      );
    }

    // 调用TTS服务
    const zai = await ZAI.create();
    const response = await zai.audio.tts.create({
      input: text,
      voice,
      speed,
      response_format: 'mp3',
    });

    // 将响应转换为base64
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const audioData = buffer.toString('base64');

    return NextResponse.json({
      success: true,
      data: {
        audioData,
        duration: 0, // SDK doesn't return duration
      },
    });
  } catch (error) {
    console.error('Error in TTS:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to synthesize speech' },
      { status: 500 }
    );
  }
}
