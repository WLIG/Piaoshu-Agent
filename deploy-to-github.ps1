# 飘叔Agent GitHub部署脚本

Write-Host "🚀 开始部署飘叔Agent到GitHub..." -ForegroundColor Green

# 检查Git状态
Write-Host "📋 检查Git状态..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    Write-Host "初始化Git仓库..." -ForegroundColor Yellow
    git init
}

# 添加远程仓库
Write-Host "🔗 配置远程仓库..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/WLIG/Piaoshu-Agent.git

# 检查分支
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Host "切换到main分支..." -ForegroundColor Yellow
    git checkout -b main 2>$null
}

# 添加所有文件
Write-Host "📁 添加项目文件..." -ForegroundColor Yellow
git add .

# 提交代码
Write-Host "💾 提交代码..." -ForegroundColor Yellow
$commitMessage = "feat: 飘叔Agent完整版 - 多模态智能对话系统

✨ 核心功能:
- 🧠 长期记忆系统 (跨会话记忆)
- 🎭 飘叔人格化系统 (商业思维)
- 🎤 多模态交互 (语音、图片、文档)
- 📱 移动端完美适配
- 🚀 Skills系统专业分析

🔧 技术栈:
- Next.js 16 + TypeScript
- Prisma + SQLite
- Tailwind CSS + shadcn/ui
- OpenAI API + NVIDIA API
- 语音识别 + 图像分析

🌟 特色:
- 微信风格Plus按钮
- 智能编码检测
- 动态人格调整
- 实时语音播放
- 完整的记忆备份系统

Ready for Vercel deployment! 🎉"

git commit -m "$commitMessage"

# 推送到GitHub
Write-Host "⬆️ 推送到GitHub..." -ForegroundColor Yellow
git push -u origin main --force

Write-Host "✅ 代码已成功推送到GitHub!" -ForegroundColor Green
Write-Host "🔗 仓库地址: https://github.com/WLIG/Piaoshu-Agent.git" -ForegroundColor Cyan

Write-Host "`n🚀 下一步: 在Vercel中部署" -ForegroundColor Magenta
Write-Host "1. 访问: https://vercel.com/wligs-projects" -ForegroundColor White
Write-Host "2. 点击 'New Project'" -ForegroundColor White
Write-Host "3. 选择 'WLIG/Piaoshu-Agent' 仓库" -ForegroundColor White
Write-Host "4. 配置环境变量并部署" -ForegroundColor White

Write-Host "`n🎉 飘叔Agent即将在云端为全世界用户服务!" -ForegroundColor Green