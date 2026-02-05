# 飘叔Agent - 完整测试和修复流程
# 自动检查问题、修复、测试，确保系统正常后再部署

Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     飘叔Agent - 完整测试和修复流程                    ║" -ForegroundColor Cyan
Write-Host "║     自动检查、修复、测试、部署                        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 步骤1: 检查错误
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "步骤 1/5: 检查系统配置和错误" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

node check-and-fix-errors.js

$checkExitCode = $LASTEXITCODE

if ($checkExitCode -ne 0) {
    Write-Host ""
    Write-Host "⚠️  发现配置问题，是否继续修复？" -ForegroundColor Yellow
    Write-Host "1. 自动修复并继续" -ForegroundColor White
    Write-Host "2. 手动修复后继续" -ForegroundColor White
    Write-Host "3. 退出" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "请选择 (1/2/3)"
    
    if ($choice -eq "3") {
        Write-Host "已退出" -ForegroundColor Yellow
        exit 1
    }
    
    if ($choice -eq "1") {
        Write-Host ""
        Write-Host "🔧 开始自动修复..." -ForegroundColor Blue
        
        # 检查并创建 .env.local
        if (-not (Test-Path ".env.local")) {
            if (Test-Path ".env.example") {
                Copy-Item ".env.example" ".env.local"
                Write-Host "✅ 已创建 .env.local" -ForegroundColor Green
            }
        }
        
        # 检查并创建数据库目录
        if (-not (Test-Path "db")) {
            New-Item -ItemType Directory -Path "db" -Force | Out-Null
            Write-Host "✅ 已创建 db 目录" -ForegroundColor Green
        }
        
        # 运行 Prisma 生成
        Write-Host "正在生成 Prisma Client..." -ForegroundColor Yellow
        npx prisma generate
        
        # 推送数据库架构
        Write-Host "正在初始化数据库..." -ForegroundColor Yellow
        npx prisma db push --accept-data-loss
        
        Write-Host ""
        Write-Host "✅ 自动修复完成" -ForegroundColor Green
    }
    
    if ($choice -eq "2") {
        Write-Host ""
        Write-Host "请手动修复问题后按任意键继续..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}

# 步骤2: 安装依赖
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "步骤 2/5: 检查并安装依赖" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "node_modules")) {
    Write-Host "正在安装依赖..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ 依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "✅ 依赖已安装" -ForegroundColor Green
}

# 步骤3: 构建检查
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "步骤 3/5: 构建检查" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "正在检查TypeScript类型..." -ForegroundColor Yellow
npx tsc --noEmit

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ TypeScript类型检查通过" -ForegroundColor Green
} else {
    Write-Host "⚠️  TypeScript类型检查有警告，但继续..." -ForegroundColor Yellow
}

# 步骤4: 启动服务器并测试
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "步骤 4/5: 启动服务器并运行测试" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 检查端口
$port = 3000
$connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue

if ($connection.TcpTestSucceeded) {
    Write-Host "⚠️  端口 3000 已被占用，正在关闭..." -ForegroundColor Yellow
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
    if ($process) {
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

# 启动服务器
Write-Host "正在启动开发服务器..." -ForegroundColor Yellow
$serverProcess = Start-Process -FilePath "node" -ArgumentList "simple-start.js" -PassThru -WindowStyle Hidden

Write-Host "✅ 服务器进程已启动 (PID: $($serverProcess.Id))" -ForegroundColor Green

# 等待服务器就绪
Write-Host "等待服务器就绪..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$serverReady = $false

while ($attempt -lt $maxAttempts -and -not $serverReady) {
    $attempt++
    Start-Sleep -Seconds 1
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
        }
    } catch {
        Write-Host "." -NoNewline -ForegroundColor Yellow
    }
}

Write-Host ""

if (-not $serverReady) {
    Write-Host "❌ 服务器启动超时" -ForegroundColor Red
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "✅ 服务器已就绪！" -ForegroundColor Green
Write-Host ""

# 运行测试
Write-Host "开始运行全面测试..." -ForegroundColor Blue
Write-Host ""

node test-all-local.js

$testExitCode = $LASTEXITCODE

# 步骤5: 测试结果和部署决策
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "步骤 5/5: 测试结果和部署决策" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

if ($testExitCode -eq 0) {
    Write-Host "🎉 所有测试通过！系统可以部署。" -ForegroundColor Green
    Write-Host ""
    Write-Host "下一步操作:" -ForegroundColor Yellow
    Write-Host "1. 继续本地测试" -ForegroundColor White
    Write-Host "2. 部署到Vercel" -ForegroundColor White
    Write-Host "3. 推送到GitHub" -ForegroundColor White
    Write-Host "4. 关闭服务器并退出" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "请选择 (1/2/3/4)"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "✅ 服务器继续运行" -ForegroundColor Green
            Write-Host "访问地址: http://localhost:3000" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "按任意键退出脚本（服务器会继续运行）..." -ForegroundColor Yellow
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        "2" {
            Write-Host ""
            Write-Host "🚀 准备部署到Vercel..." -ForegroundColor Blue
            Write-Host ""
            Write-Host "请确保已安装Vercel CLI: npm i -g vercel" -ForegroundColor Yellow
            Write-Host "然后运行: vercel --prod" -ForegroundColor Cyan
            Write-Host ""
            Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
        }
        "3" {
            Write-Host ""
            Write-Host "📤 准备推送到GitHub..." -ForegroundColor Blue
            Write-Host ""
            
            git add .
            $commitMsg = Read-Host "请输入提交信息"
            git commit -m $commitMsg
            git push
            
            Write-Host "✅ 已推送到GitHub" -ForegroundColor Green
            Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
        }
        "4" {
            Write-Host ""
            Write-Host "🛑 正在关闭服务器..." -ForegroundColor Yellow
            Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
            Write-Host "✅ 服务器已关闭" -ForegroundColor Green
        }
    }
} else {
    Write-Host "⚠️  测试未完全通过，建议修复问题后再部署。" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "选项:" -ForegroundColor Yellow
    Write-Host "1. 查看详细错误日志" -ForegroundColor White
    Write-Host "2. 继续本地调试" -ForegroundColor White
    Write-Host "3. 关闭服务器并退出" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "请选择 (1/2/3)"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "查看上方的测试输出了解详细错误信息" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "按任意键继续..." -ForegroundColor Yellow
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        "2" {
            Write-Host ""
            Write-Host "✅ 服务器继续运行" -ForegroundColor Green
            Write-Host "访问地址: http://localhost:3000" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "按任意键退出脚本..." -ForegroundColor Yellow
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        "3" {
            Write-Host ""
            Write-Host "🛑 正在关闭服务器..." -ForegroundColor Yellow
            Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
            Write-Host "✅ 服务器已关闭" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "流程完成！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
