@echo off
echo ========================================
echo 飘叔 Agent 启动脚本
echo ========================================
echo.

echo [1/4] 检查依赖...
if not exist "node_modules" (
    echo 正在安装依赖，请稍候...
    call npm install
    if errorlevel 1 (
        echo 依赖安装失败！
        pause
        exit /b 1
    )
    echo 依赖安装完成！
) else (
    echo 依赖已存在，跳过安装
)
echo.

echo [2/4] 生成 Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo Prisma 生成失败！
    pause
    exit /b 1
)
echo.

echo [3/4] 推送数据库 Schema...
call npx prisma db push
if errorlevel 1 (
    echo 数据库推送失败！
    pause
    exit /b 1
)
echo.

echo [4/4] 启动开发服务器...
echo.
echo ========================================
echo 服务器即将启动...
echo 访问地址: http://localhost:3000
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

call npm run dev
