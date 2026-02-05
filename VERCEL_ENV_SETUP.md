# Vercel 环境变量配置

## 必需的环境变量

在 Vercel 项目设置中添加以下环境变量：

### 数据库配置
```
DATABASE_URL=file:./db/custom.db
```

### AI API 配置
```
DEEPSEEK_API_KEY=sk-85004076a7fb47dc99ead5543dd8bda2
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

OPENROUTER_API_KEY=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
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

NVIDIA_API_KEY=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
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
```

### 应用配置
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_production_secret_key_here
```

### 功能开关
```
ENABLE_WEBSOCKET=true
ENABLE_MULTIMODAL=true
ENABLE_VOICE_INPUT=true
ENABLE_MEMORY_SYSTEM=true
```

## 配置步骤

1. 访问 https://vercel.com/wligs-projects
2. 选择 Piaoshu-Agent 项目
3. 进入 Settings → Environment Variables
4. 逐个添加上述变量
5. 选择适用环境：Production, Preview, Development
6. 保存后触发重新部署
