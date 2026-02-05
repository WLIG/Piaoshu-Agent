import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/articles/[id] - 获取单篇文章详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const article = await db.article.findUnique({
      where: { id: params.id }
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: article
    });

  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/articles/[id] - 更新单篇文章
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, content, summary, category, tags, difficulty, author } = body;

    const article = await db.article.update({
      where: { id: params.id },
      data: {
        title,
        content,
        summary,
        category,
        tags,
        difficulty,
        author,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: article,
      message: '文章更新成功'
    });

  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/articles/[id] - 删除单篇文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.article.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: '文章删除成功'
    });

  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}