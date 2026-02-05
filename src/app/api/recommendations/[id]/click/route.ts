import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/recommendations/[id]/click - 记录推荐点击
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recommendationId } = await params;

    // 更新推荐记录为已点击
    const recommendation = await db.recommendation.update({
      where: { id: recommendationId },
      data: { clicked: true },
    });

    // 同时记录用户行为
    await db.userBehavior.create({
      data: {
        userId: recommendation.userId,
        articleId: recommendation.articleId,
        interactionType: 'click',
        metadata: JSON.stringify({ source: 'recommendation' }),
      },
    });

    return NextResponse.json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    console.error('Error tracking recommendation click:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track recommendation click' },
      { status: 500 }
    );
  }
}
