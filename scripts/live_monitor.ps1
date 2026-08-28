# Sai Balaji Silverworks - 24/7 Live Console Server & 60-Second Git Fetch Monitor
# Keeps Backend (8000), Frontend (5173), Cloudflare Tunnel, and Git Sync running with live visible output.

$host.UI.RawUI.WindowTitle = "Sai Balaji Silverworks - Live Server & Git Sync Console"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$workspace = (Resolve-Path "$scriptDir\..").Path
Set-Location $workspace

# Single instance lock: prevent duplicate consoles from running
$currentPid = $PID
$existing = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { 
    $_.ProcessId -ne $currentPid -and $_.CommandLine -like "*live_monitor.ps1*" 
}
if ($existing) {
    Write-Host "Sai Balaji Live Console is already active in another window." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    exit
}

# Stop legacy hidden daemons if any are still lingering
$oldDaemons = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
    $_.ProcessId -ne $currentPid -and (
        $_.CommandLine -like "*service_daemon.ps1*" -or 
        ($_.CommandLine -like "*git_sync.ps1*" -and $_.CommandLine -notlike "*live_monitor*")
    )
}
foreach ($d in $oldDaemons) {
    try { Stop-Process -Id $d.ProcessId -Force -ErrorAction SilentlyContinue } catch {}
}

# Ensure standard Node.js, Git, and NPM paths in environment
$nodePath = "C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;$workspace\bin\git\cmd;$env:LOCALAPPDATA\Programs\nodejs;$env:APPDATA\npm"
$env:PATH = "$nodePath;$env:PATH"

$gitExe = "git.exe"
if (Test-Path "$workspace\bin\git\cmd\git.exe") {
    $gitExe = "$workspace\bin\git\cmd\git.exe"
}

# Cloudflare Tunnel Token
$token = "eyJhIjoiMDU4NzM5ZmEzOGM4MzNjMTI4NDYxNmJiYjg4Yjk1MGMiLCJ0IjoiYjNiOGIyOWQtYWExZC00NTEwLTgzODYtMmVkYzYzYWY0MThiIiwicyI6Ik9HTTRZMk5qTnpRdE56UXlNQzAwTTJZd0xXRTNOMk10TXpSa1lXWXpZamsyTW1KbSJ9"

# Prevent Sleep / Hibernate on AC power
powercfg /change standby-timeout-ac 0 2>$null
powercfg /change hibernate-timeout-ac 0 2>$null
powercfg /change disk-timeout-ac 0 2>$null

# Start Keep-Awake thread if not running
$keepAwakeRunning = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*keep_awake.ps1*" }
if (-not $keepAwakeRunning -and (Test-Path "$workspace\scripts\keep_awake.ps1")) {
    Start-Process powershell.exe -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "$workspace\scripts\keep_awake.ps1") -WindowStyle Hidden
}

Clear-Host
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "         SAI BALAJI SILVERWORKS - 24/7 LIVE SERVER & GIT SYNC CONSOLE           " -ForegroundColor Yellow
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "  Backend API:      http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Frontend Server:  http://localhost:5173" -ForegroundColor White
Write-Host "  Cloudflare Live:  http://saibalaji.e3di.org/" -ForegroundColor Green
Write-Host "  Git Auto-Sync:    Active (Checking origin/main every 60 seconds)" -ForegroundColor Cyan
Write-Host "  Keep-Awake:       Active (Sleep & Hibernate Disabled)" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

function Write-ConsoleLog {
    param([string]$Message, [string]$Level = "INFO")
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = "White"
    switch ($Level) {
        "INFO"    { $color = "Cyan" }
        "FETCH"   { $color = "DarkCyan" }
        "OK"      { $color = "Green" }
        "UPDATE"  { $color = "Magenta" }
        "BUILD"   { $color = "Yellow" }
        "RELOAD"  { $color = "Yellow" }
        "WARN"    { $color = "DarkYellow" }
        "ERROR"   { $color = "Red" }
        "SUCCESS" { $color = "Green" }
    }
    Write-Host "[$ts] " -NoNewline -ForegroundColor Gray
    Write-Host "[$Level] " -NoNewline -ForegroundColor $color
    Write-Host $Message -ForegroundColor $color
}

# Initial service check & launch
Write-ConsoleLog "Initializing Sai Balaji 24/7 services..." "INFO"

