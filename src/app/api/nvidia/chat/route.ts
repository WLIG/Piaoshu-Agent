import { NextRequest, NextResponse } from 'next/server';
import { NvidiaModelClient } from '@/lib/nvidia-models-simple';

// POST /api/nvidia/chat - NVIDIA多模型聊天API
export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json();
    const { 
      message,
      messages, 
      model = 'auto', 
      taskType = 'conversation',
      temperature = 0.7,
      maxTokens = 4096,
      enableThinking = true
    } = body;

    // 支持单个消息或消息数组
    let messageArray;
    if (message && typeof message === 'string') {
      messageArray = [{ role: 'user', content: message }];
    } else if (messages && Array.isArray(messages)) {
      messageArray = messages;
    } else {
      return NextResponse.json(
        { success: false, error: 'Message or messages array is required' },
        { status: 400 }
      );
    }

    console.log(`🚀 NVIDIA多模型调用 - 模型: ${model}, 任务类型: ${taskType}`);

    try {
      const client = new NvidiaModelClient();
      let response;

      if (model === 'glm4.7') {
        response = await client.callGLM47(messageArray, {
          temperature,
          maxTokens,
          enableThinking
        });
      } else if (model === 'kimi2.5') {
        response = await client.callKimi25(messageArray, {
          temperature,
          maxTokens,
          thinking: enableThinking
        });
      } else {
        response = await client.smartCall(messageArray, taskType, {
          temperature,
          maxTokens
        });
      }

      const assistantMessage = response.choices?.[0]?.message;
      const reasoning = assistantMessage?.reasoning_content;

      console.log(`✅ NVIDIA API调用成功 - 模型: ${response.model || model}`);
      if (reasoning) {
        console.log(`🧠 推理过程: ${reasoning.substring(0, 100)}...`);
      }

      return NextResponse.json({
        success: true,
        data: {
          id: response.id || Date.now().toString(),
          model: response.model || model,
          content: assistantMessage?.content || '抱歉，我无法生成回复。',
          reasoning: reasoning || null,
          usage: response.usage,
          timestamp: new Date().toISOString()
        }
      });

    } catch (apiError) {
      console.error('❌ NVIDIA API调用失败:', apiError);
      
      // 提供降级响应
      return NextResponse.json({
        success: true,
        data: {
          id: Date.now().toString(),
          model: model,
          content: `我是飘叔AI助手。关于您的问题"${message || messageArray[messageArray.length - 1]?.content}"，我会尽力为您提供帮助。`,
          reasoning: 'NVIDIA API暂时不可用，使用降级响应',
          usage: null,
          timestamp: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('❌ NVIDIA聊天API处理失败:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET /api/nvidia/chat - 获取可用模型信息
export async function GET() {
  try {
    const client = new NvidiaModelClient();
    const models = client.getAvailableModels();
    const isConnected = await client.checkConnection();

    return NextResponse.json({
      success: true,
      data: {
        models,
        connected: isConnected,
        apiKey: process.env.NVIDIA_API_KEY ? '已配置' : '未配置',
        username: process.env.NVIDIA_USERNAME || '未设置'
      }
    });

  } catch (error) {
    console.error('❌ 获取NVIDIA模型信息失败:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}