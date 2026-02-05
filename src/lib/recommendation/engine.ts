import { db } from '@/lib/db';

// 推荐引擎核心逻辑

interface RecommendationScore {
  articleId: string;
  score: number;
  reason: string;
}

// 动态衰减因子算法
export function calculateDecayFactor(
  userLevel: number,
  lastActiveAt: Date,
  baseDecay: number = 0.9
): number {
  const now = new Date();
  const daysSinceActive = Math.floor(
    (now.getTime() - lastActiveAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  // 活跃用户衰减快，沉默用户衰减慢
  const activityFactor = 1 + (userLevel - 1) * 0.1;
  const timeFactor = Math.pow(baseDecay, daysSinceActive);

  return activityFactor * timeFactor;
}

// 计算文章推荐分数
export async function calculateArticleScore(
  userId: string,
  articleId: string
): Promise<RecommendationScore> {
  try {
    // 获取文章信息
    const article = await db.article.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        title: true,
        category: true,
        tags: true,
        viewCount: true,
        likeCount: true,
        shareCount: true,
        difficulty: true,
        publishedAt: true,
      },
    });

    if (!article) {
      return {
        articleId,
        score: 0,
        reason: '文章不存在',
      };
    }

    // 获取用户兴趣
    const userInterests = await db.userInterest.findMany({
      where: { userId },
      orderBy: { score: 'desc' },
      take: 10,
    });

    // 获取用户活跃度
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { level: true, lastActiveAt: true },
    });

    const userLevel = user?.level || 1;
    const lastActiveAt = user?.lastActiveAt || new Date();

    // 计算动态衰减因子
    const decayFactor = calculateDecayFactor(userLevel, lastActiveAt);

    // 1. 兴趣匹配分数（最高40分）
    let interestScore = 0;
    let matchedInterests: string[] = [];

    // 检查分类匹配
    if (article.category) {
      const categoryInterest = userInterests.find(
        (ui) => ui.category === article.category
      );
      if (categoryInterest) {
        interestScore += categoryInterest.score * 0.3;
        matchedInterests.push(article.category);
      }
    }

    // 检查标签匹配
    if (article.tags) {
      const tags = article.tags.split(',').map((t) => t.trim());
      for (const tag of tags) {
        const tagInterest = userInterests.find((ui) => ui.category === tag);
        if (tagInterest) {
          interestScore += tagInterest.score * 0.1;
          matchedInterests.push(tag);
        }
      }
    }

    // 归一化兴趣分数到0-40
    interestScore = Math.min(interestScore, 40);

    // 2. 热度分数（最高30分）
    let popularityScore = 0;
    const totalInteractions = article.viewCount + article.likeCount * 5 + article.shareCount * 3;
    popularityScore = Math.min(Math.log10(totalInteractions + 1) * 10, 30);

    // 3. 时效性分数（最高20分）
    let freshnessScore = 0;
    const daysSincePublished = Math.floor(
      (new Date().getTime() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    freshnessScore = Math.max(0, 20 - daysSincePublished * 0.5);

    // 4. 难度适配分数（最高10分）
    let difficultyScore = 10 - Math.abs(article.difficulty - userLevel) * 2;
    difficultyScore = Math.max(0, difficultyScore);

    // 综合分数
    const baseScore = interestScore + popularityScore + freshnessScore + difficultyScore;

    // 应用动态衰减
    const finalScore = baseScore * decayFactor;

    // 生成推荐理由
    const reasons: string[] = [];
    if (matchedInterests.length > 0) {
      reasons.push(`符合您对"${matchedInterests.slice(0, 2).join('、')}"的兴趣`);
    }
    if (popularityScore > 20) {
      reasons.push('热门内容');
    }
    if (freshnessScore > 15) {
      reasons.push('最新发布');
    }
    if (difficultyScore >= 8) {
      reasons.push('适合您的阅读水平');
    }

    return {
      articleId,
      score: finalScore,
      reason: reasons.join('，') || '推荐阅读',
    };
  } catch (error) {
    console.error('Error calculating article score:', error);
    return {
      articleId,
      score: 0,
      reason: '计算失败',
    };
  }
}

// 生成个性化推荐列表
export async function generateRecommendations(
  userId: string,
  limit: number = 10
): Promise<RecommendationScore[]> {
  try {
    // 获取所有未读过的文章（简化版，实际应该排除已读文章）
    const articles = await db.article.findMany({
      select: { id: true },
      take: limit * 3, // 获取更多候选，然后排序
      orderBy: { publishedAt: 'desc' },
    });

    // 并行计算所有文章的推荐分数
    const scores = await Promise.all(
      articles.map((article) => calculateArticleScore(userId, article.id))
    );

    // 按分数排序
    scores.sort((a, b) => b.score - a.score);

    // 取前N个
    const recommendations = scores.slice(0, limit);

    // 保存推荐记录
    for (const rec of recommendations) {
      await db.recommendation.create({
        data: {
          userId,
          articleId: rec.articleId,
          score: rec.score,
          reason: rec.reason,
          position: recommendations.indexOf(rec) + 1,
        },
      });
    }

    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
}

// 混合推荐策略
export async function getHybridRecommendations(
  userId: string,
  limit: number = 10
): Promise<RecommendationScore[]> {
  try {
    // 1. 个性化推荐（70%）
    const personalized = await generateRecommendations(userId, Math.ceil(limit * 0.7));

    // 2. 探索性推荐（20%）- 随机推荐一些低热度但高质量的内容
    const exploratory = await db.article.findMany({
      where: {
        viewCount: { lt: 100 }, // 低热度
      },
      take: Math.ceil(limit * 0.2),
      orderBy: { likeCount: 'desc' }, // 高质量
      select: { id: true, title: true },
    });

    const exploratoryScores = exploratory.map((article) => ({
      articleId: article.id,
      score: 50 + Math.random() * 20, // 给予基础分
      reason: '发现新内容',
    }));

    // 3. 热门推荐（10%）
    const popular = await db.article.findMany({
      take: Math.ceil(limit * 0.1),
      orderBy: { viewCount: 'desc' },
      select: { id: true, title: true },
    });

    const popularScores = popular.map((article) => ({
      articleId: article.id,
      score: 60 + Math.random() * 10,
      reason: '热门推荐',
    }));

    // 合并并排序
    const allRecommendations = [
      ...personalized,
      ...exploratoryScores,
      ...popularScores,
    ];

    // 去重
    const uniqueRecs = new Map<string, RecommendationScore>();
    for (const rec of allRecommendations) {
      if (!uniqueRecs.has(rec.articleId)) {
        uniqueRecs.set(rec.articleId, rec);
      }
    }

    // 按分数排序并取前N个
    return Array.from(uniqueRecs.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting hybrid recommendations:', error);
    return [];
  }
}
