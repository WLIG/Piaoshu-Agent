import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getHybridRecommendations } from '@/lib/recommendation/engine';

// GET /api/recommendations - 获取个性化推荐
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'anonymous';
    const limit = parseInt(searchParams.get('limit') || '10');

    // 获取混合推荐
    const recommendations = await getHybridRecommendations(userId, limit);

    if (recommendations.length === 0) {
      // 如果没有推荐，返回热门文章
      const popularArticles = await db.article.findMany({
        take: limit,
        orderBy: { viewCount: 'desc' },
        select: {
          id: true,
          title: true,
          summary: true,
          coverImage: true,
          author: true,
          tags: true,
          category: true,
          difficulty: true,
          viewCount: true,
          likeCount: true,
          shareCount: true,
          avgReadDuration: true,
          publishedAt: true,
          createdAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          articles: popularArticles.map((article) => ({
            ...article,
            score: 0,
            reason: '热门推荐',
          })),
          type: 'popular',
        },
      });
    }

    // 获取推荐文章的详细信息
    const articleIds = recommendations.map((r) => r.articleId);
    const articles = await db.article.findMany({
      where: {
        id: { in: articleIds },
      },
      select: {
        id: true,
        title: true,
        summary: true,
        coverImage: true,
        author: true,
        tags: true,
        category: true,
        difficulty: true,
        viewCount: true,
        likeCount: true,
        shareCount: true,
        avgReadDuration: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    // 合并推荐分数和理由
    const articlesWithScores = articles.map((article) => {
      const rec = recommendations.find((r) => r.articleId === article.id);
      return {
        ...article,
        score: rec?.score || 0,
        reason: rec?.reason || '推荐阅读',
      };
    });

    // 按推荐分数排序
    articlesWithScores.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      data: {
        articles: articlesWithScores,
        type: 'personalized',
      },
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
