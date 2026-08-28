@echo off
title Sai Balaji Silverworks - Live Server & Git Sync Console
cls
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\live_monitor.ps1"
pause
