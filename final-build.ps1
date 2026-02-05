Write-Host "🚀 最终构建测试" -ForegroundColor Green
Write-Host ""

# 1. 清理
Write-Host "1. 清理旧构建..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "   ✓ .next 已清理" -ForegroundColor Green
}

# 2. 生成 Prisma 客户端
Write-Host ""
Write-Host "2. 生成 Prisma 客户端..." -ForegroundColor Yellow
& npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Prisma 客户端已生成" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Prisma 生成失败，继续..." -ForegroundColor Yellow
}

# 3. 运行构建
Write-Host ""
Write-Host "3. 开始 Next.js 构建..." -ForegroundColor Yellow
Write-Host "=" * 60
& npx next build

Write-Host "=" * 60
Write-Host ""

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 构建成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "现在可以运行:" -ForegroundColor Cyan
    Write-Host "  npm start" -ForegroundColor White
} else {
    Write-Host "❌ 构建失败！退出代码: $LASTEXITCODE" -ForegroundColor Red
    Write-Host ""
    Write-Host "请检查上面的错误信息" -ForegroundColor Yellow
}
