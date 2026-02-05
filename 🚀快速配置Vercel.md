# 🚀 快速配置 Vercel 环境变量

## 方法 1: 使用 Vercel CLI（推荐，最快）

如果你已安装 Vercel CLI：

```bash
# 在项目目录中运行
bash vercel-env-setup.sh
```

这将自动配置所有环境变量并触发重新部署。

## 方法 2: 手动复制粘贴（最简单）

1. 访问：https://vercel.com/wligs-projects
2. 选择 Piaoshu-Agent 项目
3. 进入：Settings → Environment Variables
4. 打开 `.env.production` 文件
5. 逐个复制粘贴每个变量

**必需的环境变量（按优先级）：**

### 核心 API（必需）
```
DEEPSEEK_API_KEY=sk-85004076a7fb47dc99ead5543dd8bda2
OPENROUTER_API_KEY=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
NVIDIA_API_KEY=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
```

### 数据库（必需）
```
DATABASE_URL=file:./db/custom.db
```

### 应用配置（必需）
```
NODE_ENV=production
```

### 功能开关（推荐）
```
ENABLE_MULTIMODAL=true
ENABLE_VOICE_INPUT=true
ENABLE_MEMORY_SYSTEM=true
```

## 方法 3: 使用 Vercel Dashboard 批量导入

1. 访问：https://vercel.com/wligs-projects
2. 选择项目 → Settings → Environment Variables
3. 点击 "Add" → "Bulk Add"
4. 复制 `.env.production` 的全部内容
5. 粘贴并保存

## 配置后的操作

### 自动重新部署
配置完环境变量后，Vercel 会自动触发重新部署。

### 手动触发部署
如果没有自动部署：
1. 进入项目 Deployments 页面
2. 点击最新部署的 "..." 菜单
3. 选择 "Redeploy"

## 验证配置

部署完成后，访问你的应用：
```
https://your-app.vercel.app
```

测试功能：
1. 访问 `/simple` 页面
2. 输入消息测试聊天
3. 检查是否有 AI 回复
4. 确认没有错误

## 故障排除

### 如果部署失败
1. 检查 Vercel 部署日志
2. 确认所有环境变量都已添加
3. 检查变量名称是否正确（区分大小写）

### 如果功能不工作
1. 检查浏览器控制台错误
2. 确认 API 密钥有效
3. 检查 Vercel 函数日志

## 完成标志

✅ 所有环境变量已配置
✅ 部署成功完成
✅ 应用可以访问
✅ 聊天功能正常
✅ AI 回复正常

---

**当前状态：** 配置文件已准备好
**下一步：** 选择一种方法配置环境变量
**目标：** 100% 功能可用
