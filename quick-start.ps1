# 飘叔Agent 快速启动脚本

Write-Host "🚀 飘叔Agent 快速启动" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

# 检查Node.js
Write-Host "`n📋 检查环境..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 未找到Node.js，请先安装Node.js" -ForegroundColor Red
    exit 1
}

# 检查npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 未找到npm" -ForegroundColor Red
    exit 1
}

# 安装依赖
Write-Host "`n📦 安装依赖..." -ForegroundColor Yellow
try {
    npm install --silent
    Write-Host "✅ 依赖安装完成" -ForegroundColor Green
} catch {
    Write-Host "⚠️ 依赖安装可能有问题，继续尝试启动..." -ForegroundColor Yellow
}

# 生成Prisma客户端
Write-Host "`n🗄️ 配置数据库..." -ForegroundColor Yellow
try {
    npx prisma generate --silent
    Write-Host "✅ 数据库配置完成" -ForegroundColor Green
} catch {
    Write-Host "⚠️ 数据库配置可能有问题，继续尝试启动..." -ForegroundColor Yellow
}

# 启动开发服务器
Write-Host "`n🚀 启动飘叔Agent..." -ForegroundColor Yellow
Write-Host "正在启动开发服务器，请稍候..." -ForegroundColor Cyan

try {
    # 启动服务器
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow
    
    Write-Host "`n⏳ 等待服务器启动..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # 测试服务器
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ 服务器启动成功！" -ForegroundColor Green
            Write-Host "`n🌟 飘叔Agent已就绪！" -ForegroundColor Green
            Write-Host "📱 访问地址: http://localhost:3000" -ForegroundColor Cyan
            Write-Host "`n🎯 功能亮点:" -ForegroundColor Yellow
            Write-Host "• 🧠 长期记忆 - 记住您的对话和偏好" -ForegroundColor White
            Write-Host "• 🎭 飘叔人格 - 专业的商业思维和表达" -ForegroundColor White
            Write-Host "• 🎤 多模态交互 - 语音、图片、文字全支持" -ForegroundColor White
            Write-Host "• 📱 移动端优化 - 完美适配各种设备" -ForegroundColor White
            Write-Host "• 🚀 智能优化 - 持续学习和改进" -ForegroundColor White
            
            # 打开浏览器
            Write-Host "`n🌐 正在打开浏览器..." -ForegroundColor Cyan
            Start-Process "http://localhost:3000"
            
        } else {
            Write-Host "⚠️ 服务器可能还在启动中..." -ForegroundColor Yellow
            Write-Host "请手动访问: http://localhost:3000" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "⚠️ 服务器可能还在启动中..." -ForegroundColor Yellow
        Write-Host "请稍候片刻，然后访问: http://localhost:3000" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "❌ 启动失败: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n🔧 故障排除建议:" -ForegroundColor Yellow
    Write-Host "1. 检查端口3000是否被占用" -ForegroundColor White
    Write-Host "2. 运行 'npm install' 重新安装依赖" -ForegroundColor White
    Write-Host "3. 检查Node.js版本是否为16+" -ForegroundColor White
}

Write-Host "`n📚 更多信息:" -ForegroundColor Yellow
Write-Host "• 启动指南: LAUNCH_VERIFICATION_GUIDE.md" -ForegroundColor White
Write-Host "• 功能展示: COMPLETE_ENHANCEMENT_SUMMARY.md" -ForegroundColor White
Write-Host "• 测试脚本: test-complete-features.ps1" -ForegroundColor White

Write-Host "`n🎉 享受使用飘叔Agent！" -ForegroundColor Green