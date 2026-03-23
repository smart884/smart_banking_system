@echo off
TITLE SmartBank - Ultimate Control Center
SETLOCAL EnableDelayedExpansion

echo.
echo  ██████╗ ███╗   ███╗ █████╗ ██████╗ ████████╗██████╗  █████╗ ███╗   ██╗██╗  ██╗
echo ██╔════╝ ████╗ ████║██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗██╔══██╗████╗  ██║██║ ██╔╝
echo ╚█████╗  ██╔████╔██║███████║██████╔╝   ██║   ██████╔╝███████║██╔██╗ ██║█████╔╝ 
echo  ╚═══██╗ ██║╚██╔╝██║██╔══██║██╔══██╗   ██║   ██╔══██╗██╔══██║██║╚██╗██║██╔═██╗ 
echo ██████╔╝ ██║ ╚═╝ ██║██║  ██║██║  ██║   ██║   ██████╔╝██║  ██║██║ ╚████║██║  ██╗
echo ╚═════╝  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝
echo.
echo ==============================================================================
echo   SMART BANK - SECURE TERMINAL STARTUP
echo ==============================================================================
echo.

:: Check for Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed! Please install it from nodejs.org
    pause
    exit /b
)

:: 1. Backend Startup
echo [1/2] Launching Backend Secure Server (Port 5000)...
cd server
:: Start in background and log to file
start "SmartBank-Backend" cmd /c "npm run dev > ../backend.log 2>&1"
echo      - Backend started in background. Logs: backend.log
cd ..

:: 2. Frontend Startup
echo [2/2] Launching Frontend Dashboard (Port 5173)...
cd client
:: Start in background and log to file
start "SmartBank-Frontend" cmd /c "npm run dev > ../frontend.log 2>&1"
echo      - Frontend started in background. Logs: frontend.log
cd ..

echo.
echo ==============================================================================
echo   SUCCESS: Terminal is now online.
echo ==============================================================================
echo.
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://localhost:5000
echo.
echo   TIP: To keep this running PERMANENTLY:
echo   1. Do not close the command windows that just opened.
echo   2. Ensure your laptop does not enter "Sleep Mode" when the lid is closed.
echo      (Settings > System > Power & sleep > Lid close action)
echo.
echo ==============================================================================
echo.
pause
