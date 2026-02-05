# 🤖 飘叔 Agent 功能展示指南

## 🎯 核心功能概览

飘叔 Agent 是一个具备**自我进化能力**的智能知识助手，集成了以下核心功能：

1. **🧠 RAG 智能问答** - 基于知识库的检索增强生成
2. **🎯 个性化推荐** - 动态权重的混合推荐算法
3. **📊 行为追踪** - 全面的用户行为分析
4. **🕸️ 知识图谱** - 实体关系网络构建
5. **🎙️ 多模态交互** - 语音、图像、文本（API 已就绪）

---

## 📋 展示清单

### ✅ 必看功能（5分钟）
1. [ ] 主页面三大标签
2. [ ] AI 智能对话
3. [ ] 个性化推荐
4. [ ] 文章浏览
5. [ ] 演示页面

### ✅ 深度体验（15分钟）
6. [ ] 行为追踪效果
7. [ ] 用户画像变化
8. [ ] 知识图谱可视化
9. [ ] 推荐算法效果
10. [ ] API 接口测试

---

## 🎬 功能演示脚本

### 演示 1：AI 智能问答（RAG）

**目标**：展示 Agent 如何基于知识库回答问题

**步骤**：
1. 打开 http://localhost:3000
2. 点击"对话"标签
3. 输入："介绍一下飘叔"
4. 观察回答过程

**关键点**：
- ✨ **思考过程**：显示 Agent 的推理步骤
- ✨ **相关文章**：展示检索到的知识来源
- ✨ **智能回答**：基于文章内容生成的答案
- ✨ **多轮对话**：支持上下文理解

**演示对话**：
```
用户: "介绍一下飘叔"
Agent: [显示思考过程] → [检索相关文章] → [生成回答]

用户: "他有什么特点？"
Agent: [基于上下文继续回答]

用户: "推荐相关的文章"
Agent: [推荐相关文章列表]
```

---

### 演示 2：个性化推荐系统

**目标**：展示推荐算法如何根据用户行为调整

**步骤**：
1. 打开"推荐流"标签
2. 记录初始推荐结果
3. 浏览几篇"技术"分类的文章
4. 点赞其中 2-3 篇
5. 返回"推荐流"
6. 观察推荐变化

**关键点**：
- ✨ **动态调整**：推荐结果实时变化
- ✨ **兴趣学习**：系统学习用户偏好
- ✨ **混合策略**：个性化 + 探索 + 热门
- ✨ **权重算法**：多维度评分系统

**推荐算法公式**：
```
最终得分 = (兴趣分 × 40% + 热度分 × 30% + 时效分 × 20% + 难度分 × 10%) × 衰减因子
```

---

### 演示 3：行为追踪与用户画像

**目标**：展示系统如何追踪和分析用户行为

**步骤**：
1. 打开 http://localhost:3000/demo
2. 查看右侧"用户资料"初始状态
3. 在左侧文章列表中：
   - 点击文章查看详情
   - 停留 30 秒以上
   - 点赞文章
   - 分享文章
4. 刷新页面
5. 观察用户资料的变化

**关键点**：
- ✨ **实时追踪**：所有行为即时记录
- ✨ **兴趣分析**：自动计算兴趣权重
- ✨ **等级系统**：根据活跃度升级
- ✨ **数据可视化**：直观展示用户画像

**追踪的行为类型**：
- 📖 浏览（view）
- ❤️ 点赞（like）
- 📤 分享（share）
- 🔖 收藏（bookmark）
- 🖱️ 点击（click）
- ⏱️ 阅读时长
- 📊 滚动深度

---

### 演示 4：知识图谱可视化

**目标**：展示知识实体和关系网络

**步骤**：
1. 在演示页面滚动到"知识图谱"部分
2. 观察实体节点和连接线
3. 点击不同的节点
4. 查看实体详情

**关键点**：
- ✨ **实体识别**：自动提取关键实体
- ✨ **关系建立**：构建实体间联系
- ✨ **可视化**：交互式图表展示
- ✨ **知识网络**：形成知识结构

**示例实体**：
- 人物：飘叔、技术专家
- 概念：AI、机器学习、推荐系统
- 技术：Next.js、TypeScript、Prisma

---

### 演示 5：统计数据概览

**目标**：展示系统整体运行状态

**步骤**：
1. 在演示页面顶部查看"统计概览"
2. 观察四个关键指标：
   - 📚 文章总数
   - 👥 用户总数
   - 💬 对话总数
   - 🎯 推荐总数

