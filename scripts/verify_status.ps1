# Sai Balaji Silverworks - System Verification & Health Check Script

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$workspace = (Resolve-Path "$scriptDir\..").Path
Set-Location $workspace

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Sai Balaji Silverworks - Complete System Health Check" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check Listening Ports
Write-Host "`n[1/5] Checking Local Ports (Backend & Frontend)..." -ForegroundColor Yellow
$backendPort = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
$frontendPort = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue

if ($backendPort) {
    Write-Host "  [OK] Backend listening on port 8000 (PID: $($backendPort.OwningProcess))" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Backend is NOT listening on port 8000" -ForegroundColor Red
}

if ($frontendPort) {
    Write-Host "  [OK] Frontend listening on port 5173 (PID: $($frontendPort.OwningProcess))" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Frontend is NOT listening on port 5173" -ForegroundColor Red
}

# 2. Check Cloudflare Tunnel
Write-Host "`n[2/5] Checking Cloudflare Tunnel..." -ForegroundColor Yellow
$cfProc = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($cfProc) {
    Write-Host "  [OK] Cloudflared process active (PID: $($cfProc.Id))" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Cloudflared process not running" -ForegroundColor Yellow
}

# 3. Check Background Daemons
Write-Host "`n[3/5] Checking Background Daemons..." -ForegroundColor Yellow
$keepAwake = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*keep_awake.ps1*" }
$gitSync = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*git_sync.ps1*" }
$serviceDaemon = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*service_daemon.ps1*" }

if ($serviceDaemon) {
    Write-Host "  [OK] Service Daemon Watchdog running (PID: $($serviceDaemon.ProcessId))" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Service Daemon Watchdog not running" -ForegroundColor Yellow
}

if ($keepAwake) {
    Write-Host "  [OK] 24/7 Keep-Awake thread running (PID: $($keepAwake.ProcessId))" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Keep-Awake thread not running" -ForegroundColor Yellow
}

if ($gitSync) {
    Write-Host "  [OK] 60-Second Git Sync daemon running (PID: $($gitSync.ProcessId))" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Git Sync daemon not running" -ForegroundColor Yellow
}

# 4. Check Git Status & Remote Hashes
Write-Host "`n[4/5] Checking Git Status & Remote Sync..." -ForegroundColor Yellow
try {
    git fetch origin main --quiet 2>$null
    $localHash = (git rev-parse HEAD 2>$null).Trim()
    $remoteHash = (git rev-parse origin/main 2>$null).Trim()
    Write-Host "  Local HEAD:  $localHash"
    Write-Host "  Remote main: $remoteHash"
    if ($localHash -eq $remoteHash) {
        Write-Host "  [OK] Up-to-date with GitHub (No pull needed)" -ForegroundColor Green
    } else {
        Write-Host "  [INFO] Remote changes available (Will be pulled by daemon on next cycle)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "  [ERROR] Failed checking git: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Check Windows Startup Entries
Write-Host "`n[5/5] Checking Windows Autostart Registration..." -ForegroundColor Yellow
$startupVbs = [Environment]::GetFolderPath('Startup') + '\Start_SaiBalaji_Server.vbs'
if (Test-Path $startupVbs) {
    Write-Host "  [OK] Startup folder script exists: $startupVbs" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Startup folder script missing!" -ForegroundColor Red
}

$regVal = (Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -ErrorAction SilentlyContinue).SaiBalajiServer
if ($regVal) {
    Write-Host "  [OK] Registry Run Key configured: $regVal" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Registry Run Key missing" -ForegroundColor Yellow
}

# 6. Test HTTP Endpoints
Write-Host "`n--- Testing HTTP Endpoints ---" -ForegroundColor Yellow
try {
    $resBackend = Invoke-WebRequest -Uri "http://localhost:8000/api/products" -UseBasicParsing -TimeoutSec 5
    Write-Host "  [OK] Backend API responded with HTTP $($resBackend.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] Backend API error: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $resFrontend = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
    Write-Host "  [OK] Frontend Server responded with HTTP $($resFrontend.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] Frontend Server error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  Verification Complete!" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
