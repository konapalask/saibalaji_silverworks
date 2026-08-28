# Sai Balaji Silverworks - Autostart Setup Script
# Configures Windows Startup folder and HKCU Run registry key for automatic 24/7 background launch.

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$workspace = (Resolve-Path "$scriptDir\..").Path

$launcherVbs = "$workspace\start_hidden.vbs"
$startupFolder = [Environment]::GetFolderPath('Startup')
$startupVbs = "$startupFolder\Start_SaiBalaji_Server.vbs"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Configuring Sai Balaji Silverworks Autostart on Boot" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Write Startup Folder VBS Script
$vbsContent = @"
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "$workspace"
WshShell.Run "wscript.exe """ & "$launcherVbs" & """", 0, False
"@

Set-Content -Path $startupVbs -Value $vbsContent -Encoding ASCII
Write-Host "[1/2] Configured Startup Folder script at: $startupVbs" -ForegroundColor Green

# 2. Configure HKCU Run Registry Entry
$regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
$regValue = "wscript.exe `"$launcherVbs`""
Set-ItemProperty -Path $regPath -Name "SaiBalajiServer" -Value $regValue
Write-Host "[2/2] Configured Registry Run Key (HKCU): SaiBalajiServer" -ForegroundColor Green

Write-Host "`nAutostart configuration complete! The server stack will start automatically on boot." -ForegroundColor Cyan
