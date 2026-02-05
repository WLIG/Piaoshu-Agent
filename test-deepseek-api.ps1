#!/usr/bin/env pwsh
# DeepSeek API 测试脚本

Write-Host "🧠 DeepSeek API 测试工具" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# 检查Node.js是否安装
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未找到 Node.js，请先安装 Node.js" -ForegroundColor Red
    exit 1
}

# 检查必要的依赖
Write-Host "`n📦 检查依赖..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules/node-fetch")) {
    Write-Host "⚠️  未找到 node-fetch，正在安装..." -ForegroundColor Yellow
    npm install node-fetch
}

# 显示菜单
Write-Host "`n🎯 请选择测试类型:" -ForegroundColor Cyan
Write-Host "1. 仅测试 DeepSeek API" -ForegroundColor White
Write-Host "2. 测试所有 API (DeepSeek + OpenRouter)" -ForegroundColor White
Write-Host "3. 快速连接测试" -ForegroundColor White
Write-Host "4. 退出" -ForegroundColor White

$choice = Read-Host "`n请输入选择 (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`n🧠 开始测试 DeepSeek API..." -ForegroundColor Green
        node test-deepseek.js
    }
    "2" {
        Write-Host "`n🌐 开始测试所有 API..." -ForegroundColor Green
        node test-all-apis.js
    }
    "3" {
        Write-Host "`n⚡ 快速连接测试..." -ForegroundColor Green
        
        # 创建快速测试脚本
        $quickTest = @"
const fetch = require('node-fetch');

async function quickTest() {
    console.log('🔍 快速连接测试...\n');
    
    const apis = [
        {
            name: 'DeepSeek',
            url: 'https://api.deepseek.com/v1/models',
            key: 'sk-85004076a7fb47dc99ead5543dd8bda2'
        },
        {
            name: 'OpenRouter',
            url: 'https://openrouter.ai/api/v1/models',
            key: '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'
        }
    ];
    
    for (const api of apis) {
        try {
            console.log(`测试 ${api.name}...`);
            const response = await fetch(api.url, {
                headers: { 'Authorization': `Bearer ${api.key}` },
                timeout: 5000
            });
            
            if (response.ok) {
                console.log(`✅ ${api.name} 连接正常`);
            } else {
                console.log(`❌ ${api.name} 连接失败: ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${api.name} 连接错误: ${error.message}`);
        }
    }
}

quickTest();
"@
        
        $quickTest | Out-File -FilePath "quick-test.js" -Encoding UTF8
        node quick-test.js
        Remove-Item "quick-test.js" -Force
    }
    "4" {
        Write-Host "👋 再见!" -ForegroundColor Green
        exit 0
    }
    default {
        Write-Host "❌ 无效选择，请重新运行脚本" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n✨ 测试完成！" -ForegroundColor Green
Write-Host "💡 提示: 如果遇到问题，请检查 .env.local 中的API密钥配置" -ForegroundColor Yellow