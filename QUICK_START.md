# 🚀 飘叔 Agent 快速启动指南

## 📋 前置要求

- Node.js 18+ 或 Bun
- SQLite 3
- z-ai API Key（用于 LLM 功能）

## ⚡ 快速启动（3 步）

### 1. 安装依赖
```bash
bun install
```

### 2. 初始化数据库
```bash
# 生成 Prisma Client
bun run db:generate

# 推送数据库 Schema
bun run db:push
```

### 3. 启动应用
```bash
# 开发模式
bun run dev
```

访问 http://localhost:3000 查看应用！

## 🎯 初始化示例数据

启动应用后，初始化 6 篇示例文章：

```bash
curl -X POST http://localhost:3000/api/seed
```

或在浏览器中访问：http://localhost:3000/api/seed

## 📱 访问页面

### 主页面
http://localhost:3000

包含三个标签页：
- **推荐流** - 个性化推荐文章
- **文章列表** - 浏览所有文章
- **对话** - 与 AI 助手聊天

### 演示页面
http://localhost:3000/demo

展示所有业务组件的集成效果：
- 文章列表（搜索、筛选、排序）
- 文章详情（阅读追踪）
- AI 聊天界面
- 用户资料
- 推荐面板
- 知识图谱
- 统计概览

## 🧪 测试功能

### 1. 浏览文章
- 在主页面点击"文章列表"标签
- 使用搜索框搜索文章
- 使用筛选器按分类筛选
- 点击文章卡片查看详情

### 2. 与 AI 对话
- 点击"对话"标签
- 输入问题，例如："介绍一下飘叔"
- 查看 AI 的回答和思考过程
- 点击相关文章标签查看推荐

### 3. 查看推荐
- 在主页面查看"推荐流"
- 系统会根据你的行为推荐文章
- 点击、阅读文章会影响推荐结果

### 4. 用户画像
- 在演示页面右侧查看用户资料
- 查看统计数据（阅读、点赞、分享）
- 查看兴趣分布

## 🔧 配置

### 环境变量
创建 `.env.local` 文件：

```env
# 数据库
DATABASE_URL="file:./db/custom.db"

# z-ai API Key（用于 LLM 功能）
Z_AI_API_KEY="your-api-key-here"
```

### 数据库位置
默认数据库文件：`./db/custom.db`

## 📚 API 端点

### 文章相关
```bash
# 获取文章列表
GET http://localhost:3000/api/articles

# 获取文章详情
GET http://localhost:3000/api/articles/{id}

# 搜索文章
GET http://localhost:3000/api/articles/search?q=关键词

# 创建文章
POST http://localhost:3000/api/articles
Content-Type: application/json
{
  "title": "文章标题",
  "content": "文章内容",
  "tags": "标签1,标签2",
  "category": "分类"
}
```

### 推荐相关
```bash
# 获取推荐
GET http://localhost:3000/api/recommendations?userId=anonymous&limit=10
```

### 对话相关
```bash
# 发送消息
POST http://localhost:3000/api/chat
Content-Type: application/json
{
  "message": "你好",
  "userId": "anonymous"
}
```

### 行为追踪
```bash
# 记录行为
POST http://localhost:3000/api/behavior/track
Content-Type: application/json
{
  "userId": "anonymous",
  "articleId": "article-id",
  "interactionType": "view",
  "duration": 120
}
```

### 统计数据
```bash
# 系统统计
GET http://localhost:3000/api/stats/overview

# 用户统计
GET http://localhost:3000/api/users/anonymous/stats

# 用户兴趣
GET http://localhost:3000/api/users/anonymous/interests
```

## 🎨 自定义

### 修改主题
编辑 `src/app/globals.css` 中的 CSS 变量

### 添加新组件
1. 在 `src/components/` 创建新组件
2. 在 `src/components/index.ts` 导出
3. 在页面中使用

### 添加新 API
1. 在 `src/app/api/` 创建新路由
2. 实现 GET/POST/PUT/DELETE 方法
3. 返回标准格式：`{ success: true, data: ... }`

## 🐛 常见问题

### Q: 数据库连接失败
A: 确保 `db` 文件夹存在，运行 `mkdir db` 创建

### Q: API 返回 500 错误
A: 检查数据库是否初始化，运行 `bun run db:push`

### Q: 推荐列表为空
A: 初始化示例数据：`curl -X POST http://localhost:3000/api/seed`

### Q: LLM 调用失败
A: 检查 `.env.local` 中的 `Z_AI_API_KEY` 是否正确

## 📖 更多文档

- **功能清单**: `FEATURE_CHECKLIST.md`
- **开发状态**: `DEVELOPMENT_STATUS.md`
- **组件文档**: `src/components/README.md`
- **项目总结**: `PIAOSHU_AGENT_SUMMARY.md`

## 🎯 下一步

1. ✅ 浏览主页面和演示页面
2. ✅ 初始化示例数据
3. ✅ 测试文章浏览功能
4. ✅ 测试 AI 对话功能
5. ✅ 测试推荐系统
6. ✅ 查看用户画像
7. ✅ 尝试创建新文章
8. ✅ 查看知识图谱

## 🚀 生产部署

### 构建
```bash
bun run build
```

### 启动
```bash
bun run start
```

### Docker（可选）
```bash
# 构建镜像
docker build -t piaoshu-agent .

# 运行容器
docker run -p 3000:3000 piaoshu-agent
```

## 💡 提示

- 多与 AI 对话，系统会学习你的兴趣
- 点赞、分享文章会影响推荐结果
- 阅读时长越长，兴趣分数越高
- 用户等级每 10 次交互升 1 级

## 🎉 开始使用

现在你已经准备好使用飘叔 Agent 了！

访问 http://localhost:3000 开始探索吧！
