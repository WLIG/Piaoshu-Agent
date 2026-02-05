# 简单启动脚本
Write-Host "Starting Piaoshu Agent..." -ForegroundColor Green

# 检查Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found!" -ForegroundColor Red
    exit 1
}

# 检查依赖
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# 启动开发服务器
Write-Host "Starting development server..." -ForegroundColor Green
npm run dev