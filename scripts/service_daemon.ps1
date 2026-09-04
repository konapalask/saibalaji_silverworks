# Sai Balaji Silverworks - 24/7 Service Daemon & Self-Healing Watchdog
# Keeps Backend (8000), Frontend (5173), Cloudflare Tunnel, and Git Sync running permanently.

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$workspace = (Resolve-Path "$scriptDir\..").Path
Set-Location $workspace

# Ensure logs directory exists
$logDir = "$workspace\logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}
$logFile = "$logDir\service_daemon.log"

function Write-DaemonLog {
    param([string]$Message, [string]$Level = "INFO")
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $formatted = "[$ts] [$Level] $Message"
    try {
        Add-Content -Path $logFile -Value $formatted -ErrorAction SilentlyContinue
    } catch {}
}

Write-DaemonLog "Service Daemon started successfully in $workspace"

$nodePath = "C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;$workspace\bin\git\cmd;$env:LOCALAPPDATA\Programs\nodejs;$env:APPDATA\npm"
$env:PATH = "$nodePath;$env:PATH"

# Prevent Sleep / Hibernate on AC power
powercfg /change standby-timeout-ac 0 2>$null
powercfg /change hibernate-timeout-ac 0 2>$null
powercfg /change disk-timeout-ac 0 2>$null

# Cloudflare Tunnel Token
$token = "eyJhIjoiMDU4NzM5ZmEzOGM4MzNjMTI4NDYxNmJiYjg4Yjk1MGMiLCJ0IjoiYjNiOGIyOWQtYWExZC00NTEwLTgzODYtMmVkYzYzYWY0MThiIiwicyI6Ik9HTTRZMk5qTnpRdE56UXlNQzAwTTJZd0xXRTNOMk10TXpSa1lXWXpZamsyTW1KbSJ9"

while ($true) {
    try {
        # 1. Keep-Awake Watchdog
        $keepAwakeRunning = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*keep_awake.ps1*" }
        if (-not $keepAwakeRunning) {
            Write-DaemonLog "Starting keep_awake.ps1 background thread..."
            Start-Process powershell.exe -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "$workspace\scripts\keep_awake.ps1") -WindowStyle Hidden
        }

        # 2. Git Auto-Sync Watchdog (60s cycle)
        $gitSyncRunning = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*git_sync.ps1*" }
        if (-not $gitSyncRunning) {
            Write-DaemonLog "Starting git_sync.ps1 background thread..."
            Start-Process powershell.exe -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "$workspace\scripts\git_sync.ps1") -WindowStyle Hidden
        }

        # 3. Backend Watchdog (Port 8000)
        $backendActive = (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue)
        if (-not $backendActive) {
            Write-DaemonLog "Backend on port 8000 not active. Spawning node server.js..." "WARN"
            Start-Process cmd.exe -ArgumentList @("/c", "set PATH=$nodePath;%PATH% && cd /d `"$workspace\backend`" && node server.js") -WindowStyle Hidden
            Start-Sleep -Seconds 2
        }

        # 4. Frontend Watchdog (Port 5173)
        $frontendActive = (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue)
        if (-not $frontendActive -or -not (Test-Path "$workspace\frontend\dist\index.html")) {
            if (-not (Test-Path "$workspace\frontend\dist\index.html")) {
                Write-DaemonLog "Frontend dist/index.html missing. Building UI..." "WARN"
                cmd.exe /c "cd /d `"$workspace\frontend`" && npx --yes vite build" 2>&1 | Out-Null
            }
            Write-DaemonLog "Frontend on port 5173 restarting/spawning..." "WARN"
            Start-Process cmd.exe -ArgumentList @("/c", "set PATH=$nodePath;%PATH% && cd /d `"$workspace\backend`" && node serve_frontend.js") -WindowStyle Hidden
            Start-Sleep -Seconds 2
        }

        # 5. Cloudflare Tunnel Watchdog
        $cfProc = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
        if (-not $cfProc) {
            Write-DaemonLog "Cloudflare tunnel not running. Spawning cloudflared.exe..." "WARN"
            $cfExePath = if (Test-Path "$workspace\cloudflared.exe") { "$workspace\cloudflared.exe" } else { "cloudflared.exe" }
            Start-Process -FilePath $cfExePath -ArgumentList @("tunnel", "run", "--token", $token) -WindowStyle Hidden
            Start-Sleep -Seconds 2
        }
    } catch {
        Write-DaemonLog "Exception in daemon loop: $($_.Exception.Message)" "ERROR"
    }

    Start-Sleep -Seconds 3
}
