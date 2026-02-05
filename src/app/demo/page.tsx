'use client';

// 禁用静态生成
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArticleList,
  ArticleDetail,
  ChatInterface,
  UserProfile,
  RecommendationPanel,
  KnowledgeGraph,
  StatsOverview,
} from '@/components';

export default function DemoPage() {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('articles');

  const handleArticleClick = (articleId: string) => {
    setSelectedArticleId(articleId);
    setActiveTab('detail');
  };

  const handleBack = () => {
    setSelectedArticleId(null);
    setActiveTab('articles');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">飘叔 Agent 演示</h1>
        <p className="text-muted-foreground">
          智能推荐系统 - 基于用户行为的个性化内容推荐
        </p>
      </div>

      <div className="mb-8">
        <StatsOverview />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="articles">文章列表</TabsTrigger>
              <TabsTrigger value="detail" disabled={!selectedArticleId}>
                文章详情
              </TabsTrigger>
              <TabsTrigger value="chat">AI 助手</TabsTrigger>
            </TabsList>

            <TabsContent value="articles" className="mt-6">
              <ArticleList onArticleClick={handleArticleClick} />
            </TabsContent>

            <TabsContent value="detail" className="mt-6">
              {selectedArticleId && (
                <ArticleDetail articleId={selectedArticleId} onBack={handleBack} />
              )}
            </TabsContent>

            <TabsContent value="chat" className="mt-6">
              <ChatInterface onArticleClick={handleArticleClick} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <UserProfile />
          <RecommendationPanel onArticleClick={handleArticleClick} />
          {selectedArticleId && (
            <KnowledgeGraph
              articleId={selectedArticleId}
              onEntityClick={(entityId) => console.log('Entity clicked:', entityId)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
