import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/articles/search - 搜索文章
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // 简单的全文搜索（在生产环境中应该使用向量数据库）
    const where = {
      OR: [
        { title: { contains: query } },
        { content: { contains: query } },
        { summary: { contains: query } },
        { tags: { contains: query } },
        { category: { contains: query } },
      ],
    };

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        skip,
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
      }),
      db.article.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        articles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        query,
      },
    });
  } catch (error) {
    console.error('Error searching articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search articles' },
      { status: 500 }
    );
  }
}
