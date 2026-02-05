@echo off
echo ========================================
echo 飘叔Agent - 手动启动服务器
echo ========================================
echo.

echo [1/3] 检查Node.js版本...
node --version
echo.

echo [2/3] 检查端口3000...
netstat -ano | findstr :3000
echo.

echo [3/3] 启动开发服务器...
echo 请等待服务器启动完成...
echo 看到 "Ready on http://localhost:3000" 后即可测试
echo.

npm run dev
