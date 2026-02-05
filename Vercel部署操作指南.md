# 🚀 Vercel部署详细操作指南

## 📋 准备工作已完成 ✅
- ✅ 代码已推送到GitHub: https://github.com/WLIG/Piaoshu-Agent.git
- ✅ 所有配置文件已准备就绪
- ✅ 项目结构完整

## 🎯 现在请按以下步骤操作

### 步骤1: 访问Vercel控制台
**打开浏览器，访问：**
👉 https://vercel.com/wligs-projects

### 步骤2: 创建新项目
1. 在Vercel控制台中，点击 **"New Project"** 按钮
2. 如果没有看到，可能需要先登录你的Vercel账户

### 步骤3: 导入GitHub仓库
1. 在项目创建页面，选择 **"Import Git Repository"**
2. 找到并选择 **"WLIG/Piaoshu-Agent"** 仓库
3. 点击 **"Import"** 按钮

### 步骤4: 配置项目设置
Vercel会自动检测到这是Next.js项目，默认设置应该是：
- **Framework Preset**: Next.js ✅
- **Build Command**: `npm run build` (会自动使用我们的 `vercel:build`)
- **Output Directory**: `.next` ✅
- **Install Command**: `npm install` ✅

### 步骤5: 配置环境变量（可选但推荐）
在 **"Environment Variables"** 部分添加：

```
DATABASE_URL = file:./db/production.db
Z_AI_API_KEY = demo_key
Z_AI_BASE_URL = https://api.z.ai/v1
OPENAI_API_KEY = demo_key
NEXTAUTH_SECRET = your_production_secret_key_here
NODE_ENV = production
NEXT_PUBLIC_APP_URL = https://your-domain.vercel.app
```

**注意**: 如果你有真实的API密钥，请替换 `demo_key`

### 步骤6: 开始部署
1. 检查所有设置无误后，点击 **"Deploy"** 按钮
2. Vercel会开始构建和部署过程

## ⏱️ 部署过程监控

### 构建阶段
你会看到类似以下的构建日志：
```
Running "npm install"
Running "npm run vercel:build"
✓ Generating Prisma client
✓ Building Next.js application
✓ Optimizing pages
✓ Deployment completed
```

### 预期构建时间
- **安装依赖**: 1-2分钟
- **构建项目**: 2-3分钟
- **部署上线**: 30秒-1分钟
- **总时间**: 约3-5分钟

## 🌐 部署成功标志

### ✅ 成功指标
- Vercel显示 **"Deployment completed"**
- 获得部署URL，类似：`https://piaoshu-agent.vercel.app`
- 点击URL能正常访问网站

### 🎯 功能验证
部署成功后，请测试：
- [ ] 页面正常加载，显示飘叔Agent界面
- [ ] 聊天功能正常工作
- [ ] Plus按钮显示四个选项
- [ ] 语音输入功能可用
- [ ] 图片分析功能可用
- [ ] 文档上传功能可用
- [ ] 移动端适配正常

## 🔧 如果遇到问题

### 常见问题解决

#### 1. 构建失败
- 检查构建日志中的错误信息
- 通常是依赖问题，Vercel会自动重试

#### 2. 环境变量问题
- 确保环境变量名称正确
- 检查是否有特殊字符需要转义

#### 3. 数据库问题
- SQLite在Vercel上是只读的
- 如需持久化数据，考虑使用Vercel Postgres

#### 4. API超时
- Vercel免费版有10秒函数超时限制
- 检查API响应时间

### 调试步骤
1. 查看Vercel构建日志
2. 检查Functions日志
3. 使用浏览器开发者工具检查网络请求

## 🎉 部署成功后

### 🌟 你将拥有
- **全球CDN**: 通过Vercel的全球网络加速
- **自动HTTPS**: 安全的SSL证书
- **自动部署**: 每次推送代码自动重新部署
- **性能监控**: Vercel提供的性能分析

### 📱 访问地址
- **主域名**: https://piaoshu-agent.vercel.app
- **预览域名**: https://piaoshu-agent-git-main-wligs-projects.vercel.app

### 🔄 后续更新
每次代码更新只需：
```bash
git add .
git commit -m "功能更新"
git push origin main
```
Vercel会自动重新部署！

## 📞 需要帮助？

如果在部署过程中遇到任何问题：
1. 截图发送错误信息
2. 我可以帮你分析和解决
3. 或者调整配置文件

---

## 🚀 立即开始部署！

**现在请打开浏览器，访问：**
👉 https://vercel.com/wligs-projects

**按照上述步骤操作，飘叔Agent即将在云端为全世界用户服务！**

---

*操作指南创建时间: 2026年2月5日*  
*GitHub仓库: https://github.com/WLIG/Piaoshu-Agent.git*  
*状态: 🚀 准备部署*