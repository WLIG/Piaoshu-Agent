# 飘叔 Agent 验证检查清单

## 🚀 快速开始

### 第一步：安装和启动

```bash
# 1. 安装依赖（如果还没安装）
npm install

# 2. 生成 Prisma Client
npx prisma generate

# 3. 推送数据库
npx prisma db push

# 4. 启动开发服务器
npm run dev
```

等待看到：
```
✓ Ready in XXXms
○ Local:        http://localhost:3000
```

### 第二步：初始化数据

打开新终端，运行：
```bash
curl -X POST http://localhost:3000/api/seed
```

或在浏览器访问：http://localhost:3000/api/seed

---

## ✅ 功能验证清单

### 基础功能测试 (7项)

#### 1. ✅ 访问主页 `/`
- [ ] 打开 http://localhost:3000
- [ ] 看到三个标签：推荐流、文章列表、对话
- [ ] 页面无错误

#### 2. ✅ 访问演示页 `/demo`
- [ ] 打开 http://localhost:3000/demo
- [ ] 看到统计概览卡片
- [ ] 看到文章列表/详情/聊天标签
- [ ] 看到用户资料和推荐面板

#### 3. ✅ 初始化数据
```bash
curl -X POST http://localhost:3000/api/seed
```
- [ ] 返回成功消息
- [ ] 创建了 6 篇文章

#### 4. ✅ 查看文章列表
- [ ] 在主页点击"文章列表"
- [ ] 看到 6 篇文章卡片
- [ ] 每个卡片有标题、摘要、标签
- [ ] 显示阅读数、点赞数

#### 5. ✅ 搜索文章
- [ ] 在搜索框输入"飘叔"
- [ ] 文章列表实时过滤
- [ ] 只显示匹配的文章

#### 6. ✅ 查看文章详情
- [ ] 点击任意文章卡片
- [ ] 切换到"文章详情"标签
- [ ] 看到完整内容
- [ ] Markdown 正确渲染
- [ ] 有点赞、分享、收藏按钮

#### 7. ✅ 点赞、分享文章
- [ ] 点击"点赞"按钮
- [ ] 点赞数增加
- [ ] 点击"分享"按钮
- [ ] 分享数增加

---

### 智能对话测试 (4项)

#### 8. ✅ 发送消息给 AI 助手
- [ ] 点击"对话"标签
- [ ] 输入："介绍一下飘叔"
- [ ] 点击发送
- [ ] 看到 AI 回复

#### 9. ✅ 查看 Agent 思考过程
- [ ] AI 回复包含相关内容
- [ ] 回答基于文章内容

#### 10. ✅ 查看相关文章推荐
- [ ] AI 回复下方有"相关文章"标签
- [ ] 点击标签跳转到文章

#### 11. ✅ 提交消息反馈
- [ ] 找到点赞/踩按钮
- [ ] 点击点赞
- [ ] 按钮状态改变

---

### 推荐系统测试 (3项)

#### 12. ✅ 查看个性化推荐
```bash
curl http://localhost:3000/api/recommendations?userId=anonymous&limit=10
```
- [ ] 返回推荐列表
- [ ] 每个推荐有文章信息
- [ ] 有推荐分数和理由

#### 13. ✅ 点击推荐文章
- [ ] 在推荐面板点击文章
- [ ] 正确跳转到详情页

#### 14. ✅ 验证推荐更新
- [ ] 阅读几篇文章
- [ ] 点赞一些文章
- [ ] 刷新推荐列表
- [ ] 推荐内容发生变化

---

### 用户画像测试 (3项)

#### 15. ✅ 查看用户统计
```bash
curl http://localhost:3000/api/users/anonymous/stats
```
- [ ] 返回统计数据
- [ ] 包含阅读数、点赞数、分享数
- [ ] 包含平均阅读时长
- [ ] 包含用户等级和进度

#### 16. ✅ 查看用户兴趣
```bash
curl http://localhost:3000/api/users/anonymous/interests
```
- [ ] 返回兴趣列表
- [ ] 每个兴趣有分类和分数
- [ ] 按分数排序

#### 17. ✅ 验证等级系统
- [ ] 在用户资料看到等级
- [ ] 看到升级进度条
- [ ] 多次交互后等级增加

---

### 知识图谱测试 (3项)

