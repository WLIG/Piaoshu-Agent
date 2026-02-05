import { NextRequest, NextResponse } from 'next/server';
import { getPiaoshuMemory } from '@/lib/memory/PiaoshuMemory';

// GET /api/memory - 获取用户记忆统计
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'anonymous';

    const memory = await getPiaoshuMemory();
    const stats = await memory.getMemoryStats(userId);

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching memory stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch memory stats' },
      { status: 500 }
    );
  }
}

// POST /api/memory - 手动存储记忆
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'anonymous', type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: 'Type and data are required' },
        { status: 400 }
      );
    }

    const memory = await getPiaoshuMemory();

    switch (type) {
      case 'preference':
        await memory.storeUserPreference(userId, {
          category: data.category,
          value: data.value,
          strength: data.strength || 0.5,
          context: data.context,
          timestamp: new Date()
        });
        break;

      case 'knowledge':
        await memory.storeKnowledgeAssociation(userId, {
          concept: data.concept,
          description: data.description,
          relatedConcepts: data.relatedConcepts || [],
          userContext: data.userContext,
          importance: data.importance || 0.5,
          timestamp: new Date()
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid memory type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Memory stored successfully'
    });
  } catch (error) {
    console.error('Error storing memory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to store memory' },
      { status: 500 }
    );
  }
}

// DELETE /api/memory - 清理过期记忆
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'anonymous';
    const days = parseInt(searchParams.get('days') || '30');

    const memory = await getPiaoshuMemory();
    await memory.cleanupExpiredMemories(userId, days);

    return NextResponse.json({
      success: true,
      message: `Cleaned up memories older than ${days} days`
    });
  } catch (error) {
    console.error('Error cleaning up memories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup memories' },
      { status: 500 }
    );
  }
}