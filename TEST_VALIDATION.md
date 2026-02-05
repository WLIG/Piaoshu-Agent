# 飘叔 Agent 功能验证指南

## 🚀 前置准备

### 1. 安装依赖
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 2. 生成 Prisma Client
```bash
npx prisma generate
```

### 3. 推送数据库 Schema
```bash
npx prisma db push
```

### 4. 启动开发服务器
```bash
npm run dev
```

等待服务器启动完成，看到：
```
✓ Ready in XXXms
○ Local:        http://localhost:3000
```

---

## ✅ 功能验证清单

### 基础功能测试

#### ✅ 1. 访问主页 `/`
**步骤：**
1. 打开浏览器访问 http://localhost:3000
2. 应该看到三个标签页：推荐流、文章列表、对话

**预期结果：**
- ✅ 页面正常加载
- ✅ 看到导航标签
- ✅ 没有错误提示

#### ✅ 2. 访问演示页 `/demo`
**步骤：**
1. 访问 http://localhost:3000/demo
2. 应该看到完整的组件展示

**预期结果：**
- ✅ 统计概览卡片显示
- ✅ 左侧文章列表/详情/聊天标签
- ✅ 右侧用户资料和推荐面板

#### ✅ 3. 初始化数据
**步骤：**
```bash
# 方法1：使用 curl
curl -X POST http://localhost:3000/api/seed

# 方法2：浏览器访问
# 打开 http://localhost:3000/api/seed
# 点击页面上的初始化按钮（如果有）
```

**预期结果：**
```json
{
  "success": true,
  "message": "Successfully seeded 6 articles",
  "data": {
    "created": 6,
    "skipped": 0
  }
}
```

#### ✅ 4. 查看文章列表
**步骤：**
1. 在主页点击"文章列表"标签
2. 应该看到 6 篇示例文章

**预期结果：**
- ✅ 显示文章卡片
- ✅ 每个卡片有标题、摘要、标签
- ✅ 显示阅读数、点赞数
- ✅ 有搜索框和筛选器

#### ✅ 5. 搜索文章
**步骤：**
1. 在搜索框输入关键词（如"飘叔"）
2. 按回车或等待自动搜索

**预期结果：**
- ✅ 文章列表实时过滤
- ✅ 只显示匹配的文章
- ✅ 清空搜索框恢复所有文章

#### ✅ 6. 查看文章详情
**步骤：**
1. 点击任意文章卡片
2. 切换到"文章详情"标签

**预期结果：**
- ✅ 显示完整文章内容
- ✅ Markdown 正确渲染
- ✅ 显示作者、分类、标签
- ✅ 显示阅读时长计时器
- ✅ 有点赞、分享、收藏按钮

#### ✅ 7. 点赞、分享文章
**步骤：**
1. 在文章详情页点击"点赞"按钮
2. 点击"分享"按钮

**预期结果：**
- ✅ 点赞数增加
- ✅ 分享数增加
- ✅ 按钮状态改变
- ✅ 后台记录行为

**验证 API：**
```bash
# 查看行为统计
curl http://localhost:3000/api/behavior/stats?userId=anonymous
```

---

### 智能对话测试

#### ✅ 8. 发送消息给 AI 助手
**步骤：**
1. 点击"对话"标签
2. 在输入框输入："介绍一下飘叔"
3. 点击发送按钮

**预期结果：**
- ✅ 消息显示在聊天界面
- ✅ AI 开始思考（显示加载动画）
- ✅ 收到 AI 回复
- ✅ 回复基于文章内容

#### ✅ 9. 查看 Agent 思考过程
**步骤：**
1. 查看 AI 回复的消息
2. 应该能看到思考过程（如果实现了展示）

**预期结果：**
- ✅ 显示检索到的相关文章
- ✅ 显示推理过程
- ✅ 回答准确相关

#### ✅ 10. 查看相关文章推荐
**步骤：**
1. 在 AI 回复下方查看
2. 应该有"相关文章"标签

**预期结果：**
- ✅ 显示相关文章标签
- ✅ 点击标签跳转到文章详情
- ✅ 推荐的文章与问题相关

#### ✅ 11. 提交消息反馈
**步骤：**
1. 在 AI 消息下方找到点赞/踩按钮
2. 点击点赞或踩

**预期结果：**
- ✅ 按钮状态改变
- ✅ 反馈被记录
- ✅ 可以切换反馈

**验证 API：**
```bash
# 查看对话历史
curl http://localhost:3000/api/conversations?userId=anonymous
```

