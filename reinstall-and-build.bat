@echo off
chcp 65001 >nul

echo ========================================
echo Fixing Next.js Installation
echo ========================================
echo.

echo Step 1: Remove node_modules and package-lock.json
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
)
echo   OK: Cleaned
echo.

echo Step 2: Install dependencies
echo This may take a few minutes...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo   ERROR: npm install failed!
    pause
    exit /b 1
)
echo   OK: Dependencies installed
echo.

echo Step 3: Generate Prisma client
call npx prisma generate
echo   OK: Prisma client generated
echo.

echo Step 4: Build Next.js
call npx next build
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo SUCCESS! Build completed
    echo ========================================
    echo.
    echo You can now run: npm start
) else (
    echo ========================================
    echo FAILED! Build error
    echo ========================================
)

pause
