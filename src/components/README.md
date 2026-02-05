# 飘叔 Agent 业务组件

这些组件是为飘叔 Agent 智能推荐系统设计的业务组件集合。

## 组件列表

### 1. ArticleCard (文章卡片)
展示文章摘要信息的卡片组件。

**Props:**
- `article`: 文章对象
- `index`: 索引（用于动画延迟）
- `onLike`: 点赞回调
- `onShare`: 分享回调
- `onClick`: 点击回调

**使用示例:**
```tsx
<ArticleCard
  article={article}
  index={0}
  onLike={(id) => console.log('Liked:', id)}
  onShare={(id) => console.log('Shared:', id)}
  onClick={(id) => console.log('Clicked:', id)}
/>
```

### 2. ArticleDetail (文章详情)
展示完整文章内容的组件。

**Props:**
- `articleId`: 文章 ID
- `onBack`: 返回回调

**使用示例:**
```tsx
<ArticleDetail
  articleId="article-123"
  onBack={() => console.log('Back clicked')}
/>
```

### 3. ArticleList (文章列表)
带搜索、筛选和排序功能的文章列表组件。

**Props:**
- `onArticleClick`: 文章点击回调

**使用示例:**
```tsx
<ArticleList
  onArticleClick={(id) => console.log('Article clicked:', id)}
/>
```

### 4. ChatInterface (聊天界面)
AI 助手聊天界面组件。

**Props:**
- `conversationId`: 对话 ID（可选）
- `onArticleClick`: 文章点击回调

**使用示例:**
```tsx
<ChatInterface
  conversationId="conv-123"
  onArticleClick={(id) => console.log('Article clicked:', id)}
/>
```

### 5. UserProfile (用户资料)
展示用户统计信息和兴趣偏好。

**Props:**
- `userId`: 用户 ID（默认为 'anonymous'）

**使用示例:**
```tsx
<UserProfile userId="user-123" />
```

### 6. RecommendationPanel (推荐面板)
展示个性化推荐文章列表。

**Props:**
- `userId`: 用户 ID（默认为 'anonymous'）
- `onArticleClick`: 文章点击回调

**使用示例:**
```tsx
<RecommendationPanel
  userId="user-123"
  onArticleClick={(id) => console.log('Article clicked:', id)}
/>
```

### 7. KnowledgeGraph (知识图谱)
展示文章相关的知识实体和关系。

**Props:**
- `articleId`: 文章 ID
- `onEntityClick`: 实体点击回调

**使用示例:**
```tsx
<KnowledgeGraph
  articleId="article-123"
  onEntityClick={(id) => console.log('Entity clicked:', id)}
/>
```

### 8. StatsOverview (统计概览)
展示系统整体统计数据。

**使用示例:**
```tsx
<StatsOverview />
```

## API 端点要求

这些组件需要以下 API 端点支持：

### 文章相关
- `GET /api/articles` - 获取文章列表
- `GET /api/articles/:id` - 获取文章详情

### 用户相关
- `GET /api/users/:id/stats` - 获取用户统计
- `GET /api/users/:id/interests` - 获取用户兴趣

### 推荐相关
- `GET /api/recommendations?userId=xxx` - 获取推荐列表
- `POST /api/recommendations/:id/click` - 记录推荐点击

### 聊天相关
- `GET /api/conversations/:id/messages` - 获取对话消息
- `POST /api/chat` - 发送消息
- `POST /api/messages/:id/feedback` - 提交反馈

### 行为追踪
- `POST /api/behavior/track` - 追踪用户行为

### 知识图谱
- `GET /api/knowledge/graph?articleId=xxx` - 获取知识图谱

### 统计数据
- `GET /api/stats/overview` - 获取统计概览

## 数据格式

### Article (文章)
```typescript
interface Article {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  coverImage: string | null;
  author: string | null;
  tags: string; // 逗号分隔
  category: string | null;
  difficulty: number; // 1-5
  viewCount: number;
  likeCount: number;
  shareCount: number;
  avgReadDuration: number; // 秒
  publishedAt: string;
}
```

### Message (消息)
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thinking?: string;
  relatedArticles?: string[];
  feedback?: number; // 1 或 -1
  createdAt: string;
}
```

### Recommendation (推荐)
```typescript
interface Recommendation {
  id: string;
  article: Article;
  score: number;
  reason: string | null;
}
```

## 样式要求

所有组件都使用 Tailwind CSS 和 shadcn/ui 组件库，确保项目已安装：

- `framer-motion` - 动画效果
- `lucide-react` - 图标
- `react-markdown` - Markdown 渲染
- `@radix-ui/*` - UI 组件基础

## 演示页面

访问 `/demo` 路由查看所有组件的集成演示。
