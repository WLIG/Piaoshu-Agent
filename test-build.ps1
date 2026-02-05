Write-Host "开始构建测试..." -ForegroundColor Green
Write-Host ""

# 清理
if (Test-Path ".next") {
    Write-Host "清理 .next 目录..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .next
}

Write-Host "运行构建..." -ForegroundColor Yellow
Write-Host ""

# 运行构建
& npx next build

Write-Host ""
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 构建成功！" -ForegroundColor Green
} else {
    Write-Host "❌ 构建失败！退出代码: $LASTEXITCODE" -ForegroundColor Red
}