#### 18. ✅ 查看文章知识图谱
```bash
curl "http://localhost:3000/api/knowledge/graph?articleId=文章ID"
```
- [ ] 返回实体列表
- [ ] 返回关系列表

#### 19. ✅ 创建知识实体
```bash
curl -X POST http://localhost:3000/api/knowledge/graph \
  -H "Content-Type: application/json" \
  -d '{
    "articleId": "文章ID",
    "entities": [
      {"name": "飘叔", "type": "concept", "description": "知识平台"}
    ]
  }'
```
- [ ] 成功创建实体
- [ ] 返回创建的实体信息

#### 20. ✅ 查看实体关系
- [ ] 在知识图谱卡片看到实体
- [ ] 看到实体类型（人物、概念等）
- [ ] 看到实体关系

---

### 多模态测试 (3项)

#### 21. ✅ 语音识别（ASR）
```bash
curl -X POST http://localhost:3000/api/multimodal/asr \
  -H "Content-Type: application/json" \
  -d '{"audio": "base64_audio", "language": "zh-CN"}'
```
- [ ] API 端点存在
- [ ] 返回正确格式

#### 22. ✅ 文本转语音（TTS）
```bash
curl -X POST http://localhost:3000/api/multimodal/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "你好", "voice": "zh-CN-XiaoxiaoNeural"}'
```
- [ ] API 端点存在
- [ ] 返回正确格式

#### 23. ✅ 图像理解（VLM）
```bash
curl -X POST http://localhost:3000/api/multimodal/vlm \
  -H "Content-Type: application/json" \
  -d '{"image": "base64_image", "prompt": "描述图片"}'
```
- [ ] API 端点存在
- [ ] 返回正确格式

---

## 🔧 自动化测试

### 使用 PowerShell 脚本
```powershell
# 运行自动化测试
.\test-apis.ps1
```

### 手动测试主要 API
```bash
# 1. 文章列表
curl http://localhost:3000/api/articles

# 2. 推荐
curl http://localhost:3000/api/recommendations?userId=anonymous

# 3. 统计
curl http://localhost:3000/api/stats/overview

# 4. 用户统计
curl http://localhost:3000/api/users/anonymous/stats

# 5. 用户兴趣
curl http://localhost:3000/api/users/anonymous/interests
```

---

## 📊 测试结果

### 完成度统计
- 基础功能: __ / 7
- 智能对话: __ / 4
- 推荐系统: __ / 3
- 用户画像: __ / 3
- 知识图谱: __ / 3
- 多模态: __ / 3

**总计: __ / 23**

### 问题记录
1. ___________________________
2. ___________________________
3. ___________________________

---

## ✅ 验证完成标准

所有功能验证通过的标准：

1. ✅ 所有页面正常访问
2. ✅ 所有 API 返回正确格式
3. ✅ 数据正确保存和读取
4. ✅ 推荐系统正常工作
5. ✅ 对话系统正常工作
6. ✅ 用户画像正常更新
7. ✅ 无控制台错误
8. ✅ 无网络请求失败

---

## 🎯 快速验证（5分钟）

最快速的验证方法：

```bash
# 1. 启动服务器
npm run dev

# 2. 初始化数据
curl -X POST http://localhost:3000/api/seed

# 3. 测试主要功能
curl http://localhost:3000/api/articles
curl http://localhost:3000/api/recommendations?userId=anonymous
curl http://localhost:3000/api/stats/overview

# 4. 浏览器访问
# http://localhost:3000
# http://localhost:3000/demo
```

如果以上都正常，说明系统运行正常！✅

---

## 📝 验证报告模板

```
飘叔 Agent 功能验证报告
================================
测试日期：2024-__-__
测试人员：__________
环境：Windows / Node.js v22.20.0

测试结果：
- 基础功能：[✅/❌] (__/7)
- 智能对话：[✅/❌] (__/4)
- 推荐系统：[✅/❌] (__/3)
- 用户画像：[✅/❌] (__/3)
- 知识图谱：[✅/❌] (__/3)
- 多模态：  [✅/❌] (__/3)

总体通过率：___%

主要问题：
1. _______________
2. _______________

建议：
1. _______________
2. _______________

总体评价：
_______________
```

---

**准备好了吗？开始验证吧！** 🚀
