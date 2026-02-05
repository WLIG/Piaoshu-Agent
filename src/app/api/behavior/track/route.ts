import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/behavior/track - 记录用户行为
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId = 'anonymous',
      articleId,
      interactionType,
      duration,
      scrollDepth,
      metadata,
    } = body;

    if (!articleId || !interactionType) {
      return NextResponse.json(
        { success: false, error: 'articleId and interactionType are required' },
        { status: 400 }
      );
    }

    // 验证交互类型
    const validTypes = ['view', 'like', 'share', 'bookmark', 'click'];
    if (!validTypes.includes(interactionType)) {
      return NextResponse.json(
        { success: false, error: `Invalid interactionType. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // 记录行为
    const behavior = await db.userBehavior.create({
      data: {
        userId,
        articleId,
        interactionType,
        duration: duration || null,
        scrollDepth: scrollDepth || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    // 更新文章统计
    const updateData: any = {};
    if (interactionType === 'like') {
      updateData.likeCount = { increment: 1 };
    } else if (interactionType === 'share') {
      updateData.shareCount = { increment: 1 };
    } else if (interactionType === 'view' && duration) {
      // 更新平均阅读时长
      const article = await db.article.findUnique({
        where: { id: articleId },
        select: { viewCount: true, avgReadDuration: true },
      });

      if (article) {
        const totalDuration = article.avgReadDuration * article.viewCount + duration;
        updateData.avgReadDuration = Math.round(totalDuration / (article.viewCount + 1));
      }
    }

    if (Object.keys(updateData).length > 0) {
      await db.article.update({
        where: { id: articleId },
        data: updateData,
      });
    }

    // 更新用户兴趣分数
    await updateUserInterest(userId, articleId, interactionType, duration);

    return NextResponse.json({
      success: true,
      data: behavior,
    });
  } catch (error) {
    console.error('Error tracking behavior:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track behavior' },
      { status: 500 }
    );
  }
}

// 更新用户兴趣分数
async function updateUserInterest(
  userId: string,
  articleId: string,
  interactionType: string,
  duration?: number
) {
  try {
    // 获取文章分类和标签
    const article = await db.article.findUnique({
      where: { id: articleId },
      select: { category: true, tags: true },
    });

    if (!article) return;

    // 计算权重分数
    let score = 0;
    switch (interactionType) {
      case 'view':
        score = 1;
        if (duration && duration > 60) score += 2; // 阅读超过1分钟加分
        break;
      case 'like':
        score = 5;
        break;
      case 'share':
        score = 3;
        break;
      case 'bookmark':
        score = 4;
        break;
      case 'click':
        score = 0.5;
        break;
    }

    if (score <= 0) return;

    // 更新分类兴趣
    if (article.category) {
      await upsertUserInterest(userId, article.category, score);
    }

    // 更新标签兴趣（取前3个标签）
    if (article.tags) {
      const tags = article.tags.split(',').slice(0, 3);
      for (const tag of tags) {
        const trimmedTag = tag.trim();
        if (trimmedTag) {
          await upsertUserInterest(userId, trimmedTag, score * 0.8); // 标签权重稍低
        }
      }
    }
  } catch (error) {
    console.error('Error updating user interest:', error);
  }
}

// 插入或更新用户兴趣
async function upsertUserInterest(userId: string, category: string, score: number) {
  const existing = await db.userInterest.findUnique({
    where: {
      userId_category: {
        userId,
        category,
      },
    },
  });

  if (existing) {
    // 使用动态衰减：新分数与旧分数加权平均
    const newScore = existing.score * 0.8 + score * 0.2;
    await db.userInterest.update({
      where: { id: existing.id },
      data: {
        score: newScore,
        lastUpdated: new Date(),
      },
    });
  } else {
    await db.userInterest.create({
      data: {
        userId,
        category,
        score,
      },
    });
  }
}
