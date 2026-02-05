# 🤖 飘叔Agent - NVIDIA三模型增强版使用指南

## 🚀 快速开始

### 1. 启动系统
```powershell
# 使用快速启动脚本
.\start-piaoshu-agent.ps1

# 或手动启动
npm run dev
```

### 2. 访问地址
- **主页**: http://localhost:3000
- **聊天测试**: http://localhost:3000/chat-test
- **文件上传**: http://localhost:3000/upload
- **管理面板**: http://localhost:3000/admin

## 🧠 NVIDIA三模型体系

### GLM4.7 - 快速对话专家
**适用场景**:
- 日常对话交流
- 基础问题解答
- 快速信息查询
- 简单推理任务

**使用示例**:
```javascript
{
  "message": "你好，请介绍一下自己",
  "useNvidia": true,
  "model": "glm4.7"
}
```

**特点**:
- 响应速度快 (平均12秒)
- 支持思维链推理
- 适合高频对话场景

### Kimi2.5 - 创意生成大师
**适用场景**:
- 创意写作
- 营销策划
- 产品设计
- 长文本处理

**使用示例**:
```javascript
{
  "message": "帮我设计一个AI产品的营销方案",
  "useNvidia": true,
  "model": "kimi2.5"
}
```

**特点**:
- 创意能力强
- 长文本处理优秀
- 支持复杂创作任务

### Nemotron - 深度分析专家 🆕
**适用场景**:
- 复杂商业分析
- 深度推理任务
- 专业决策支持
- 数据驱动分析

**使用示例**:
```javascript
{
  "message": "深度分析电商平台的盈利模式",
  "useNvidia": true,
  "model": "nemotron"
}
```

**特点**:
- 30B参数，推理能力强
- 平均2433字符详细输出
- 支持reasoning_budget控制
- 专业商业分析能力

### 商业分析专用模式 🆕
**使用方式**:
```javascript
{
  "message": "分析共享经济的风险和机会",
  "useNvidia": true,
  "model": "business"
}
```

**特点**:
- 基于Nemotron优化
- 专注商业场景
- 风险评估和决策建议

### 智能自动选择
**使用方式**:
```javascript
{
  "message": "你的问题...",
  "useNvidia": true,
  "model": "auto"  // 系统自动选择最适合的模型
}
```

**选择逻辑**:
- **复杂推理/分析** → Nemotron
- **创意/写作任务** → Kimi2.5  
- **日常对话** → GLM4.7

## 💬 聊天API使用

### 基础调用
```javascript
POST /api/chat
Content-Type: application/json

{
  "message": "你好，我想了解AI的商业应用",
  "useNvidia": true,
  "model": "auto",
  "userId": "user123"
}
```

### 高级参数
```javascript
{
  "message": "用户消息",
  "conversationId": "conv_123",  // 可选，继续对话
  "useNvidia": true,             // 使用NVIDIA模型
  "model": "glm4.7",            // 指定模型
  "hasAttachments": false,       // 是否有附件
  "userId": "user123"            // 用户ID
}
```

### 响应格式
```javascript
{
  "success": true,
  "data": {
    "conversationId": "conv_123",
    "message": {
      "id": "msg_456",
      "content": "飘叔的回复内容...",
      "thinking": "思维过程...",
      "relatedArticles": [],
      "createdAt": "2026-02-04T10:20:35.000Z"
    },
    "model": "nvidia-glm4.7",
    "timestamp": "2026-02-04T10:20:35.000Z"
  }
}
```

## 🎨 飘叔人格特色

### 语言风格
- **商业思维**: "从商业角度看..."
- **数据驱动**: "数据显示..."
- **趋势洞察**: "趋势表明..."
- **实用导向**: "就像...一样"

### 专业领域
- 商业分析
- 技术趋势
- 产品策略
- 数据科学
- 人工智能
- 创业投资

### 回答特点
- 逻辑清晰，结构化
- 善用类比和比喻
- 注重实际应用
- 提供可操作建议

## 🔧 高级功能

