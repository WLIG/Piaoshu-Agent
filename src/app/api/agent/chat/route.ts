import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { retrieveRelevantContent, buildSystemPrompt } from '@/lib/agent/rag';
import { generateResponse } from '@/lib/agent/llm';

// POST /api/agent/chat - 发送消息并获取Agent回复
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationId, userId } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // 1. 获取或创建对话
    let conversation;
    if (conversationId) {
      conversation = await db.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 10, // 只获取最近10条消息作为上下文
          },
        },
      });
    }

    if (!conversation) {
      // 创建新对话
      conversation = await db.conversation.create({
        data: {
          userId: userId || 'anonymous',
          title: message.slice(0, 30) + (message.length > 30 ? '...' : ''),
          messageCount: 0,
        },
        include: {
          messages: true,
        },
      });
    }

    // 2. 保存用户消息
    const userMessage = await db.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    });

    // 3. RAG检索相关文章
    const { context, relatedArticles } = await retrieveRelevantContent(message);

    // 4. 构建对话历史
    const conversationHistory = conversation.messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // 5. 生成系统提示词
    const systemPrompt = buildSystemPrompt(context);

    // 6. 调用LLM生成回答
    const { content: aiContent, thinking } = await generateResponse(
      systemPrompt,
      message,
      conversationHistory
    );

    // 7. 保存AI回复
    const agentMessage = await db.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: aiContent,
        thinking,
        relatedArticles: relatedArticles.map((a) => a.id).join(','),
      },
    });

    // 8. 更新对话统计
    await db.conversation.update({
      where: { id: conversation.id },
      data: {
        messageCount: {
          increment: 2,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        userMessage,
        agentMessage,
        conversation,
        relatedArticles,
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

// GET /api/agent/chat - 获取对话历史
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}
