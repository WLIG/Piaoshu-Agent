import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/system - 获取系统统计信息
export async function GET() {
  try {
    // 获取各种统计数据
    const [
      totalArticles,
      totalUsers,
      totalConversations,
      totalMessages,
      recentArticles,
      topCategories,
      systemStats
    ] = await Promise.all([
      db.article.count(),
      db.user.count(),
      db.conversation.count(),
      db.message.count(),
      db.article.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          author: true,
          createdAt: true,
          viewCount: true
        }
      }),
      db.article.groupBy({
        by: ['category'],
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
        take: 10
      }),
      db.article.aggregate({
        _avg: { viewCount: true, likeCount: true, difficulty: true },
        _sum: { viewCount: true, likeCount: true, shareCount: true }
      })
    ]);

    // 获取数据库大小信息
    const dbStats = await getDatabaseStats();

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalArticles,
          totalUsers,
          totalConversations,
          totalMessages,
          avgViewCount: Math.round(systemStats._avg.viewCount || 0),
          avgLikeCount: Math.round(systemStats._avg.likeCount || 0),
          avgDifficulty: Math.round((systemStats._avg.difficulty || 0) * 10) / 10,
          totalViews: systemStats._sum.viewCount || 0,
          totalLikes: systemStats._sum.likeCount || 0,
          totalShares: systemStats._sum.shareCount || 0
        },
        recentArticles,
        topCategories: topCategories.map(c => ({
          category: c.category,
          count: c._count.category
        })),
        database: dbStats
      }
    });

  } catch (error) {
    console.error('Error fetching system stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch system stats' },
      { status: 500 }
    );
  }
}

// POST /api/admin/system - 系统操作
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'reset_database':
        // 重置数据库（保留用户数据）
        await db.article.deleteMany({});
        await db.message.deleteMany({});
        await db.conversation.deleteMany({});
        await db.userBehavior.deleteMany({});
        await db.userInterest.deleteMany({});
        await db.recommendation.deleteMany({});
        await db.knowledgeEntity.deleteMany({});
        await db.entityRelation.deleteMany({});
        await db.statsCache.deleteMany({});
        
        return NextResponse.json({
          success: true,
          message: '数据库已重置（保留用户数据）'
        });

      case 'clear_all_data':
        // 清空所有数据
        await db.entityRelation.deleteMany({});
        await db.knowledgeEntity.deleteMany({});
        await db.recommendation.deleteMany({});
        await db.userInterest.deleteMany({});
        await db.userBehavior.deleteMany({});
        await db.message.deleteMany({});
        await db.conversation.deleteMany({});
        await db.article.deleteMany({});
        await db.user.deleteMany({});
        await db.systemConfig.deleteMany({});
        await db.statsCache.deleteMany({});
        
        return NextResponse.json({
          success: true,
          message: '所有数据已清空'
        });

      case 'optimize_database':
        // 数据库优化（清理无效数据）
        const cleanupResults = await optimizeDatabase();
        
        return NextResponse.json({
          success: true,
          data: cleanupResults,
          message: '数据库优化完成'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error performing system action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform system action' },
      { status: 500 }
    );
  }
}

// 获取数据库统计信息
async function getDatabaseStats() {
  try {
    const fs = require('fs');
    const path = require('path');
    const dbPath = './db/custom.db';
    
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      return {
        size: stats.size,
        sizeFormatted: formatBytes(stats.size),
        lastModified: stats.mtime.toISOString()
      };
    }
    
    return {
      size: 0,
      sizeFormatted: '0 B',
      lastModified: new Date().toISOString()
    };
  } catch (error) {
    return {
      size: 0,
      sizeFormatted: 'Unknown',
      lastModified: new Date().toISOString()
    };
  }
}

// 数据库优化
async function optimizeDatabase() {
  const results = {
    orphanedMessages: 0,
    emptyConversations: 0,
    duplicateArticles: 0
  };

  try {
    // 清理孤立的消息
    const orphanedMessages = await db.message.deleteMany({
      where: {
        conversation: null
      }
    });
    results.orphanedMessages = orphanedMessages.count;

    // 清理空对话
    const emptyConversations = await db.conversation.deleteMany({
      where: {
        messageCount: 0
      }
    });
    results.emptyConversations = emptyConversations.count;

    // 这里可以添加更多优化逻辑

  } catch (error) {
    console.error('Error optimizing database:', error);
  }

  return results;
}

// 格式化字节大小
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}