**关键点**：
- ✨ **实时统计**：数据自动更新
- ✨ **缓存优化**：高性能查询
- ✨ **趋势分析**：增长率计算
- ✨ **数据可视化**：图表展示

---

## 🧪 API 功能测试

### 测试 1：文章管理 API

```powershell
# 1. 获取所有文章
Invoke-RestMethod -Uri "http://localhost:3000/api/articles" -Method Get

# 2. 搜索文章
Invoke-RestMethod -Uri "http://localhost:3000/api/articles/search?q=飘叔" -Method Get

# 3. 获取文章详情
Invoke-RestMethod -Uri "http://localhost:3000/api/articles/article-1" -Method Get

# 4. 创建新文章
$article = @{
    title = "测试文章"
    content = "这是一篇测试文章"
    tags = "测试,演示"
    category = "技术"
    difficulty = "beginner"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/articles" -Method Post -Body $article -ContentType "application/json"
```

---

### 测试 2：智能对话 API

```powershell
# 发送消息
$message = @{
    message = "介绍一下飘叔"
    userId = "anonymous"
    conversationId = $null
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/chat" -Method Post -Body $message -ContentType "application/json"
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "message": "飘叔是...",
    "conversationId": "conv-xxx",
    "messageId": "msg-xxx",
    "thinking": "我正在检索关于飘叔的信息...",
    "relatedArticles": [
      {
        "id": "article-1",
        "title": "飘叔的故事",
        "relevance": 0.95
      }
    ]
  }
}
```

---

### 测试 3：推荐系统 API

```powershell
# 获取个性化推荐
Invoke-RestMethod -Uri "http://localhost:3000/api/recommendations?userId=anonymous&limit=10" -Method Get
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "article": {
          "id": "article-1",
          "title": "飘叔的故事"
        },
        "score": 0.85,
        "reason": "基于你的兴趣推荐"
      }
    ],
    "strategy": {
      "personalized": 7,
      "exploratory": 2,
      "popular": 1
    }
  }
}
```

---

### 测试 4：行为追踪 API

```powershell
# 记录浏览行为
$behavior = @{
    userId = "anonymous"
    articleId = "article-1"
    interactionType = "view"
    duration = 120
    scrollDepth = 0.8
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/behavior/track" -Method Post -Body $behavior -ContentType "application/json"

# 获取用户统计
Invoke-RestMethod -Uri "http://localhost:3000/api/users/anonymous/stats" -Method Get

# 获取用户兴趣
Invoke-RestMethod -Uri "http://localhost:3000/api/users/anonymous/interests" -Method Get
```

---

### 测试 5：多模态 API（已就绪）

```powershell
# 语音识别（ASR）
$audio = @{
    audioData = "base64_encoded_audio"
    language = "zh"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/multimodal/asr" -Method Post -Body $audio -ContentType "application/json"

# 文本转语音（TTS）
$text = @{
    text = "你好，我是飘叔 Agent"
    voice = "zh-CN-XiaoxiaoNeural"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/multimodal/tts" -Method Post -Body $text -ContentType "application/json"

# 图像理解（VLM）
$image = @{
    imageData = "base64_encoded_image"
    prompt = "描述这张图片"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/multimodal/vlm" -Method Post -Body $image -ContentType "application/json"
```

---

## 🎨 界面展示要点

### 主页面设计
- ✅ **三标签布局**：推荐流、文章列表、对话
- ✅ **响应式设计**：适配各种屏幕
- ✅ **流畅动画**：Framer Motion 过渡
- ✅ **现代化 UI**：shadcn/ui 组件

### 演示页面设计
- ✅ **左右分栏**：主内容 + 侧边栏
- ✅ **组件展示**：所有业务组件集成
- ✅ **实时数据**：真实 API 连接
- ✅ **交互反馈**：清晰的状态提示

### 视觉特点
- 🎨 **配色方案**：专业的深浅色主题
- 🎨 **图标系统**：Lucide React 图标
- 🎨 **排版设计**：清晰的信息层级
- 🎨 **动效设计**：自然的交互反馈

---

## 📊 数据流展示

### 用户行为 → 推荐系统
```
用户浏览文章
    ↓
记录行为（view, like, share）
    ↓
更新用户兴趣权重
    ↓
计算推荐分数
    ↓
生成个性化推荐
    ↓
展示推荐结果
```

