'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, Share2, BookmarkPlus, ArrowLeft, Clock, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Article {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  coverImage: string | null;
  author: string | null;
  tags: string;
  category: string | null;
  difficulty: number;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  avgReadDuration: number;
  publishedAt: string;
}

interface ArticleDetailProps {
  articleId: string;
  onBack?: () => void;
}

export function ArticleDetail({ articleId, onBack }: ArticleDetailProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingTime, setReadingTime] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchArticle();
    const startTime = Date.now();
    
    return () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      trackBehavior('view', duration);
    };
  }, [articleId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setReadingTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/articles/${articleId}`);
      const data = await response.json();
      if (data.success) {
        setArticle(data.data);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackBehavior = async (type: string, duration?: number) => {
    try {
      await fetch('/api/behavior/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'anonymous',
          articleId,
          interactionType: type,
          duration,
        }),
      });
    } catch (error) {
      console.error('Error tracking behavior:', error);
    }
  };

  const handleLike = () => {
    if (!liked) {
      trackBehavior('like');
      setLiked(true);
      setArticle((prev) => prev ? ({
        ...prev,
        likeCount: prev.likeCount + 1,
      }) : null);
    }
  };

  const handleShare = () => {
    trackBehavior('share');
    setArticle((prev) => prev ? ({
      ...prev,
      shareCount: prev.shareCount + 1,
    }) : null);
  };

  const handleBookmark = () => {
    trackBehavior('bookmark');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">文章未找到</p>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container max-w-4xl mx-auto py-8 px-4"
    >
      {onBack && (
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
      )}

      <Card>
        {article.coverImage && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img
              src={article.coverImage}
              alt={article.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            {article.category && (
              <Badge variant="secondary">{article.category}</Badge>
            )}
            <Badge variant="outline">难度 {article.difficulty}/5</Badge>
          </div>

          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {article.author && <span>作者: {article.author}</span>}
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{article.viewCount} 阅读</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{Math.round(article.avgReadDuration / 60)} 分钟</span>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <ScrollArea className="h-auto">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>
          </ScrollArea>

          <Separator className="my-6" />

          <div className="flex flex-wrap gap-2 mb-6">
            {article.tags.split(',').map((tag, idx) => (
              <Badge key={idx} variant="outline">
                {tag.trim()}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={liked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
              >
                <Heart className={`mr-2 h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                {article.likeCount}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                {article.shareCount}
              </Button>
              <Button variant="outline" size="sm" onClick={handleBookmark}>
                <BookmarkPlus className="mr-2 h-4 w-4" />
                收藏
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              阅读时长: {Math.floor(readingTime / 60)}:{(readingTime % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}