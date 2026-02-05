import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/articles/import - 批量导入文章
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articles } = body;

    if (!Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Articles array is required' },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const article of articles) {
      try {
        await db.article.create({
          data: {
            title: article.title,
            content: article.content,
            summary: article.summary,
            coverImage: article.coverImage,
            author: article.author || 'Piaoshu',
            tags: Array.isArray(article.tags) ? article.tags.join(',') : article.tags,
            category: article.category,
            difficulty: article.difficulty || 1,
            publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
          },
        });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to import: ${article.title}`);
        console.error('Error importing article:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: `Imported ${results.success} articles, ${results.failed} failed`,
    });
  } catch (error) {
    console.error('Error importing articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import articles' },
      { status: 500 }
    );
  }
}

// GET /api/articles/import - 获取导入模板
export async function GET() {
  const template = {
    articles: [
      {
        title: '示例文章标题',
        content: '这是文章的完整内容...',
        summary: '这是AI生成的文章摘要',
        coverImage: 'https://example.com/cover.jpg',
        author: '作者名',
        tags: ['标签1', '标签2'],
        category: '分类',
        difficulty: 1,
        publishedAt: '2024-01-01T00:00:00.000Z',
      },
    ],
  };

  return NextResponse.json({
    success: true,
    data: template,
    message: 'Import template',
  });
}
