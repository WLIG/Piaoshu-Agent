# 🤖 飘叔Agent - 多模态智能对话系统

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/WLIG/Piaoshu-Agent)

> 具备长期记忆、人格化交互和多模态能力的智能Agent系统

## ✨ 核心特性

### 🧠 长期记忆系统
- 跨会话记忆用户对话和偏好
- 智能记忆检索和关联
- 完整的备份恢复机制

### 🎭 飘叔人格化系统
- 商业思维敏锐的表达风格
- 4大类商业案例库自动匹配
- 4种类比技巧智能生成
- 动态人格权重调整

### 🎤 多模态交互
- 🎙️ 语音输入转文字功能
- 🔊 AI回复语音播放功能
- 🖼️ 图片上传智能分析
- 📁 文档上传智能解析

### 📱 移动端优化
- 完整的响应式设计
- 微信风格Plus按钮
- 流畅的交互动画效果

## 🚀 快速开始

### 在线体验
访问部署版本：[https://piaoshu-agent.vercel.app](https://piaoshu-agent.vercel.app)

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/WLIG/Piaoshu-Agent.git
cd Piaoshu-Agent

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 添加你的API密钥

# 初始化数据库
npx prisma generate
npx prisma db push

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始体验

## 🛠️ 技术栈

- **前端**: Next.js 16 + TypeScript + Tailwind CSS
- **UI组件**: shadcn/ui + Radix UI
- **数据库**: Prisma + SQLite
- **AI服务**: OpenAI API + NVIDIA API
- **部署**: Vercel

## 📋 环境变量

```env
DATABASE_URL="file:./db/custom.db"
Z_AI_API_KEY="your_z_ai_api_key"
Z_AI_BASE_URL="https://api.z.ai/v1"
OPENAI_API_KEY="your_openai_api_key"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secret_key"
```

## 🎯 功能演示

### 💬 智能对话
- 询问商业问题体验专业分析
- 支持多轮对话和上下文理解
- Skills系统提供领域专家级回答

### 🎤 语音交互
1. 点击Plus按钮 (+)
2. 选择"语音"选项
3. 录音后自动转换为文字
4. AI回复支持语音播放

### 🖼️ 图像分析
1. 点击Plus按钮 (+)
2. 选择"图片"选项
3. 上传图片获得AI分析

### 📁 文档处理
1. 点击Plus按钮 (+)
2. 选择"上传"选项
3. 支持多种格式智能解析

## 🚀 部署到Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/WLIG/Piaoshu-Agent)

1. 点击上方按钮
2. 连接GitHub仓库
3. 配置环境变量
4. 一键部署

## 📱 移动端支持

完美适配移动设备：
- 响应式布局设计
- 触摸优化交互
- 移动端语音录制
- 图片拍照上传

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

感谢所有开源项目的贡献者们！

---

**🌟 体验飘叔Agent，开启智能对话新时代！**