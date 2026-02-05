import { NextRequest, NextResponse } from 'next/server';
import { getPiaoshuMemory } from '@/lib/memory/PiaoshuMemory';

// POST /api/memory/search - 搜索相关记忆
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      query, 
      userId = 'anonymous', 
      type = 'all',
      limit = 10,
      minSimilarity = 0.7
    } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    const memory = await getPiaoshuMemory();
    const memories = await memory.retrieveRelevantMemories(query, userId, {
      type,
      limit,
      minSimilarity
    });

    return NextResponse.json({
      success: true,
      data: {
        query,
        memories,
        total: memories.length
      }
    });
  } catch (error) {
    console.error('Error searching memories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search memories' },
      { status: 500 }
    );
  }
}