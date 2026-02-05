# 飘叔Agent - 启动并测试脚本
# 自动启动服务器并运行全面测试

Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     飘叔Agent - 启动并测试                            ║" -ForegroundColor Cyan
Write-Host "║     自动启动服务器并运行全面测试                      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. 检查端口占用
Write-Host "🔍 检查端口 3000..." -ForegroundColor Blue
$port = 3000
$connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue

if ($connection.TcpTestSucceeded) {
    Write-Host "⚠️  端口 3000 已被占用" -ForegroundColor Yellow
    Write-Host "正在尝试关闭占用端口的进程..." -ForegroundColor Yellow
    
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
    if ($process) {
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Write-Host "✅ 已关闭进程 PID: $process" -ForegroundColor Green
        Start-Sleep -Seconds 2
    }
}

# 2. 启动开发服务器
Write-Host ""
Write-Host "🚀 启动开发服务器..." -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# 使用 Start-Process 在后台启动服务器
$serverProcess = Start-Process -FilePath "node" -ArgumentList "simple-start.js" -PassThru -WindowStyle Hidden

Write-Host "✅ 服务器进程已启动 (PID: $($serverProcess.Id))" -ForegroundColor Green

# 3. 等待服务器启动
Write-Host ""
Write-Host "⏳ 等待服务器启动..." -ForegroundColor Yellow

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

if ($serverReady) {
    Write-Host "✅ 服务器已就绪！" -ForegroundColor Green
} else {
    Write-Host "❌ 服务器启动超时" -ForegroundColor Red
    Write-Host "请手动检查服务器状态" -ForegroundColor Yellow
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

# 4. 运行全面测试
Write-Host ""
Write-Host "🧪 开始运行全面测试..." -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

try {
    # 运行测试脚本
    node test-all-local.js
    
    $testExitCode = $LASTEXITCODE
    
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    
    if ($testExitCode -eq 0) {
        Write-Host "✅ 所有测试完成！" -ForegroundColor Green
    } else {
        Write-Host "⚠️  测试完成，但有部分失败" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ 测试执行失败: $_" -ForegroundColor Red
}

# 5. 询问是否关闭服务器
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "服务器仍在运行中..." -ForegroundColor Blue
Write-Host "访问地址: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "选项:" -ForegroundColor Yellow
Write-Host "  1. 保持服务器运行，手动测试" -ForegroundColor White
Write-Host "  2. 关闭服务器并退出" -ForegroundColor White
Write-Host ""

$choice = Read-Host "请选择 (1/2)"

if ($choice -eq "2") {
    Write-Host ""
    Write-Host "🛑 正在关闭服务器..." -ForegroundColor Yellow
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "✅ 服务器已关闭" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✅ 服务器继续运行" -ForegroundColor Green
    Write-Host "访问地址: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "按 Ctrl+C 可以停止此脚本（服务器会继续运行）" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "要关闭服务器，请运行:" -ForegroundColor Yellow
    Write-Host "  Stop-Process -Id $($serverProcess.Id)" -ForegroundColor White
    Write-Host ""
    
    # 保持脚本运行
    Write-Host "按任意键退出脚本..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "测试完成！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
