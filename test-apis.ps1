# 飘叔 Agent API 自动化测试脚本
# PowerShell 版本

$BASE_URL = "http://localhost:3000"
$ErrorActionPreference = "Continue"

Write-Host "=== 飘叔 Agent API 测试 ===" -ForegroundColor Cyan
Write-Host ""

# 测试计数器
$total = 0
$passed = 0
$failed = 0

function Test-API {
    param(
        [string]$Name,
        [string]$Method = "GET",
        [string]$Url,
        [string]$Body = $null
    )
    
    $global:total++
    Write-Host "[$global:total] 测试: $Name" -ForegroundColor Yellow
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $Url -Method Get -ErrorAction Stop
        } else {
            $headers = @{ "Content-Type" = "application/json" }
            $response = Invoke-RestMethod -Uri $Url -Method Post -Body $Body -Headers $headers -ErrorAction Stop
        }
        
        if ($response.success -eq $true) {
            Write-Host "   ✓ 通过" -ForegroundColor Green
            $global:passed++
            return $response
        } else {
            Write-Host "   ✗ 失败: $($response.error)" -ForegroundColor Red
            $global:failed++
            return $null
        }
    } catch {
        Write-Host "   ✗ 错误: $($_.Exception.Message)" -ForegroundColor Red
        $global:failed++
        return $null
    }
}

Write-Host "开始测试..." -ForegroundColor Cyan
Write-Host ""

# 1. 初始化数据
Write-Host "=== 基础功能测试 ===" -ForegroundColor Magenta
$seedResult = Test-API -Name "初始化示例数据" -Method "POST" -Url "$BASE_URL/api/seed"
Start-Sleep -Seconds 1

# 2. 获取文章列表
$articlesResult = Test-API -Name "获取文章列表" -Url "$BASE_URL/api/articles?page=1&limit=10"
$articleId = if ($articlesResult -and $articlesResult.data.articles.Count -gt 0) { 
    $articlesResult.data.articles[0].id 
} else { 
    "test-article-1" 
}
Start-Sleep -Seconds 1

# 3. 获取文章详情
if ($articleId) {
    Test-API -Name "获取文章详情" -Url "$BASE_URL/api/articles/$articleId"
    Start-Sleep -Seconds 1
}

# 4. 搜索文章
Test-API -Name "搜索文章" -Url "$BASE_URL/api/articles/search?q=飘叔"
Start-Sleep -Seconds 1

Write-Host ""
Write-Host "=== 推荐系统测试 ===" -ForegroundColor Magenta

# 5. 获取推荐
Test-API -Name "获取个性化推荐" -Url "$BASE_URL/api/recommendations?userId=anonymous&limit=5"
Start-Sleep -Seconds 1

Write-Host ""
Write-Host "=== 行为追踪测试 ===" -ForegroundColor Magenta

# 6. 记录浏览行为
$viewBody = @{
    userId = "anonymous"
    articleId = $articleId
    interactionType = "view"
    duration = 120
} | ConvertTo-Json

Test-API -Name "记录浏览行为" -Method "POST" -Url "$BASE_URL/api/behavior/track" -Body $viewBody
Start-Sleep -Seconds 1

# 7. 记录点赞行为
$likeBody = @{
    userId = "anonymous"
    articleId = $articleId
    interactionType = "like"
} | ConvertTo-Json

Test-API -Name "记录点赞行为" -Method "POST" -Url "$BASE_URL/api/behavior/track" -Body $likeBody
Start-Sleep -Seconds 1

# 8. 获取行为统计
Test-API -Name "获取行为统计" -Url "$BASE_URL/api/behavior/stats?userId=anonymous"
Start-Sleep -Seconds 1

Write-Host ""
Write-Host "=== 用户画像测试 ===" -ForegroundColor Magenta

# 9. 获取用户统计
Test-API -Name "获取用户统计" -Url "$BASE_URL/api/users/anonymous/stats"
Start-Sleep -Seconds 1

# 10. 获取用户兴趣
Test-API -Name "获取用户兴趣" -Url "$BASE_URL/api/users/anonymous/interests"
Start-Sleep -Seconds 1

Write-Host ""
Write-Host "=== 对话系统测试 ===" -ForegroundColor Magenta

# 11. 发送消息
$chatBody = @{
    message = "介绍一下飘叔"
    userId = "anonymous"
} | ConvertTo-Json

$chatResult = Test-API -Name "发送聊天消息" -Method "POST" -Url "$BASE_URL/api/chat" -Body $chatBody
$conversationId = if ($chatResult) { $chatResult.data.conversationId } else { $null }
Start-Sleep -Seconds 2

# 12. 获取对话列表
Test-API -Name "获取对话列表" -Url "$BASE_URL/api/conversations?userId=anonymous"
Start-Sleep -Seconds 1

# 13. 获取对话消息
if ($conversationId) {
    Test-API -Name "获取对话消息" -Url "$BASE_URL/api/conversations/$conversationId/messages"
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "=== 统计数据测试 ===" -ForegroundColor Magenta

# 14. 获取系统统计
Test-API -Name "获取系统统计概览" -Url "$BASE_URL/api/stats/overview"
Start-Sleep -Seconds 1

Write-Host ""
Write-Host "=== 知识图谱测试 ===" -ForegroundColor Magenta

# 15. 获取知识图谱
if ($articleId) {
    Test-API -Name "获取知识图谱" -Url "$BASE_URL/api/knowledge/graph?articleId=$articleId"
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "=== 测试完成 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "测试结果统计:" -ForegroundColor White
Write-Host "  总计: $total" -ForegroundColor White
Write-Host "  通过: $passed" -ForegroundColor Green
Write-Host "  失败: $failed" -ForegroundColor Red
Write-Host "  成功率: $([math]::Round($passed / $total * 100, 2))%" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })
Write-Host ""

if ($passed -eq $total) {
    Write-Host "🎉 所有测试通过！" -ForegroundColor Green
} else {
    Write-Host "⚠️  部分测试失败，请检查服务器日志" -ForegroundColor Yellow
}
