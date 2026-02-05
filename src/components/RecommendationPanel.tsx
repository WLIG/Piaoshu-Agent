'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Recommendation {
  id: string;
  article: {
    id: string;
    title: string;
    category: string | null;
    coverImage: string | null;
    viewCount: number;
    avgReadDuration: number;
  };
  score: number;
  reason: string | null;
}

interface RecommendationPanelProps {
  userId?: string;
  onArticleClick?: (articleId: string) => void;
}

export function RecommendationPanel({ userId = 'anonymous', onArticleClick }: RecommendationPanelProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [userId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recommendations?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (recommendation: Recommendation) => {
    try {
      await fetch(`/api/recommendations/${recommendation.id}/click`, {
        method: 'POST',
      });
      onArticleClick?.(recommendation.article.id);
    } catch (error) {
      console.error('Error tracking recommendation click:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            为你推荐
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          为你推荐
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => handleClick(rec)}
              >
                <div className="flex gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                  {rec.article.coverImage ? (
                    <div className="flex-shrink-0 w-20 h-20 rounded overflow-hidden">
                      <img
                        src={rec.article.coverImage}
                        alt={rec.article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-20 h-20 rounded bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                      {rec.article.title}
                    </h4>
                    {rec.reason && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                        {rec.reason}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {rec.article.category && (
                        <Badge variant="secondary" className="text-xs">
                          {rec.article.category}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{Math.round(rec.article.avgReadDuration / 60)}分钟</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
