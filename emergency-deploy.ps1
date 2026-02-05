# 飘叔Agent 紧急部署脚本
Write-Host "🚨 飘叔Agent 紧急部署开始..." -ForegroundColor Red

# 1. 清理和重新安装依赖
Write-Host "🧹 清理依赖..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
}

# 2. 重新安装依赖
Write-Host "📦 重新安装依赖..." -ForegroundColor Yellow
npm install

# 3. 生成Prisma客户端
Write-Host "🗄️ 生成Prisma客户端..." -ForegroundColor Yellow
npx prisma generate

# 4. 尝试构建
Write-Host "🔨 尝试构建..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 构建成功!" -ForegroundColor Green
    
    # 5. 推送到GitHub
    Write-Host "⬆️ 推送到GitHub..." -ForegroundColor Yellow
    
    git init
    git remote remove origin 2>$null
    git remote add origin https://github.com/WLIG/Piaoshu-Agent.git
    git add .
    git commit -m "fix: 修复构建问题并准备部署"
    git push -u origin main --force
    
    Write-Host "🎉 部署准备完成!" -ForegroundColor Green
    Write-Host "🔗 GitHub: https://github.com/WLIG/Piaoshu-Agent.git" -ForegroundColor Cyan
    Write-Host "🚀 Vercel: https://vercel.com/wligs-projects" -ForegroundColor Cyan
} else {
    Write-Host "❌ 构建失败，需要手动修复" -ForegroundColor Red
    Write-Host "请检查构建错误并修复后再次运行" -ForegroundColor Yellow
}