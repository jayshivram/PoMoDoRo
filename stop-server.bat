@echo off
echo ============================================
echo   FocusFlow - Stopping Dev Server
echo ============================================
echo.
echo Stopping any running Vite dev server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    echo Killing process PID: %%a
    taskkill /PID %%a /F 2>nul
)
echo.
echo Server stopped.
pause
