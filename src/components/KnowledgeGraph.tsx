'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Network, GitBranch } from 'lucide-react';

interface Entity {
  id: string;
  name: string;
  type: string;
  description: string | null;
}

interface Relation {
  id: string;
  fromEntity: Entity;
  toEntity: Entity;
  relation: string;
  confidence: number;
}

interface KnowledgeGraphProps {
  articleId?: string;
  onEntityClick?: (entityId: string) => void;
}

export function KnowledgeGraph({ articleId, onEntityClick }: KnowledgeGraphProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (articleId) {
      fetchKnowledgeGraph();
    }
  }, [articleId]);

  const fetchKnowledgeGraph = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/knowledge/graph?articleId=${articleId}`);
      const data = await response.json();
      if (data.success) {
        setEntities(data.data.entities);
        setRelations(data.data.relations);
      }
    } catch (error) {
      console.error('Error fetching knowledge graph:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEntityColor = (type: string) => {
    const colors: Record<string, string> = {
      person: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      concept: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      event: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      location: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            知识图谱
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          知识图谱
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3">实体</h4>
              <div className="flex flex-wrap gap-2">
                {entities.map((entity) => (
                  <Badge
                    key={entity.id}
                    className={`cursor-pointer ${getEntityColor(entity.type)}`}
                    onClick={() => onEntityClick?.(entity.id)}
                  >
                    {entity.name}
                  </Badge>
                ))}
              </div>
            </div>

            {relations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">关系</h4>
                <div className="space-y-3">
                  {relations.map((relation) => (
                    <div
                      key={relation.id}
                      className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                    >
                      <Badge className={getEntityColor(relation.fromEntity.type)}>
                        {relation.fromEntity.name}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <GitBranch className="h-3 w-3" />
                        <span>{relation.relation}</span>
                      </div>
                      <Badge className={getEntityColor(relation.toEntity.type)}>
                        {relation.toEntity.name}
                      </Badge>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {Math.round(relation.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {entities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Network className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>暂无知识图谱数据</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
