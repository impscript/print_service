@echo off
title DACP Dev Server
echo ========================================
echo   Starting DACP Development Server...
echo ========================================
echo.
cd /d "c:\Users\ACER\Desktop\Works\IMP\DACP\Kimi_Agent_DACP\app"
echo Server will be available at: http://localhost:5173
echo Press Ctrl+C to stop the server
echo.
npm run dev
pause
