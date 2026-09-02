# Sai Balaji Silverworks - 24/7 Live Console Server & Auto-Sync Monitor
# Keeps Backend (8000), Frontend (5173), Cloudflare Tunnel, and Git Sync running with live visible output.
# Automatically pulls new commits from GitHub, rebuilds frontend, and hot-reloads all servers immediately!

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
Write-Host "  Git Auto-Sync:    Active (Checking origin/main every 30 seconds)" -ForegroundColor Cyan
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

function Restart-BackendServer {
    Write-ConsoleLog "Restarting Backend Server (port 8000)..." "RELOAD"
    $conn = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
    Start-Process cmd.exe -ArgumentList @("/c", "title Sai Balaji Backend (8000) && set PATH=$nodePath;%PATH% && cd /d `"$workspace\backend`" && node server.js")
    Start-Sleep -Seconds 2
}

function Restart-FrontendServer {
    Write-ConsoleLog "Restarting Frontend Production Server (port 5173)..." "RELOAD"
    $conn = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
    Start-Process cmd.exe -ArgumentList @("/c", "title Sai Balaji Frontend (5173) && set PATH=$nodePath;%PATH% && cd /d `"$workspace\backend`" && node serve_frontend.js")
    Start-Sleep -Seconds 2
}

# Initial service check & launch
Write-ConsoleLog "Initializing Sai Balaji 24/7 services..." "INFO"

# 1. Backend Service
$backendActive = (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue)
if (-not $backendActive) {
    Restart-BackendServer
} else {
    Write-ConsoleLog "Backend Server is active on port 8000 [OK]" "OK"
}

# 2. Frontend Service
$frontendActive = (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue)
if (-not $frontendActive) {
    Restart-FrontendServer
} else {
    Write-ConsoleLog "Frontend Server is active on port 5173 [OK]" "OK"
}

# 3. Cloudflare Tunnel
$cfProc = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if (-not $cfProc) {
    Write-ConsoleLog "Starting Cloudflare Tunnel for http://saibalaji.e3di.org/..." "BUILD"
    $cfExePath = if (Test-Path "$workspace\cloudflared.exe") { "$workspace\cloudflared.exe" } else { "cloudflared.exe" }
    Start-Process -FilePath $cfExePath -ArgumentList @("tunnel", "run", "--token", $token)
    Start-Sleep -Seconds 2
} else {
    Write-ConsoleLog "Cloudflare Tunnel is running (PID: $($cfProc.Id)) [OK]" "OK"
}

Write-ConsoleLog "All services online! Starting Git Fetch & Health Watchdog..." "SUCCESS"
Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray

$cycleCount = 0

while ($true) {
    $cycleCount++
    try {
        # --- 1. Service Health Watchdog ---
        $bActive = (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue)
        if (-not $bActive) {
            Write-ConsoleLog "Backend port 8000 down! Restarting Node backend..." "WARN"
            Restart-BackendServer
        }

        $fActive = (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue)
        if (-not $fActive) {
            Write-ConsoleLog "Frontend port 5173 down! Restarting frontend server..." "WARN"
            Restart-FrontendServer
        }

        $cProc = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
        if (-not $cProc) {
            Write-ConsoleLog "Cloudflare tunnel down! Restarting cloudflared..." "WARN"
            $cfExePath = if (Test-Path "$workspace\cloudflared.exe") { "$workspace\cloudflared.exe" } else { "cloudflared.exe" }
            Start-Process -FilePath $cfExePath -ArgumentList @("tunnel", "run", "--token", $token) -WindowStyle Hidden
            Start-Sleep -Seconds 2
        }

        # --- 2. Git Fetch & Auto-Sync ---
        $uncommitted = (& $gitExe status --porcelain 2>$null)
        if ($uncommitted) {
            Write-ConsoleLog "Uncommitted local changes detected - auto-syncing to GitHub..." "UPDATE"
            & $gitExe add . 2>$null
            & $gitExe commit -m "Auto-sync local workspace changes" --quiet 2>$null
            & $gitExe push origin main --quiet 2>$null
        }

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
                Write-Host "`n********************************************************************************" -ForegroundColor Magenta
                Write-ConsoleLog "NEW COMMITS DETECTED ON GITHUB! ($shortLocal -> $shortRemote)" "UPDATE"
                Write-Host "********************************************************************************" -ForegroundColor Magenta
                
                # Identify changed files
                $diffFiles = (& $gitExe diff --name-only $localHash $remoteHash 2>$null)

                # 1. Snapshot all protected JSON data files before git reset
                $backupDir = "$workspace\.json_backups"
                if (-not (Test-Path $backupDir)) {
                    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
                }
                $protectedFiles = Get-ChildItem -Path $workspace -Recurse -Filter "*.json" | Where-Object {
                    $_.FullName -notlike "*node_modules*" -and $_.Name -ne "package.json" -and $_.Name -ne "package-lock.json"
                }
                $snapshots = @{}
                foreach ($pFile in $protectedFiles) {
                    $relPath = $pFile.FullName.Substring($workspace.Length + 1)
                    $safeBackupName = $relPath -replace "[\\/]", "__"
                    $backupPath = Join-Path $backupDir $safeBackupName
                    Copy-Item -Path $pFile.FullName -Destination $backupPath -Force
                    $snapshots[$relPath] = Get-Content -Path $pFile.FullName -Raw
                }

                # 2. Pull and reset cleanly to latest remote commit
                Write-ConsoleLog "Pulling latest code from origin/main..." "UPDATE"
                & $gitExe reset --hard origin/main --quiet 2>$null

                # 3. Restore any protected JSON data files if modified or removed by git reset
                foreach ($kv in $snapshots.GetEnumerator()) {
                    $relPath = $kv.Key
                    $savedContent = $kv.Value
                    $targetPath = Join-Path $workspace $relPath
                    $safeBackupName = $relPath -replace "[\\/]", "__"
                    $backupPath = Join-Path $backupDir $safeBackupName

                    if (-not (Test-Path $targetPath)) {
                        Write-ConsoleLog "Restoring protected JSON file deleted during git pull: $relPath" "WARN"
                        $targetDir = Split-Path -Parent $targetPath
                        if (-not (Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force | Out-Null }
                        Copy-Item -Path $backupPath -Destination $targetPath -Force
                    } else {
                        $currentContent = Get-Content -Path $targetPath -Raw
                        if ($currentContent -ne $savedContent) {
                            Write-ConsoleLog "Restoring protected JSON file modified during git pull: $relPath" "WARN"
                            Set-Content -Path $targetPath -Value $savedContent -NoNewline
                        }
                    }
                }

                # Backend dependencies update if package.json changed
                if ($diffFiles -match "backend/package\.json") {
                    Write-ConsoleLog "Backend package.json changed - running npm install in backend..." "BUILD"
                    cmd.exe /c "cd /d `"$workspace\backend`" && npm install" 2>&1 | Out-Null
                }

                # Frontend dependencies update if package.json changed
                if ($diffFiles -match "frontend/package\.json") {
                    Write-ConsoleLog "Frontend package.json changed - running npm install in frontend..." "BUILD"
                    cmd.exe /c "cd /d `"$workspace\frontend`" && npm install" 2>&1 | Out-Null
                }

                # Rebuild frontend production bundle
                Write-ConsoleLog "Rebuilding frontend UI production bundle..." "BUILD"
                $buildOutput = cmd.exe /c "cd /d `"$workspace\frontend`" && npm run build" 2>&1
                if ($LASTEXITCODE -ne 0) {
                    Write-ConsoleLog "npm run build encountered warnings. Running fallback vite build..." "WARN"
                    cmd.exe /c "cd /d `"$workspace\frontend`" && npx vite build" 2>&1 | Out-Null
                }

                # Restart Backend & Frontend Servers so new code and routes take effect immediately
                Restart-BackendServer
                Restart-FrontendServer

                Write-Host "================================================================================" -ForegroundColor Green
                Write-ConsoleLog "SUCCESS: System fully updated and hot-reloaded to commit $shortRemote!" "SUCCESS"
                Write-Host "================================================================================" -ForegroundColor Green
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

    Start-Sleep -Seconds 30
}