### 1. 多模态分析
```javascript
// 图片分析
POST /api/analyze/image
{
  "imageUrl": "图片URL",
  "prompt": "请分析这张图片的商业价值"
}

// 文档分析
POST /api/analyze/document
{
  "content": "文档内容",
  "type": "business_analysis"
}
```

### 2. 知识库搜索
```javascript
POST /api/memory/search
{
  "query": "人工智能商业应用",
  "limit": 5
}
```

### 3. 统计分析
```javascript
GET /api/stats/overview
// 返回系统使用统计
```

## 🛠️ 开发者指南

### 环境配置
```bash
# .env.local
NVIDIA_API_KEY=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
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_USERNAME=NVIDIABuild-Autogen-37
```

### 自定义模型调用
```typescript
import { NvidiaModelClient } from '@/lib/nvidia-models-simple';

const client = new NvidiaModelClient();

// GLM4.7调用
const response = await client.callGLM47([
  { role: 'user', content: '你的问题' }
], {
  temperature: 0.8,
  maxTokens: 2048,
  enableThinking: true
});

// Kimi2.5调用
const response = await client.callKimi25([
  { role: 'user', content: '你的问题' }
], {
  temperature: 0.9,
  maxTokens: 2048,
  thinking: true
});

// 智能调用
const response = await client.smartCall([
  { role: 'user', content: '你的问题' }
], 'reasoning');
```

### 流式响应处理
```typescript
const response = await client.callGLM47(messages, {
  stream: true
});

// 处理流式数据
for await (const chunk of response) {
  console.log(chunk.choices[0].delta.content);
}
```

## 📊 性能优化

### 1. 模型选择建议
- **短文本对话** → GLM4.7 (快速响应)
- **长文本分析** → Kimi2.5 (更好理解)
- **复杂推理** → GLM4.7 + thinking
- **创意生成** → Kimi2.5 + thinking

### 2. 参数调优
```javascript
// 平衡性能和质量
{
  temperature: 0.7,    // 创意度
  maxTokens: 1024,     // 响应长度
  enableThinking: true // 思维链
}

// 快速响应
{
  temperature: 0.3,
  maxTokens: 512,
  enableThinking: false
}

// 高质量输出
{
  temperature: 0.9,
  maxTokens: 2048,
  enableThinking: true
}
```

## 🔍 故障排除

### 常见问题

**1. API调用失败**
```
检查项目:
- NVIDIA API Key是否正确
- 网络连接是否正常
- 模型名称是否正确
```

**2. 响应质量不佳**
```
优化方案:
- 调整temperature参数
- 使用更具体的提示词
- 选择合适的模型
```

**3. 响应速度慢**
```
优化建议:
- 减少maxTokens
- 关闭thinking模式
- 使用缓存机制
```

### 调试工具
```bash
# 测试NVIDIA API
node test-nvidia-enhanced.js

# 完整系统测试
node test-complete-system.js

# 检查服务器状态
curl http://localhost:3000/api/admin/system
```

## 📈 最佳实践

### 1. 提示词优化
```javascript
// 好的提示词
"请从商业角度分析人工智能在零售行业的具体应用场景，包括成本效益分析"

// 避免的提示词
"AI怎么样？"
```

### 2. 模型选择
```javascript
// 根据任务选择
const taskType = analyzeTaskType(message);
const model = taskType === 'creative' ? 'kimi2.5' : 'glm4.7';
```

### 3. 错误处理
```javascript
try {
  const response = await nvidiaClient.smartCall(messages);
} catch (error) {
  // 降级到简单回复
  return generateSimpleResponse(message);
}
```

## 🎯 使用技巧

### 1. 获得更好的回复
- 提供具体的上下文
- 明确你的需求
- 使用专业术语

### 2. 充分利用飘叔特色
- 询问商业分析
- 请求数据支撑
- 寻求实用建议

### 3. 多模型协作
- 用GLM4.7分析问题
- 用Kimi2.5生成方案
- 结合使用获得最佳效果

---

**🚀 现在开始体验飘叔Agent的NVIDIA增强版吧！**

*更新时间: 2026年2月4日*