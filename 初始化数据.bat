@echo off
echo ========================================
echo 飘叔 Agent 数据初始化
echo ========================================
echo.

echo 正在初始化示例数据...
echo.

powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/seed' -Method Post -ErrorAction Stop; Write-Host '成功！' -ForegroundColor Green; Write-Host ($response | ConvertTo-Json -Depth 10); } catch { Write-Host '失败：请确保服务器正在运行 (npm run dev)' -ForegroundColor Red; Write-Host $_.Exception.Message -ForegroundColor Red; }"

echo.
echo ========================================
echo 初始化完成！
echo 现在可以访问: http://localhost:3000
echo ========================================
echo.
pause
