@echo off
chcp 65001 >nul
echo ========================================
echo Complete Fix and Deploy Process
echo ========================================
echo.

echo [1/7] Cleaning npm cache...
call npm cache clean --force
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: npm cache clean failed, continuing...
)
echo.

echo [2/7] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo OK: Dependencies installed
echo.

echo [3/7] Generating Prisma client...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Prisma generate failed, continuing...
)
echo.

echo [4/7] Building Next.js application...
call npx next build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo OK: Build successful
echo.

echo [5/7] Checking git status...
call git status
echo.

echo [6/7] Adding all changes to git...
call git add .
call git commit -m "Fix build errors and update configuration"
echo.

echo [7/7] Pushing to GitHub...
call git push origin main
if %ERRORLEVEL% NEQ 0 (
    echo Trying 'master' branch...
    call git push origin master
)
echo.

echo ========================================
echo SUCCESS! All steps completed
echo ========================================
echo.
echo Next steps:
echo 1. Go to https://vercel.com/wligs-projects
echo 2. Click on your project
echo 3. Click "Redeploy" or wait for automatic deployment
echo.
pause
