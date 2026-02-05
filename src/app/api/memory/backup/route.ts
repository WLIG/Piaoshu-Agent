import { NextRequest, NextResponse } from 'next/server';
import { getPiaoshuMemory } from '@/lib/memory/PiaoshuMemory';

// POST /api/memory/backup - 备份记忆数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'anonymous', action } = body;

    const memory = await getPiaoshuMemory();

    switch (action) {
      case 'backup':
        await memory.backupMemoriesToDatabase(userId);
        return NextResponse.json({
          success: true,
          message: 'Memory backup completed successfully'
        });

      case 'restore':
        await memory.restoreMemoriesFromDatabase(userId);
        return NextResponse.json({
          success: true,
          message: 'Memory restore completed successfully'
        });

      case 'export':
        const exportData = await memory.exportMemories(userId);
        return NextResponse.json({
          success: true,
          data: exportData
        });

      case 'import':
        const { memoryData } = body;
        if (!memoryData) {
          return NextResponse.json(
            { success: false, error: 'Memory data is required for import' },
            { status: 400 }
          );
        }
        const importSuccess = await memory.importMemories(userId, memoryData);
        return NextResponse.json({
          success: importSuccess,
          message: importSuccess ? 'Memory import completed successfully' : 'Memory import failed'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: backup, restore, export, or import' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in memory backup operation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform memory backup operation' },
      { status: 500 }
    );
  }
}

// GET /api/memory/backup - 获取备份状态
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'anonymous';

    const memory = await getPiaoshuMemory();
    const stats = await memory.getMemoryStats(userId);

    return NextResponse.json({
      success: true,
      data: {
        userId,
        stats,
        backupAvailable: stats.totalConversations > 0 || stats.totalPreferences > 0 || stats.totalKnowledge > 0,
        lastCheck: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting backup status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get backup status' },
      { status: 500 }
    );
  }
}