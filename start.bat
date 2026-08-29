@echo off
title Sai Balaji Silverworks - Live Server & Git Sync Console
cls
:loop
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\live_monitor.ps1"
timeout /t 3 /nobreak >nul 2>&1
goto loop

