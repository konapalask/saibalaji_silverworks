@echo off
title Sai Balaji Silverworks Node.js & Cloudflare Live Launcher
cls
echo ========================================================
echo   Starting Sai Balaji Silverworks (Node.js Backend & Frontend)
echo ========================================================
echo.

:: Get workspace directory
set WORKSPACE_DIR=%~dp0


:: Free ports and old tunnel if occupied
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
taskkill /F /IM cloudflared.exe >nul 2>&1

:: Set Cloudflare Named Tunnel Token for saibalajisilverworkspvtltd.com
set CF_TOKEN=eyJhIjoiMDU4NzM5ZmEzOGM4MzNjMTI4NDYxNmJiYjg4Yjk1MGMiLCJ0IjoiYjNiOGIyOWQtYWExZC00NTEwLTgzODYtMmVkYzYzYWY0MThiIiwicyI6Ik9HTTRZMk5qTnpRdE56UXlNQzAwTTJZd0xXRTNOMk10TXpSa1lXWXpZamsyTW1KbSJ9

:: Launch Node.js JSON Backend Server in a new window
echo [1/3] Launching Node.js Backend Server (Express on http://localhost:8000)...
start "Sai Balaji Backend" cmd /k "cd /d "%WORKSPACE_DIR%backend" && node server.js"

:: Wait 2 seconds before launching frontend
timeout /t 2 /nobreak >nul

:: Launch Frontend Server in a new window
echo [2/3] Launching Frontend Server (Vite React on http://localhost:5173)...
start "Sai Balaji Frontend" cmd /k "cd /d "%WORKSPACE_DIR%frontend" && npm run dev"

:: Wait 3 seconds before launching Cloudflare tunnel
timeout /t 3 /nobreak >nul

:: Launch Cloudflare Tunnel in a new window
echo [3/3] Launching Cloudflare Named Tunnel for http://saibalaji.e3di.org/...
if exist "%WORKSPACE_DIR%cloudflared.exe" (
    start "Sai Balaji Cloudflare Tunnel" cmd /k "cd /d "%WORKSPACE_DIR%" && cloudflared.exe tunnel run --token %CF_TOKEN%"
) else (
    start "Sai Balaji Cloudflare Tunnel" cmd /k "cloudflared tunnel run --token %CF_TOKEN%"
)

echo.
echo ========================================================
echo   All 3 services launched successfully!
echo   - Local Backend API:  http://localhost:8000/docs
echo   - Local Frontend App: http://localhost:5173
echo   - Fixed Live Domain:  http://saibalaji.e3di.org/
echo ========================================================
echo.
pause