---

### 推荐系统测试

#### ✅ 12. 查看个性化推荐
**步骤：**
1. 在主页"推荐流"标签查看
2. 或在演示页右侧查看推荐面板

**预期结果：**
- ✅ 显示推荐文章列表
- ✅ 每个推荐有推荐理由
- ✅ 显示文章封面、标题
- ✅ 显示阅读时长

**API 测试：**
```bash
curl http://localhost:3000/api/recommendations?userId=anonymous&limit=10
```

#### ✅ 13. 点击推荐文章
**步骤：**
1. 点击推荐面板中的任意文章
2. 应该跳转到文章详情

**预期结果：**
- ✅ 正确跳转
- ✅ 点击被记录
- ✅ 影响后续推荐

#### ✅ 14. 验证推荐更新
**步骤：**
1. 阅读几篇文章
2. 点赞一些文章
3. 刷新推荐列表

**预期结果：**
- ✅ 推荐内容发生变化
- ✅ 更多相似主题的文章
- ✅ 推荐理由更新

**验证方法：**
```bash
# 记录行为
curl -X POST http://localhost:3000/api/behavior/track \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "anonymous",
    "articleId": "文章ID",
    "interactionType": "like"
  }'

# 再次查看推荐
curl http://localhost:3000/api/recommendations?userId=anonymous
```

---

### 用户画像测试

#### ✅ 15. 查看用户统计
**步骤：**
1. 在演示页右侧查看用户资料卡片
2. 点击"统计"标签

**预期结果：**
- ✅ 显示阅读文章数
- ✅ 显示点赞数
- ✅ 显示分享数
- ✅ 显示平均阅读时长
- ✅ 显示用户等级

**API 测试：**
```bash
curl http://localhost:3000/api/users/anonymous/stats
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "totalReads": 5,
    "totalLikes": 3,
    "totalShares": 1,
    "avgReadDuration": 120,
    "level": 2,
    "levelProgress": 50
  }
}
```

#### ✅ 16. 查看用户兴趣
**步骤：**
1. 在用户资料卡片点击"兴趣"标签
2. 查看兴趣分布

**预期结果：**
- ✅ 显示兴趣类别
- ✅ 显示兴趣分数（进度条）
- ✅ 按分数排序
- ✅ 动态更新

**API 测试：**
```bash
curl http://localhost:3000/api/users/anonymous/interests
```

**预期响应：**
```json
{
  "success": true,
  "data": [
    {
      "category": "技术",
      "score": 0.85,
      "lastUpdated": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### ✅ 17. 验证等级系统
**步骤：**
1. 记录多次行为（阅读、点赞等）
2. 查看等级变化

**预期结果：**
- ✅ 每 10 次交互升 1 级
- ✅ 升级进度条更新
- ✅ 最高 10 级

---

### 知识图谱测试

#### ✅ 18. 查看文章知识图谱
**步骤：**
1. 在演示页选择一篇文章
2. 右侧应该显示知识图谱卡片

**预期结果：**
- ✅ 显示实体列表
- ✅ 实体按类型分类（人物、概念、事件、地点）
- ✅ 显示实体关系
- ✅ 显示置信度

**API 测试：**
```bash
curl "http://localhost:3000/api/knowledge/graph?articleId=文章ID"
```

#### ✅ 19. 创建知识实体
**步骤：**
```bash
curl -X POST http://localhost:3000/api/knowledge/graph \
  -H "Content-Type: application/json" \
  -d '{
    "articleId": "文章ID",
    "entities": [
      {
        "name": "飘叔",
        "type": "concept",
        "description": "一个知识分享平台"
      }
    ]
  }'
```

**预期结果：**
```json
{
  "success": true,
  "data": {
    "entities": [...],
    "relations": []
  }
}
```

#### ✅ 20. 查看实体关系
**步骤：**
1. 创建多个实体和关系
2. 在知识图谱中查看

**预期结果：**
- ✅ 显示实体之间的连接
- ✅ 显示关系类型
- ✅ 显示置信度

---

### 多模态测试

#### ✅ 21. 语音识别（ASR）
**API 测试：**
```bash
curl -X POST http://localhost:3000/api/multimodal/asr \
  -H "Content-Type: application/json" \
  -d '{
    "audio": "base64_encoded_audio",
    "language": "zh-CN"
  }'
