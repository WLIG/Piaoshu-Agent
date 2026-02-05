import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/articles - 获取所有文章（管理员视图）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { author: { contains: search } }
      ];
    }
    if (category) {
      where.category = category;
    }

    // 获取文章列表
    const articles = await db.article.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        summary: true,
        author: true,
        category: true,
        tags: true,
        difficulty: true,
        viewCount: true,
        likeCount: true,
        shareCount: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    // 获取总数
    const total = await db.article.count({ where });

    // 获取分类统计
    const categories = await db.article.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } }
    });

    return NextResponse.json({
      success: true,
      data: {
        articles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        categories: categories.map(c => ({
          name: c.category,
          count: c._count.category
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/articles - 批量删除文章
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleIds, deleteAll = false } = body;

    if (deleteAll) {
      // 删除所有文章
      const result = await db.article.deleteMany({});
      return NextResponse.json({
        success: true,
        data: { deletedCount: result.count },
        message: `已删除所有 ${result.count} 篇文章`
      });
    }

    if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No article IDs provided' },
        { status: 400 }
      );
    }

    // 批量删除指定文章
    const result = await db.article.deleteMany({
      where: {
        id: { in: articleIds }
      }
    });

    return NextResponse.json({
      success: true,
      data: { deletedCount: result.count },
      message: `已删除 ${result.count} 篇文章`
    });

  } catch (error) {
    console.error('Error deleting articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete articles' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/articles - 批量更新文章
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleIds, updates } = body;

    if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No article IDs provided' },
        { status: 400 }
      );
    }

    // 批量更新文章
    const result = await db.article.updateMany({
      where: {
        id: { in: articleIds }
      },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: { updatedCount: result.count },
      message: `已更新 ${result.count} 篇文章`
    });

  } catch (error) {
    console.error('Error updating articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update articles' },
      { status: 500 }
    );
  }
}