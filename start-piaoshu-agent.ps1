# 飘叔Agent快速启动脚本
# 集成NVIDIA Build API的完整版本

Write-Host "🚀 启动飘叔Agent - NVIDIA增强版" -ForegroundColor Green
Write-Host "=" * 50

# 检查Node.js
Write-Host "📋 检查环境..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 未找到Node.js，请先安装Node.js" -ForegroundColor Red
    exit 1
}

# 检查依赖
Write-Host "📦 检查依赖..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    Write-Host "📥 安装依赖..." -ForegroundColor Yellow
    npm install
}

# 检查环境变量
Write-Host "🔧 检查配置..." -ForegroundColor Yellow
if (!(Test-Path ".env.local")) {
    Write-Host "❌ 未找到.env.local文件" -ForegroundColor Red
    exit 1
}

# 显示NVIDIA配置
$envContent = Get-Content ".env.local" | Where-Object { $_ -match "NVIDIA" }
if ($envContent) {
    Write-Host "✅ NVIDIA API配置已找到" -ForegroundColor Green
    $envContent | ForEach-Object {
        if ($_ -match "NVIDIA_API_KEY=(.+)") {
            $key = $matches[1]
            Write-Host "   API Key: $($key.Substring(0,20))..." -ForegroundColor Cyan
        }
        if ($_ -match "NVIDIA_BASE_URL=(.+)") {
            Write-Host "   Base URL: $($matches[1])" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "⚠️  未找到NVIDIA配置" -ForegroundColor Yellow
}

# 初始化数据库
Write-Host "🗄️  初始化数据库..." -ForegroundColor Yellow
try {
    npx prisma generate
    npx prisma db push
    Write-Host "✅ 数据库初始化完成" -ForegroundColor Green
} catch {
    Write-Host "⚠️  数据库初始化可能有问题，但继续启动..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 飘叔Agent功能特性:" -ForegroundColor Cyan
Write-Host "   • 🧠 GLM4.7 思维链推理" -ForegroundColor White
Write-Host "   • 🎨 Kimi2.5 创意生成" -ForegroundColor White
Write-Host "   • 🤖 智能模型选择" -ForegroundColor White
Write-Host "   • 💼 商业分析专家" -ForegroundColor White
Write-Host "   • 📊 多模态支持" -ForegroundColor White
Write-Host "   • 🔄 实时流式响应" -ForegroundColor White

Write-Host ""
Write-Host "🌐 启动开发服务器..." -ForegroundColor Green
Write-Host "   访问地址: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   聊天测试: http://localhost:3000/chat-test" -ForegroundColor Cyan
Write-Host "   管理面板: http://localhost:3000/admin" -ForegroundColor Cyan
Write-Host "   文件上传: http://localhost:3000/upload" -ForegroundColor Cyan

Write-Host ""
Write-Host "💡 使用提示:" -ForegroundColor Yellow
Write-Host "   • 按 Ctrl+C 停止服务器" -ForegroundColor White
Write-Host "   • 修改代码会自动重载" -ForegroundColor White
Write-Host "   • 查看控制台日志了解运行状态" -ForegroundColor White

Write-Host ""
Write-Host "🚀 正在启动..." -ForegroundColor Green

# 启动开发服务器
npm run dev