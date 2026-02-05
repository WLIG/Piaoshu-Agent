import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/users/[id]/stats - 获取用户统计信息
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // 获取用户行为统计
    const behaviors = await db.userBehavior.findMany({
      where: { userId },
      select: {
        interactionType: true,
        duration: true,
      },
    });

    // 计算统计数据
    const totalReads = behaviors.filter(b => b.interactionType === 'view').length;
    const totalLikes = behaviors.filter(b => b.interactionType === 'like').length;
    const totalShares = behaviors.filter(b => b.interactionType === 'share').length;
    
    const readDurations = behaviors
      .filter(b => b.interactionType === 'view' && b.duration)
      .map(b => b.duration!);
    
    const avgReadDuration = readDurations.length > 0
      ? Math.round(readDurations.reduce((a, b) => a + b, 0) / readDurations.length)
      : 0;

    // 计算用户等级（基于活跃度）
    const totalInteractions = behaviors.length;
    const level = Math.min(Math.floor(totalInteractions / 10) + 1, 10);
    const levelProgress = ((totalInteractions % 10) / 10) * 100;

    return NextResponse.json({
      success: true,
      data: {
        totalReads,
        totalLikes,
        totalShares,
        avgReadDuration,
        level,
        levelProgress,
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
