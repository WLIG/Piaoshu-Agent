import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/articles - 获取文章列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const difficulty = searchParams.get('difficulty');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (tag) where.tags = { contains: tag };
    if (difficulty) where.difficulty = parseInt(difficulty);

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// POST /api/articles - 创建新文章
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      summary,
      coverImage,
      author,
      tags,
      category,
      difficulty,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const article = await db.article.create({
      data: {
        title,
        content,
        summary,
        coverImage,
        author,
        tags: Array.isArray(tags) ? tags.join(',') : tags,
        category,
        difficulty: difficulty || 1,
      },
    });

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