# 1. Backend Service
$backendActive = (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue)
if (-not $backendActive) {
    Write-ConsoleLog "Starting Node.js Backend Server on http://localhost:8000..." "BUILD"
    Start-Process cmd.exe -ArgumentList @("/c", "set PATH=$nodePath;%PATH% && cd /d `"$workspace\backend`" && node server.js") -WindowStyle Hidden
    Start-Sleep -Seconds 2
} else {
    Write-ConsoleLog "Backend Server is active on port 8000 [OK]" "OK"
}

# 2. Frontend Service
$frontendActive = (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue)
if (-not $frontendActive) {
    Write-ConsoleLog "Starting Frontend Production Server on http://localhost:5173..." "BUILD"
    Start-Process cmd.exe -ArgumentList @("/c", "set PATH=$nodePath;%PATH% && cd /d `"$workspace\backend`" && node serve_frontend.js") -WindowStyle Hidden
    Start-Sleep -Seconds 2
} else {
    Write-ConsoleLog "Frontend Server is active on port 5173 [OK]" "OK"
}

# 3. Cloudflare Tunnel
$cfProc = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if (-not $cfProc) {
    Write-ConsoleLog "Starting Cloudflare Tunnel for http://saibalaji.e3di.org/..." "BUILD"
    $cfExePath = if (Test-Path "$workspace\cloudflared.exe") { "$workspace\cloudflared.exe" } else { "cloudflared.exe" }
    Start-Process -FilePath $cfExePath -ArgumentList @("tunnel", "run", "--token", $token) -WindowStyle Hidden
    Start-Sleep -Seconds 2
} else {
    Write-ConsoleLog "Cloudflare Tunnel is running (PID: $($cfProc.Id)) [OK]" "OK"
}

Write-ConsoleLog "All services online! Starting 60-second Git Fetch & Health Watchdog..." "SUCCESS"
Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray

$cycleCount = 0

while ($true) {
    $cycleCount++
    try {
        # --- 1. Service Health Watchdog ---
        $bActive = (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue)
        if (-not $bActive) {
            Write-ConsoleLog "Backend port 8000 down! Restarting Node backend..." "WARN"
            Start-Process cmd.exe -ArgumentList @("/c", "set PATH=$nodePath;%PATH% && cd /d `"$workspace\backend`" && node server.js") -WindowStyle Hidden
            Start-Sleep -Seconds 2
        }

        $fActive = (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue)
        if (-not $fActive) {
            Write-ConsoleLog "Frontend port 5173 down! Restarting frontend server..." "WARN"
            Start-Process cmd.exe -ArgumentList @("/c", "set PATH=$nodePath;%PATH% && cd /d `"$workspace\backend`" && node serve_frontend.js") -WindowStyle Hidden
            Start-Sleep -Seconds 2
        }

        $cProc = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
        if (-not $cProc) {
            Write-ConsoleLog "Cloudflare tunnel down! Restarting cloudflared..." "WARN"
            $cfExePath = if (Test-Path "$workspace\cloudflared.exe") { "$workspace\cloudflared.exe" } else { "cloudflared.exe" }
            Start-Process -FilePath $cfExePath -ArgumentList @("tunnel", "run", "--token", $token) -WindowStyle Hidden
            Start-Sleep -Seconds 2
        }

        # --- 2. Git Fetch & Auto-Sync (Every 60 Seconds) ---
        & $gitExe fetch origin main --quiet 2>$null
        
        $localHash = ""
        $remoteHash = ""
        try {
            $localHash = (& $gitExe rev-parse HEAD 2>$null).Trim()
            $remoteHash = (& $gitExe rev-parse origin/main 2>$null).Trim()
        } catch {}

        if ($localHash -and $remoteHash) {
            if ($localHash -ne $remoteHash) {
                $shortLocal = $localHash.Substring(0, [Math]::Min(7, $localHash.Length))
                $shortRemote = $remoteHash.Substring(0, [Math]::Min(7, $remoteHash.Length))
                Write-ConsoleLog "UPDATE DETECTED on GitHub! (Local: $shortLocal -> Remote: $shortRemote)" "UPDATE"
                
                # Identify changed files
                $diffFiles = (& $gitExe diff --name-only $localHash $remoteHash 2>$null)

                # Pull changes
                Write-ConsoleLog "Pulling latest changes from origin/main..." "UPDATE"
                & $gitExe reset --hard origin/main --quiet 2>$null

                # Backend dependencies
                if ($diffFiles -match "backend/package\.json") {
                    Write-ConsoleLog "Updating backend npm packages..." "BUILD"
                    cmd.exe /c "cd /d `"$workspace\backend`" && npm install" 2>&1 | Out-Null
                }

                # Frontend dependencies
                if ($diffFiles -match "frontend/package\.json") {
                    Write-ConsoleLog "Updating frontend npm packages..." "BUILD"
                    cmd.exe /c "cd /d `"$workspace\frontend`" && npm install" 2>&1 | Out-Null
                }

                # Frontend build
                if ($diffFiles -match "^frontend/") {
                    Write-ConsoleLog "Rebuilding frontend UI bundle..." "BUILD"
                    cmd.exe /c "cd /d `"$workspace\frontend`" && npm run build" 2>&1 | Out-Null
                }

                # Backend code update -> reload
                if ($diffFiles -match "^backend/") {
                    Write-ConsoleLog "Restarting backend server on port 8000..." "RELOAD"
                    $backendConn = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
                    if ($backendConn) {
                        Stop-Process -Id $backendConn.OwningProcess -Force -ErrorAction SilentlyContinue
                        Start-Sleep -Seconds 1
                    }
                    Start-Process cmd.exe -ArgumentList @("/c", "set PATH=$nodePath;%PATH% && cd /d `"$workspace\backend`" && node server.js") -WindowStyle Hidden
                }

                Write-ConsoleLog "Successfully synced and updated to commit $shortRemote!" "SUCCESS"
            } else {
                $shortHash = $localHash.Substring(0, [Math]::Min(7, $localHash.Length))
                $bStatus = if ($bActive) { "Backend: UP" } else { "Backend: RESTARTING" }
                $fStatus = if ($fActive) { "Frontend: UP" } else { "Frontend: RESTARTING" }
                $cStatus = if ($cProc) { "Tunnel: UP" } else { "Tunnel: RESTARTING" }
                Write-ConsoleLog "Git Fetch: Up to date (HEAD: $shortHash) | $bStatus | $fStatus | $cStatus" "FETCH"
            }
        } else {
            Write-ConsoleLog "Git Fetch: Checked remote (no new commits) | Cycle #$cycleCount" "FETCH"
        }

    } catch {
        Write-ConsoleLog "Loop Warning: $($_.Exception.Message)" "WARN"
    }

    Start-Sleep -Seconds 60
}
