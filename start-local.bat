@echo off
chcp 65001 >nul
echo ========================================
echo Starting Local Development Server
echo ========================================
echo.

echo Checking environment...
if not exist ".env.local" (
    echo ERROR: .env.local file not found!
    echo Please create .env.local file first
    pause
    exit /b 1
)
echo OK: .env.local exists
echo.

echo Starting development server...
echo.
echo Visit: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
call npm run dev
