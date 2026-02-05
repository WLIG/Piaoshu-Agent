@echo off
echo Starting build...
call npm run build
echo Build completed with exit code: %ERRORLEVEL%
pause
