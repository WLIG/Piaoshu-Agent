'use client';

import { useState, useEffect } from 'react';
// import { ArticleCard } from './ArticleCard';  // 临时注释掉
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  summary: string | null;
  content: string;
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

interface ArticleListProps {
  onArticleClick?: (articleId: string) => void;
}

export function ArticleList({ onArticleClick }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('latest');

  useEffect(() => {
    fetchArticles();
  }, [category, sortBy]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        category: category !== 'all' ? category : '',
        sortBy,
      });
      const response = await fetch(`/api/articles?${params}`);
      const data = await response.json();
      if (data.success) {
        setArticles(data.data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (articleId: string) => {
    try {
      await fetch('/api/behavior/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'anonymous',
          articleId,
          interactionType: 'like',
        }),
      });
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, likeCount: article.likeCount + 1 }
          : article
      ));
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleShare = async (articleId: string) => {
    try {
      await fetch('/api/behavior/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'anonymous',
          articleId,
          interactionType: 'share',
        }),
      });
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, shareCount: article.shareCount + 1 }
          : article
      ));
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索文章..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            <SelectItem value="技术">技术</SelectItem>
            <SelectItem value="生活">生活</SelectItem>
            <SelectItem value="思考">思考</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="排序" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">最新发布</SelectItem>
            <SelectItem value="popular">最受欢迎</SelectItem>
            <SelectItem value="trending">热门趋势</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, index) => (
            <div key={article.id} className="p-4 border rounded-lg">
              <h3 className="font-semibold">{article.title}</h3>
              <p className="text-sm text-muted-foreground">{article.summary}</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={() => handleLike(article.id)}>Like</Button>
                <Button size="sm" onClick={() => handleShare(article.id)}>Share</Button>
                <Button size="sm" onClick={() => onArticleClick(article.id)}>Read</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">没有找到相关文章</p>
        </div>
      )}
    </div>
  );
}