### 用户提问 → AI 回答
```
用户输入问题
    ↓
提取关键词
    ↓
检索相关文章（RAG）
    ↓
构建 Prompt
    ↓
调用 LLM
    ↓
生成回答
    ↓
返回答案 + 相关文章
```

### 文章阅读 → 知识图谱
```
用户阅读文章
    ↓
提取实体和关键词
    ↓
建立实体关系
    ↓
更新知识图谱
    ↓
可视化展示
```

---

## 🚀 高级功能展示

### 1. 动态衰减算法

**特点**：根据用户活跃度调整兴趣衰减速度

```typescript
// 活跃用户：兴趣更新快，衰减快
if (userLevel >= 5) {
  decayFactor = 0.95
}

// 沉默用户：兴趣稳定，衰减慢
if (daysSinceLastActive > 7) {
  decayFactor = 0.99
}
```

**演示**：
1. 连续使用系统 5 天
2. 观察推荐变化速度
3. 停止使用 7 天
4. 再次使用，观察推荐稳定性

---

### 2. 混合推荐策略

**策略分配**：
- 70% 个性化推荐（基于兴趣）
- 20% 探索性推荐（发现新内容）
- 10% 热门推荐（流行内容）

**演示**：
1. 查看推荐列表
2. 识别不同类型的推荐
3. 观察推荐多样性

---

### 3. 实时统计缓存

**优化策略**：
- 热数据缓存（5分钟）
- 冷数据按需计算
- 自动失效更新

**演示**：
1. 查看统计数据
2. 执行操作（创建文章、发送消息）
3. 观察统计更新

---

## 🎯 展示检查清单

### 基础功能（必须展示）
- [ ] 主页面加载
- [ ] 文章列表显示
- [ ] AI 对话功能
- [ ] 推荐系统工作
- [ ] 演示页面展示

### 核心功能（重点展示）
- [ ] RAG 问答效果
- [ ] 推荐算法效果
- [ ] 行为追踪效果
- [ ] 用户画像变化
- [ ] 知识图谱可视化

### 高级功能（加分项）
- [ ] API 接口测试
- [ ] 多模态 API 演示
- [ ] 性能优化展示
- [ ] 数据流程说明
- [ ] 算法原理讲解

---

## 💡 展示技巧

### 1. 准备工作
- ✅ 提前启动服务器
- ✅ 初始化示例数据
- ✅ 准备演示问题
- ✅ 清理浏览器缓存

### 2. 演示顺序
1. 先展示界面（视觉效果）
2. 再展示功能（交互效果）
3. 最后展示 API（技术实现）

### 3. 讲解要点
- 强调 **AI 能力**（RAG、推荐）
- 突出 **用户体验**（界面、交互）
- 说明 **技术架构**（API、数据库）
- 展示 **扩展性**（多模态、知识图谱）

### 4. 常见问题准备
- Q: 推荐算法如何工作？
- Q: AI 回答的准确度如何？
- Q: 系统如何学习用户偏好？
- Q: 知识图谱如何构建？
- Q: 多模态功能如何使用？

---

## 🎉 展示总结

### 核心亮点
1. **🧠 智能 AI**：RAG 问答 + 个性化推荐
2. **📊 数据驱动**：行为追踪 + 用户画像
3. **🕸️ 知识网络**：知识图谱 + 实体关系
4. **🎨 现代界面**：响应式 + 流畅动画
5. **🚀 可扩展**：多模态 + 微服务架构

### 技术优势
- ✅ 完全 TypeScript 实现
- ✅ Next.js 16 最新特性
- ✅ Prisma ORM 数据管理
- ✅ z-ai SDK 统一集成
- ✅ 模块化可扩展架构

### 应用场景
- 📚 知识库管理
- 🎓 在线学习平台
- 📰 内容推荐系统
- 🤖 智能客服助手
- 📊 数据分析平台

---

## 📞 展示支持

### 文档资源
- `使用指南.md` - 详细使用说明
- `PIAOSHU_AGENT_SUMMARY.md` - 项目总结
- `FEATURE_CHECKLIST.md` - 功能清单
- `QUICK_START.md` - 快速启动

### 测试工具
- `test-apis.ps1` - API 自动化测试
- `启动服务器.bat` - 一键启动脚本
- `初始化数据.bat` - 数据初始化脚本

---

**准备好了吗？开始展示飘叔 Agent 的强大功能吧！** 🚀✨
