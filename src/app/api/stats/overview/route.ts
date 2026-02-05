import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/stats/overview - 获取系统统计概览
export async function GET(request: NextRequest) {
  try {
    // 获取总用户数（去重）
    const uniqueUsers = await db.userBehavior.findMany({
      distinct: ['userId'],
      select: { userId: true },
    });
    const totalUsers = uniqueUsers.length;

    // 获取活跃用户数（最近7天有行为的用户）
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeUsers = await db.userBehavior.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      distinct: ['userId'],
      select: { userId: true },
    });

    // 获取文章总数
    const totalArticles = await db.article.count();

    // 获取总阅读量
    const articles = await db.article.findMany({
      select: { viewCount: true },
    });
    const totalViews = articles.reduce((sum, article) => sum + article.viewCount, 0);

    // 获取平均阅读时长
    const avgReadTimeData = await db.article.aggregate({
      _avg: {
        avgReadDuration: true,
      },
    });
    const avgReadTime = Math.round(avgReadTimeData._avg.avgReadDuration || 0);

    // 计算增长率（与上周对比）
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const lastWeekUsers = await db.userBehavior.findMany({
      where: {
        createdAt: {
          gte: fourteenDaysAgo,
          lt: sevenDaysAgo,
        },
      },
      distinct: ['userId'],
      select: { userId: true },
    });

    const growthRate = lastWeekUsers.length > 0
      ? Math.round(((activeUsers.length - lastWeekUsers.length) / lastWeekUsers.length) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        activeUsers: activeUsers.length,
        totalArticles,
        totalViews,
        avgReadTime,
        growthRate,
      },
    });
  } catch (error) {
    console.error('Error fetching stats overview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats overview' },
      { status: 500 }
    );
  }
}
