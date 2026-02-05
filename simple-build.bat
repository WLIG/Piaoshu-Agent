@echo off
chcp 65001 >nul
echo ========================================
echo Starting Build Process
echo ========================================
echo.

echo Step 1: Clean .next directory
if exist .next (
    rmdir /s /q .next
    echo   OK: .next cleaned
) else (
    echo   OK: .next does not exist
)
echo.

echo Step 2: Generate Prisma client
call npx prisma generate
echo.

echo Step 3: Build Next.js application
call npx next build
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo Build SUCCESS!
    echo ========================================
    echo.
    echo You can now run: npm start
) else (
    echo ========================================
    echo Build FAILED! Error code: %ERRORLEVEL%
    echo ========================================
)

pause
