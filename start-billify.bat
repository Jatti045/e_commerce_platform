@echo off
echo Starting Billify E-commerce Application...
echo.
echo Starting Backend Server...
cd /d "%~dp0\server"
start "Backend Server" cmd /k "npm start"
echo.
echo Waiting for backend to start...
timeout /t 3 /nobreak > nul
echo.
echo Starting Frontend Application...
cd /d "%~dp0\client"
start "Frontend App" cmd /k "npm run dev"
echo.
echo Both servers are starting...
echo Backend will be available at: http://localhost:5000
echo Frontend will be available at: http://localhost:5173
echo.
pause
