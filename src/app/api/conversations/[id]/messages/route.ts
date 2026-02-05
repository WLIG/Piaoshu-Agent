import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/conversations/[id]/messages - 获取对话消息列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;

    // 获取对话消息
    const messages = await db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        role: true,
        content: true,
        thinking: true,
        relatedArticles: true,
        feedback: true,
        createdAt: true,
      },
    });

    // 解析 relatedArticles（逗号分隔的字符串转数组）
    const messagesWithParsedArticles = messages.map(msg => ({
      ...msg,
      relatedArticles: msg.relatedArticles ? msg.relatedArticles.split(',') : [],
    }));

    return NextResponse.json({
      success: true,
      data: messagesWithParsedArticles,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
