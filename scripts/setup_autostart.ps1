# Sai Balaji Silverworks - Visible Autostart Setup Script
# Configures Windows Startup folder and HKCU Run registry key to automatically launch
# a VISIBLE Command Prompt window running the live server and 60-second Git Fetch monitor on boot.

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$workspace = (Resolve-Path "$scriptDir\..").Path

$startupFolder = [Environment]::GetFolderPath('Startup')
$legacyVbs = "$startupFolder\Start_SaiBalaji_Server.vbs"
$startupBat = "$startupFolder\Start_SaiBalaji_LiveConsole.bat"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Configuring Sai Balaji Visible Autostart on Boot" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Clean up legacy hidden VBScript if present
if (Test-Path $legacyVbs) {
    Remove-Item -Path $legacyVbs -Force -ErrorAction SilentlyContinue
    Write-Host "[1/3] Removed old hidden VBS startup script" -ForegroundColor Green
} else {
    Write-Host "[1/3] Cleaned up legacy startup items" -ForegroundColor Green
}

# 2. Write Visible Startup Folder Batch File
$batContent = @"
@echo off
title Sai Balaji Silverworks - Live Server & Git Sync Console
cd /d "$workspace"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$workspace\scripts\live_monitor.ps1"
pause
"@

Set-Content -Path $startupBat -Value $batContent -Encoding ASCII
Write-Host "[2/3] Created Visible Startup Launcher at: $startupBat" -ForegroundColor Green

# 3. Configure HKCU Run Registry Entry for direct boot startup
$regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
$regValue = "cmd.exe /c start `"`" `"$workspace\start.bat`""
Set-ItemProperty -Path $regPath -Name "SaiBalajiServer" -Value $regValue
Write-Host "[3/3] Configured Registry Run Key (HKCU): SaiBalajiServer" -ForegroundColor Green

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  Autostart Configuration Complete!" -ForegroundColor Yellow
Write-Host "  When you turn on / restart your PC:" -ForegroundColor White
Write-Host "  - A visible Command Prompt terminal will auto-open." -ForegroundColor Green
Write-Host "  - It will run your Backend (8000), Frontend (5173), and Cloudflare Tunnel." -ForegroundColor Green
Write-Host "  - It will run and display Git Fetch every 60 seconds live on screen!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
