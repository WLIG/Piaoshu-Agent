'use client';

import { useState, useEffect, MouseEvent, ChangeEvent, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { ChatInterface } from '@/components/ChatInterface';
import {
  BookOpen,
  MessageSquare,
  Search,
  TrendingUp,
  Heart,
  Share2,
  Clock,
  Sparkles,
  Loader2,
  Shield,
} from 'lucide-react';

// API Response types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ArticlesResponse {
  articles: Article[];
  total: number;
}

interface ChatResponse {
  conversationId: string;
  message: {
    id: string;
    content: string;
    thinking?: string;
    relatedArticles?: string;
    createdAt: string;
  };
}

interface Article {
  id: string;
  title: string;
  content?: string;
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
  createdAt: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thinking?: string;
  relatedArticles?: string;
  feedback?: number;
  createdAt: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('recommend');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // 获取文章列表
  useEffect(() => {
    fetchArticles();
  }, [activeTab]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/articles?limit=10');
      const data = await response.json() as ApiResponse<ArticlesResponse>;
      if (data.success && data.data) {
        setArticles(data.data.articles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery || !searchQuery.trim()) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/articles/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json() as ApiResponse<ArticlesResponse>;
      if (data.success && data.data) {
        setArticles(data.data.articles);
      }
    } catch (error) {
      console.error('Error searching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage || !inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setSendingMessage(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          conversationId: currentConversationId,
          userId: 'anonymous',
        }),
      });

      const data = await response.json() as ApiResponse<ChatResponse>;

      if (data.success && data.data) {
        const { conversationId, message: aiMessage } = data.data;

        setCurrentConversationId(conversationId);

        const aiMessageObj: Message = {
          id: aiMessage.id,
          role: 'assistant',
          content: aiMessage.content,
          thinking: aiMessage.thinking,
          relatedArticles: aiMessage.relatedArticles,
          createdAt: aiMessage.createdAt,
        };

        setMessages((prev) => [...prev, aiMessageObj]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，我遇到了一些问题。请稍后再试。',
        thinking: '发生错误',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // 语音输入功能（需要集成ASR）
  };

  const handleArticleClick = (article: Article) => {
    // 跳转到文章详情页面或在新标签页打开
    console.log('Opening article:', article.title);
    // 这里可以跳转到文章详情页面
    // window.open(`/articles/${article.id}`, '_blank');
    setSelectedArticle(article);
  };

  const handleLike = async (articleId: string) => {
    // 实现点赞功能
    console.log('Liked article:', articleId);
    try {
      // 调用点赞API
      const response = await fetch(`/api/articles/${articleId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        // 更新文章列表中的点赞数
        setArticles(prev => prev.map((article: Article) => 
          article.id === articleId 
            ? { ...article, likeCount: article.likeCount + 1 }
            : article
        ));
      }
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleShare = async (articleId: string) => {
    // 实现分享功能
    const article = articles.find((a: Article) => a.id === articleId);
    if (article) {
      try {
        if (typeof window !== 'undefined' && 'share' in navigator) {
          await (navigator as any).share({
            title: article.title,
            text: article.summary || '来自飘叔Agent的精彩文章',
            url: `${window.location.origin}/articles/${articleId}`
          });
        } else if (typeof window !== 'undefined' && 'clipboard' in navigator) {
          // 复制链接到剪贴板
          await (navigator as any).clipboard.writeText(`${window.location.origin}/articles/${articleId}`);
          alert('链接已复制到剪贴板');
        }
        
        // 更新分享数
        setArticles(prev => prev.map((a: Article) => 
          a.id === articleId 
            ? { ...a, shareCount: a.shareCount + 1 }
            : a
        ));
      } catch (error) {
        console.error('Error sharing article:', error);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              飘叔Agent
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索文章..."
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                className="w-64 pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => typeof window !== 'undefined' && window.open('/admin', '_blank')}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Shield className="h-4 w-4 mr-2" />
              管理后台
            </Button>
            <Avatar>
              <AvatarFallback>飘</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-96">
            <TabsTrigger value="recommend" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              推荐流
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              文章列表
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              对话
            </TabsTrigger>
          </TabsList>

          {/* 推荐流 */}
          <TabsContent value="recommend" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : articles.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无文章，请先导入内容</p>
                  </CardContent>
                </Card>
              ) : (
                articles.map((article: Article, index: number) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className="h-full hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() => handleArticleClick(article)}
                    >
                      {article.coverImage && (
                        <div className="aspect-video overflow-hidden rounded-t-lg">
                          <img
                            src={article.coverImage}
                            alt={article.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            {article.category && (
                              <Badge variant="secondary" className="mb-2">
                                {article.category}
                              </Badge>
                            )}
                            <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                          </div>
                          <Sparkles className="h-5 w-5 text-purple-500 flex-shrink-0" />
                        </div>
                        <CardDescription className="line-clamp-3">
                          {article.summary || (article.content && article.content.slice(0, 150)) || '暂无摘要'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.tags && article.tags.split(',').slice(0, 3).map((tag: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Heart
                                className="h-4 w-4 cursor-pointer hover:text-red-500 transition-colors"
                                onClick={(e: MouseEvent) => {
                                  e.stopPropagation();
                                  handleLike(article.id);
                                }}
                              />
                              <span>{article.likeCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Share2
                                className="h-4 w-4 cursor-pointer hover:text-blue-500 transition-colors"
                                onClick={(e: MouseEvent) => {
                                  e.stopPropagation();
                                  handleShare(article.id);
                                }}
                              />
                              <span>{article.shareCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{Math.round(article.avgReadDuration / 60)}分钟</span>
                            </div>
                          </div>
                          <span>{article.viewCount} 阅读</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          {/* 文章列表 */}
          <TabsContent value="articles" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>所有文章</CardTitle>
                <CardDescription>浏览知识库中的所有文章</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : articles.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        暂无文章
                      </div>
                    ) : (
                      articles.map((article: Article) => (
                        <div
                          key={article.id}
                          className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={() => handleArticleClick(article)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-2">{article.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {article.summary || (article.content && article.content.slice(0, 150))}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {article.category && (
                                  <Badge variant="outline">{article.category}</Badge>
                                )}
                                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{article.viewCount} 阅读</span>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e: MouseEvent) => {
                                e.stopPropagation();
                                handleArticleClick(article);
                              }}
                            >
                              阅读
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 对话 */}
          <TabsContent value="chat" className="mt-6">
            <ChatInterface 
              conversationId={currentConversationId || undefined}
              onArticleClick={(articleId: string) => console.log('Article clicked:', articleId)}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* 页脚 */}
      <footer className="mt-auto border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 飘叔Agent - 基于AI的智能知识助手</p>
        </div>
      </footer>

      {/* 文章详情模态框 */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {selectedArticle.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {selectedArticle.coverImage && (
                  <div className="aspect-video overflow-hidden rounded-lg">
                    <img
                      src={selectedArticle.coverImage}
                      alt={selectedArticle.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.category && (
                    <Badge variant="secondary">{selectedArticle.category}</Badge>
                  )}
                  {selectedArticle.tags && selectedArticle.tags.split(',').map((tag: string, idx: number) => (
                    <Badge key={idx} variant="outline">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {selectedArticle.author && (
                    <span>作者: {selectedArticle.author}</span>
                  )}
                  <span>{new Date(selectedArticle.publishedAt).toLocaleDateString()}</span>
                  <span>{selectedArticle.viewCount} 阅读</span>
                  <span>{Math.round(selectedArticle.avgReadDuration / 60)} 分钟</span>
                </div>
                
                <Separator />
                
                <div className="prose max-w-none">
                  {selectedArticle.summary && (
                    <div className="bg-muted/50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold mb-2">摘要</h4>
                      <p>{selectedArticle.summary}</p>
                    </div>
                  )}
                  
                  {selectedArticle.content ? (
                    <div className="whitespace-pre-wrap">
                      {selectedArticle.content}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">暂无正文内容</p>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLike(selectedArticle.id)}
                      className="flex items-center gap-2"
                    >
                      <Heart className="h-4 w-4" />
                      点赞 ({selectedArticle.likeCount})
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(selectedArticle.id)}
                      className="flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      分享 ({selectedArticle.shareCount})
                    </Button>
                  </div>
                  
                  <Button onClick={() => setSelectedArticle(null)}>
                    关闭
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}