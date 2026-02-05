# 简单启动和测试脚本

Write-Host "启动飘叔Agent服务器..." -ForegroundColor Cyan

# 检查端口是否被占用
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "端口3000已被占用，尝试终止..." -ForegroundColor Yellow
    Stop-Process -Id $port3000.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# 启动开发服务器
Write-Host "启动Next.js开发服务器..." -ForegroundColor Green
Start-Process -FilePath "cmd" -ArgumentList "/c", "npx next dev -p 3000" -WindowStyle Minimized

# 等待服务器启动
Write-Host "等待服务器启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 测试服务器连接
Write-Host "测试服务器连接..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/test-llm" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "服务器连接成功！" -ForegroundColor Green
        
        # 运行测试
        Write-Host "开始运行Skills系统测试..." -ForegroundColor Cyan
        node test-simple-skills.js
        
    } else {
        Write-Host "服务器响应异常: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "无法连接到服务器: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "请检查服务器是否正常启动" -ForegroundColor Yellow
}

Write-Host "测试完成！" -ForegroundColor Cyan