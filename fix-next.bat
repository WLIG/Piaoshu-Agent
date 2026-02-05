@echo off
echo Reinstalling Next.js...
call npm install next@latest --force
echo.
echo Testing Next.js...
call npx next --version
echo.
if %ERRORLEVEL% EQU 0 (
    echo OK: Next.js is working
    echo.
    echo Now trying to build...
    call npx next build
) else (
    echo ERROR: Next.js still broken
)
pause
