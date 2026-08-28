@echo off
title Sai Balaji Silverworks - Configure Autostart on Boot
cls
echo ==========================================================
echo   Configuring Sai Balaji Silverworks Autostart on Boot
echo ==========================================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup_autostart.ps1"

echo.
timeout /t 5 /nobreak >nul 2>&1
pause
