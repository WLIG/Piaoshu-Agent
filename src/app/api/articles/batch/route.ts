import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface ArticleInput {
  title: string;
  content: string;
  summary?: string;
  coverImage?: string;
  author?: string;
  tags: string;
  category?: string;
  difficulty?: number;
  publishedAt?: string;
}

// POST /api/articles/batch - 批量上传文章
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articles } = body as { articles: ArticleInput[] };

    if (!articles || !Array.isArray(articles)) {
      return NextResponse.json(
        { success: false, error: 'Articles array is required' },
        { status: 400 }
      );
    }

    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[]
    };

    for (const article of articles) {
      try {
        // 检查必填字段
        if (!article.title || !article.content || !article.tags) {
          results.errors.push(`文章 "${article.title || '未知'}" 缺少必填字段`);
          continue;
        }

        // 检查是否已存在
        const existing = await db.article.findFirst({
          where: { title: article.title }
        });

        if (existing) {
          results.skipped++;
          continue;
        }

        // 创建文章
        await db.article.create({
          data: {
            title: article.title,
            content: article.content,
            summary: article.summary || null,
            coverImage: article.coverImage || null,
            author: article.author || 'Piaoshu',
            tags: article.tags,
            category: article.category || '未分类',
            difficulty: article.difficulty || 1,
            publishedAt: article.publishedAt 
              ? new Date(article.publishedAt) 
              : new Date(),
          }
        });

        results.created++;
      } catch (error) {
        results.errors.push(`文章 "${article.title}" 创建失败: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: `成功创建 ${results.created} 篇文章，跳过 ${results.skipped} 篇重复文章${results.errors.length > 0 ? `，${results.errors.length} 个错误` : ''}`
    });

  } catch (error) {
    console.error('Error in batch upload:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process batch upload' },
      { status: 500 }
    );
  }
}

// GET /api/articles/batch - 获取上传模板
export async function GET() {
  const template = {
    articles: [
      {
        title: "示例文章标题",
        content: "这里是文章的完整内容...",
        summary: "文章摘要（可选）",
        category: "商业分析",
        tags: "商业模式,数据分析,案例研究",
        difficulty: 2,
        author: "Piaoshu",
        publishedAt: "2026-02-03T00:00:00.000Z",
        coverImage: null
      }
    ]
  };

  return NextResponse.json({
    success: true,
    data: {
      template,
      categories: [
        "商业分析",
        "技术趋势", 
        "产品策略",
        "数据科学",
        "创业投资",
        "实践指南",
        "系统介绍",
        "使用指南"
      ],
      difficultyLevels: {
        1: "入门级 - 基础概念介绍",
        2: "进阶级 - 需要一定背景知识",
        3: "专业级 - 深度专业内容",
        4: "专家级 - 高级理论和实践",
        5: "大师级 - 前沿研究和创新"
      }
    }
  });
}