```

**预期结果：**
```json
{
  "success": true,
  "data": {
    "text": "识别的文本内容"
  }
}
```

#### ✅ 22. 文本转语音（TTS）
**API 测试：**
```bash
curl -X POST http://localhost:3000/api/multimodal/tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "你好，欢迎使用飘叔",
    "voice": "zh-CN-XiaoxiaoNeural"
  }'
```

**预期结果：**
```json
{
  "success": true,
  "data": {
    "audio": "base64_encoded_audio"
  }
}
```

#### ✅ 23. 图像理解（VLM）
**API 测试：**
```bash
curl -X POST http://localhost:3000/api/multimodal/vlm \
  -H "Content-Type: application/json" \
  -d '{
    "image": "base64_encoded_image",
    "prompt": "描述这张图片"
  }'
```

**预期结果：**
```json
{
  "success": true,
  "data": {
    "description": "图片描述内容"
  }
}
```

---

## 📊 完整 API 测试脚本

创建 `test-apis.sh` 文件：

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "=== 飘叔 Agent API 测试 ==="

# 1. 初始化数据
echo "\n1. 初始化数据..."
curl -X POST $BASE_URL/api/seed

# 2. 获取文章列表
echo "\n\n2. 获取文章列表..."
curl "$BASE_URL/api/articles?page=1&limit=10"

# 3. 搜索文章
echo "\n\n3. 搜索文章..."
curl "$BASE_URL/api/articles/search?q=飘叔"

# 4. 获取推荐
echo "\n\n4. 获取推荐..."
curl "$BASE_URL/api/recommendations?userId=anonymous&limit=5"

# 5. 记录行为
echo "\n\n5. 记录行为..."
curl -X POST $BASE_URL/api/behavior/track \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "anonymous",
    "articleId": "test-article-1",
    "interactionType": "view",
    "duration": 120
  }'

# 6. 获取用户统计
echo "\n\n6. 获取用户统计..."
curl "$BASE_URL/api/users/anonymous/stats"

# 7. 获取用户兴趣
echo "\n\n7. 获取用户兴趣..."
curl "$BASE_URL/api/users/anonymous/interests"

# 8. 发送消息
echo "\n\n8. 发送消息..."
curl -X POST $BASE_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "介绍一下飘叔",
    "userId": "anonymous"
  }'

# 9. 获取统计概览
echo "\n\n9. 获取统计概览..."
curl "$BASE_URL/api/stats/overview"

echo "\n\n=== 测试完成 ==="
```

运行测试：
```bash
chmod +x test-apis.sh
./test-apis.sh
```

---

## ✅ 验证检查表

### 基础功能 (7/7)
- [ ] 访问主页
- [ ] 访问演示页
- [ ] 初始化数据
- [ ] 查看文章列表
- [ ] 搜索文章
- [ ] 查看文章详情
- [ ] 点赞、分享文章

### 智能对话 (4/4)
- [ ] 发送消息
- [ ] 查看思考过程
- [ ] 查看相关文章
- [ ] 提交反馈

### 推荐系统 (3/3)
- [ ] 查看推荐
- [ ] 点击推荐
- [ ] 验证更新

### 用户画像 (3/3)
- [ ] 查看统计
- [ ] 查看兴趣
- [ ] 验证等级

### 知识图谱 (3/3)
- [ ] 查看图谱
- [ ] 创建实体
- [ ] 查看关系

### 多模态 (3/3)
- [ ] ASR 测试
- [ ] TTS 测试
- [ ] VLM 测试

**总计：23 项测试**

---

## 🎯 快速验证命令

```bash
# 1. 启动服务器
npm run dev

# 2. 新开终端，初始化数据
curl -X POST http://localhost:3000/api/seed

# 3. 测试主要 API
curl http://localhost:3000/api/articles
curl http://localhost:3000/api/recommendations?userId=anonymous
curl http://localhost:3000/api/stats/overview

# 4. 浏览器访问
# http://localhost:3000
# http://localhost:3000/demo
```

---

## 📝 测试报告模板

完成测试后，填写以下报告：

```
飘叔 Agent 功能验证报告
测试日期：____________________
测试人员：____________________

基础功能：[ ] 通过 [ ] 失败
智能对话：[ ] 通过 [ ] 失败
推荐系统：[ ] 通过 [ ] 失败
用户画像：[ ] 通过 [ ] 失败
知识图谱：[ ] 通过 [ ] 失败
多模态：  [ ] 通过 [ ] 失败

问题记录：
1. ___________________________
2. ___________________________

总体评价：
___________________________
```

---

**准备好开始测试了吗？按照上面的步骤逐一验证！** 🚀
