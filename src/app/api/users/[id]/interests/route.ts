import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/users/[id]/interests - 获取用户兴趣偏好
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    // 获取用户兴趣，按分数降序排列
    const interests = await db.userInterest.findMany({
      where: { userId },
      orderBy: { score: 'desc' },
      take: limit,
      select: {
        category: true,
        score: true,
        lastUpdated: true,
      },
    });

    // 归一化分数（转换为0-1之间）
    const maxScore = interests.length > 0 ? interests[0].score : 1;
    const normalizedInterests = interests.map(interest => ({
      category: interest.category,
      score: maxScore > 0 ? interest.score / maxScore : 0,
      lastUpdated: interest.lastUpdated,
    }));

    return NextResponse.json({
      success: true,
      data: normalizedInterests,
    });
  } catch (error) {
    console.error('Error fetching user interests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user interests' },
      { status: 500 }
    );
  }
}
