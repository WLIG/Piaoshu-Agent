@echo off
chcp 65001 >nul

echo Cleaning...
if exist .next rmdir /s /q .next

echo.
echo Building with verbose output...
echo.

npx next build > build-output.txt 2>&1

type build-output.txt

echo.
if %ERRORLEVEL% EQU 0 (
    echo Build SUCCESS!
) else (
    echo Build FAILED! Check build-output.txt for details
)
