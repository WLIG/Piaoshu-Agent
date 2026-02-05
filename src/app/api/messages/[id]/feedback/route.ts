import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/messages/[id]/feedback - 提交消息反馈
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await params;
    const body = await request.json();
    const { feedback } = body;

    if (feedback !== 1 && feedback !== -1) {
      return NextResponse.json(
        { success: false, error: 'Feedback must be 1 (like) or -1 (dislike)' },
        { status: 400 }
      );
    }

    // 更新消息反馈
    const message = await db.message.update({
      where: { id: messageId },
      data: { feedback },
    });

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error updating message feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update message feedback' },
      { status: 500 }
    );
  }
}
