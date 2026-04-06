@echo off
echo ============================================
echo   FocusFlow - Kill Port Utility
echo ============================================
echo.
set /p PORT=Enter port number to kill (default 5173): 
if "%PORT%"=="" set PORT=5173

echo.
echo Looking for processes on port %PORT%...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
    echo Found process PID: %%a on port %PORT%
    taskkill /PID %%a /F 2>nul
    echo Process %%a killed.
)
echo.
echo Done. Port %PORT% should now be free.
pause
