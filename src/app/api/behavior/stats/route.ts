import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/behavior/stats - 获取用户行为统计
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'anonymous';

    // 获取用户行为统计
    const behaviorStats = await db.userBehavior.groupBy({
      by: ['interactionType'],
      where: { userId },
      _count: true,
    });

    // 获取用户兴趣排行
    const topInterests = await db.userInterest.findMany({
      where: { userId },
      orderBy: { score: 'desc' },
      take: 10,
    });

    // 获取最近行为
    const recentBehaviors = await db.userBehavior.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        article: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    });

    // 计算总阅读时长
    const totalReadTime = await db.userBehavior.aggregate({
      where: {
        userId,
        interactionType: 'view',
        duration: { not: null },
      },
      _sum: {
        duration: true,
      },
    });

    // 获取用户活跃度
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { level: true, lastActiveAt: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: behaviorStats.map((stat) => ({
          type: stat.interactionType,
          count: stat._count,
        })),
        interests: topInterests,
        recentBehaviors,
        totalReadTime: totalReadTime._sum.duration || 0,
        userLevel: user?.level || 1,
        lastActiveAt: user?.lastActiveAt,
      },
    });
  } catch (error) {
    console.error('Error fetching behavior stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch behavior stats' },
      { status: 500 }
    );
  }
}
