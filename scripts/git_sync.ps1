# Sai Balaji Silverworks - 60-Second Conditional Git Auto-Sync Daemon
# Only pulls from Git when new commits are pushed to remote origin/main.

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$workspace = (Resolve-Path "$scriptDir\..").Path
Set-Location $workspace

# Ensure standard Node.js, Git, and NPM paths
$env:PATH = "C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;$workspace\bin\git\cmd;$env:LOCALAPPDATA\Programs\nodejs;$env:APPDATA\npm;$env:PATH"

$gitExe = "git.exe"
if (Test-Path "$workspace\bin\git\cmd\git.exe") {
    $gitExe = "$workspace\bin\git\cmd\git.exe"
}

# Create logs directory if it doesn't exist
$logDir = "$workspace\logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}
$logFile = "$logDir\git_sync.log"

function Write-SyncLog {
    param([string]$Message, [string]$Level = "INFO")
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $formatted = "[$ts] [$Level] $Message"
    Write-Host $formatted
    try {
        Add-Content -Path $logFile -Value $formatted -ErrorAction SilentlyContinue
        # Trim log if larger than 2MB
        if ((Get-Item $logFile -ErrorAction SilentlyContinue).Length -gt 2MB) {
            $lines = Get-Content $logFile -Tail 500
            Set-Content -Path $logFile -Value $lines
        }
    } catch {}
}

Write-SyncLog "Git Auto-Sync Daemon started (Checking remote every 60s in $workspace)"

while ($true) {
    try {
        # 1. Fetch remote silently to check for new commits
        & $gitExe fetch origin main --quiet 2>$null
        
        $localHash = ""
        $remoteHash = ""

        try {
            $localHash = (& $gitExe rev-parse HEAD 2>$null).Trim()
            $remoteHash = (& $gitExe rev-parse origin/main 2>$null).Trim()
        } catch {}

        # 2. ONLY pull if new changes were pushed to GitHub
        if ($localHash -and $remoteHash -and ($localHash -ne $remoteHash)) {
            Write-SyncLog "UPDATE DETECTED: Remote commit $remoteHash differs from local $localHash" "UPDATE"
            
            # Identify which files changed
            $diffFiles = (& $gitExe diff --name-only $localHash $remoteHash 2>$null)

            # Pull changes cleanly (matching origin/main)
            & $gitExe reset --hard origin/main --quiet 2>$null

            # Check if backend dependencies changed
            if ($diffFiles -match "backend/package\.json") {
                Write-SyncLog "Updating backend dependencies (npm install)..." "BUILD"
                cmd.exe /c "cd /d `"$workspace\backend`" && npm install" 2>&1 | Out-Null
            }

            # Check if frontend dependencies changed
            if ($diffFiles -match "frontend/package\.json") {
                Write-SyncLog "Updating frontend dependencies (npm install)..." "BUILD"
                cmd.exe /c "cd /d `"$workspace\frontend`" && npm install" 2>&1 | Out-Null
            }

            # Check if frontend files changed -> rebuild UI bundle
            if ($diffFiles -match "^frontend/") {
                Write-SyncLog "Rebuilding frontend UI production bundle..." "BUILD"
                cmd.exe /c "cd /d `"$workspace\frontend`" && npm run build" 2>&1 | Out-Null
            }

            # Check if backend files changed -> restart backend server smoothly
            if ($diffFiles -match "^backend/") {
                Write-SyncLog "Backend code updated - restarting backend server on port 8000..." "RELOAD"
                $backendConn = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
                if ($backendConn) {
                    Stop-Process -Id $backendConn.OwningProcess -Force -ErrorAction SilentlyContinue
                }
            }

            Write-SyncLog "Successfully synced and updated to commit $remoteHash" "SUCCESS"
        }
    } catch {
        Write-SyncLog "Transient error checking git: $($_.Exception.Message)" "WARN"
    }

    Start-Sleep -Seconds 60
}
