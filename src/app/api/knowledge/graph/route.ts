import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/knowledge/graph - 获取知识图谱
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json(
        { success: false, error: 'articleId is required' },
        { status: 400 }
      );
    }

    // 获取文章相关的知识实体
    const entities = await db.knowledgeEntity.findMany({
      where: { articleId },
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
      },
    });

    // 获取实体之间的关系
    const entityIds = entities.map(e => e.id);
    const relations = await db.entityRelation.findMany({
      where: {
        OR: [
          { fromId: { in: entityIds } },
          { toId: { in: entityIds } },
        ],
      },
      include: {
        fromEntity: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        toEntity: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        entities,
        relations,
      },
    });
  } catch (error) {
    console.error('Error fetching knowledge graph:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch knowledge graph' },
      { status: 500 }
    );
  }
}

// POST /api/knowledge/graph - 创建知识实体和关系
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, entities, relations } = body;

    if (!articleId || !entities) {
      return NextResponse.json(
        { success: false, error: 'articleId and entities are required' },
        { status: 400 }
      );
    }

    // 创建实体
    const createdEntities = await Promise.all(
      entities.map((entity: any) =>
        db.knowledgeEntity.create({
          data: {
            name: entity.name,
            type: entity.type,
            description: entity.description,
            articleId,
          },
        })
      )
    );

    // 创建关系（如果提供）
    let createdRelations = [];
    if (relations && relations.length > 0) {
      createdRelations = await Promise.all(
        relations.map((relation: any) =>
          db.entityRelation.create({
            data: {
              fromId: relation.fromId,
              toId: relation.toId,
              relation: relation.relation,
              confidence: relation.confidence || 1.0,
            },
          })
        )
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        entities: createdEntities,
        relations: createdRelations,
      },
    });
  } catch (error) {
    console.error('Error creating knowledge graph:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create knowledge graph' },
      { status: 500 }
    );
  }
}
