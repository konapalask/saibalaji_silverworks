@echo off
title Sai Balaji Silverworks - Live Server & Git Sync Console
cd /d "%~dp0"
cls
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\live_monitor.ps1"
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Live Monitor exited with code %ERRORLEVEL%.
    echo Press any key to restart or close this window...
    pause >nul
)

