# 🚀 飘叔Agent Vercel部署指南

## 📋 部署准备清单

### ✅ 已完成
- [x] GitHub仓库已创建: https://github.com/WLIG/Piaoshu-Agent.git
- [x] Vercel账户已准备: https://vercel.com/wligs-projects
- [x] 项目代码已完成

### 🔧 部署前准备

## 1. 环境变量配置

创建生产环境配置文件：

```bash
# .env.production
DATABASE_URL="file:./db/production.db"
Z_AI_API_KEY="your_production_api_key"
Z_AI_BASE_URL="https://api.z.ai/v1"
OPENAI_API_KEY="your_openai_api_key"
NEXTAUTH_URL="https://your-vercel-domain.vercel.app"
NEXTAUTH_SECRET="your_production_secret_key"
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-vercel-domain.vercel.app"
```

## 2. Vercel配置文件

创建 `vercel.json` 配置：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## 3. 数据库配置

由于Vercel是无服务器环境，需要调整数据库配置：

```typescript
// src/lib/db-vercel.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## 🚀 部署步骤

### 步骤1: 推送代码到GitHub

```bash
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/WLIG/Piaoshu-Agent.git

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: 飘叔Agent完整版"

# 推送到GitHub
git push -u origin main
```

### 步骤2: 连接Vercel

1. 访问 https://vercel.com/wligs-projects
2. 点击 "New Project"
3. 选择 "Import Git Repository"
4. 选择 `WLIG/Piaoshu-Agent` 仓库
5. 点击 "Import"

### 步骤3: 配置环境变量

在Vercel项目设置中添加环境变量：

```
DATABASE_URL = file:./db/production.db
Z_AI_API_KEY = your_production_api_key
Z_AI_BASE_URL = https://api.z.ai/v1
OPENAI_API_KEY = your_openai_api_key
NEXTAUTH_SECRET = your_production_secret_key
NODE_ENV = production
```

### 步骤4: 部署配置

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## 📁 需要创建的文件

### 1. vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 2. .env.production
```env
DATABASE_URL="file:./db/production.db"
Z_AI_API_KEY="demo_key"
Z_AI_BASE_URL="https://api.z.ai/v1"
OPENAI_API_KEY="demo_key"
NEXTAUTH_SECRET="production_secret_key_change_this"
NODE_ENV="production"
```

### 3. 更新 .gitignore
```gitignore
# 确保包含这些
node_modules/
.next/
.env.local
.env.production
*.log
.DS_Store
```

## 🔧 部署优化

### 1. 构建优化

更新 `next.config.ts`:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['prisma']
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('prisma')
    }
    return config
  },
  // 生产环境优化
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
}

export default nextConfig
```

### 2. 数据库迁移

创建部署脚本 `scripts/deploy.js`:

```javascript
const { execSync } = require('child_process');

console.log('🚀 开始部署准备...');

// 生成Prisma客户端
console.log('📦 生成Prisma客户端...');
execSync('npx prisma generate', { stdio: 'inherit' });

// 运行数据库迁移
console.log('🗄️ 运行数据库迁移...');
execSync('npx prisma db push', { stdio: 'inherit' });

console.log('✅ 部署准备完成！');
```

## 🎯 部署后验证

### 1. 功能检查
- [ ] 页面正常加载
- [ ] 聊天功能正常
- [ ] Plus按钮功能正常
- [ ] API端点响应正常

### 2. 性能检查
- [ ] 页面加载速度 < 3秒
- [ ] API响应时间 < 2秒
- [ ] 移动端适配正常

### 3. 错误监控
- 检查Vercel Functions日志
- 监控错误率和响应时间

## 🌐 访问地址

部署成功后，你的飘叔Agent将可以通过以下地址访问：
- **生产地址**: https://piaoshu-agent.vercel.app
- **预览地址**: https://piaoshu-agent-git-main-wligs-projects.vercel.app

## 🔄 持续部署

每次推送到GitHub main分支时，Vercel会自动重新部署：

```bash
# 更新代码
git add .
git commit -m "更新功能"
git push origin main
```

## 📞 故障排除

### 常见问题

1. **构建失败**
   - 检查TypeScript错误
   - 确保所有依赖已安装

2. **数据库连接问题**
   - 检查DATABASE_URL环境变量
   - 确保Prisma配置正确

3. **API超时**
   - 检查函数执行时间
   - 优化API响应逻辑

### 调试命令

```bash
# 本地测试生产构建
npm run build
npm start

# 检查Prisma配置
npx prisma validate
npx prisma generate
```

## 🎉 部署完成

部署成功后，飘叔Agent将在全球CDN上运行，提供：
- ⚡ 快速的全球访问
- 🔄 自动扩展
- 📊 实时监控
- 🚀 零停机部署

**🌟 你的飘叔Agent现在可以为全世界用户提供服务了！**

---

*部署指南创建时间: 2026年2月5日*  
*目标平台: Vercel*  
*GitHub仓库: https://github.com/WLIG/Piaoshu-Agent.git*