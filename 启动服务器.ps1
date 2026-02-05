Write-Host "========================================"
Write-Host "飘叔 Agent 启动脚本"
Write-Host "========================================"
Write-Host ""

# 检查 Node.js
Write-Host "[检查] Node.js 版本..."
$nodeVersion = node --version
Write-Host "Node.js: $nodeVersion"
Write-Host ""

# 检查依赖
Write-Host "[1/4] 检查依赖..."
if (-not (Test-Path "node_modules")) {
    Write-Host "正在安装依赖，这可能需要几分钟..."
    Write-Host ""
    
    # 尝试使用 npm
    $npmPath = Get-Command npm -ErrorAction SilentlyContinue
    if ($npmPath) {
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "依赖安装失败！" -ForegroundColor Red
            Write-Host "请手动运行: npm install" -ForegroundColor Yellow
            Read-Host "按回车键退出"
            exit 1
        }
    } else {
        Write-Host "未找到 npm 命令！" -ForegroundColor Red
        Write-Host "请确保 Node.js 已正确安装" -ForegroundColor Yellow
        Read-Host "按回车键退出"
        exit 1
    }
    Write-Host "依赖安装完成！" -ForegroundColor Green
} else {
    Write-Host "依赖已存在，跳过安装" -ForegroundColor Green
}
Write-Host ""

# 生成 Prisma Client
Write-Host "[2/4] 生成 Prisma Client..."
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Prisma 生成失败！" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}
Write-Host "Prisma Client 生成完成！" -ForegroundColor Green
Write-Host ""

# 推送数据库 Schema
Write-Host "[3/4] 推送数据库 Schema..."
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "数据库推送失败！" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}
Write-Host "数据库初始化完成！" -ForegroundColor Green
Write-Host ""

# 启动服务器
Write-Host "[4/4] 启动开发服务器..."
Write-Host ""
Write-Host "========================================"
Write-Host "服务器即将启动..."
Write-Host "访问地址: http://localhost:3000"
Write-Host "按 Ctrl+C 停止服务器"
Write-Host "========================================"
Write-Host ""

# 直接使用 node 运行 next，避免 npm 问题
node ./node_modules/next/dist/bin/next dev -p 3000
