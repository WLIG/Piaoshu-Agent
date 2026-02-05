# 启动服务器并测试功能

Write-Host "启动飘叔Agent服务器..." -ForegroundColor Cyan

# 启动开发服务器
Write-Host "启动Next.js开发服务器..." -ForegroundColor Green
$process = Start-Process -FilePath "npx" -ArgumentList "next", "dev", "-p", "3000" -PassThru -WindowStyle Minimized

# 等待服务器启动
Write-Host "等待服务器启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 25

# 测试服务器连接
Write-Host "测试服务器连接..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "服务器启动成功！" -ForegroundColor Green
        
        Write-Host "运行功能测试..." -ForegroundColor Cyan
        node test-all-functions.js
        
        Write-Host "`n访问地址: http://localhost:3000" -ForegroundColor Green
        Write-Host "服务器将继续运行，按Ctrl+C停止" -ForegroundColor Yellow
        
        # 保持脚本运行
        try {
            while ($true) {
                Start-Sleep -Seconds 30
                Write-Host "服务器运行中... $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray
            }
        } catch {
            Write-Host "停止服务器..." -ForegroundColor Yellow
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
        
    } else {
        Write-Host "服务器响应异常" -ForegroundColor Red
    }
} catch {
    Write-Host "无法连接到服务器，可能启动失败" -ForegroundColor Red
    Write-Host "请手动运行: npx next dev -p 3000" -ForegroundColor Yellow
}

Write-Host "脚本结束" -ForegroundColor Cyan