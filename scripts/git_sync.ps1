# Sai Balaji Silverworks - 30-Second Conditional Git Auto-Sync Daemon
# Only pulls from Git when new commits are pushed to remote origin/main.
# Automatically rebuilds frontend, updates dependencies, and hot-reloads backend and frontend servers!

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$workspace = (Resolve-Path "$scriptDir\..").Path
Set-Location $workspace

# Ensure standard Node.js, Git, and NPM paths
$nodePath = "C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;$workspace\bin\git\cmd;$env:LOCALAPPDATA\Programs\nodejs;$env:APPDATA\npm"
$env:PATH = "$nodePath;$env:PATH"

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

function Restart-BackendServer {
    Write-SyncLog "Restarting Backend Server on port 8000..." "RELOAD"
    $conn = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
    Start-Process cmd.exe -ArgumentList @("/c", "set PATH=$nodePath;%PATH% && cd /d `"$workspace\backend`" && node server.js") -WindowStyle Hidden
    Start-Sleep -Seconds 2
}

function Restart-FrontendServer {
    Write-SyncLog "Restarting Frontend Production Server on port 5173..." "RELOAD"
    $conn = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
    Start-Process cmd.exe -ArgumentList @("/c", "set PATH=$nodePath;%PATH% && cd /d `"$workspace\backend`" && node serve_frontend.js") -WindowStyle Hidden
    Start-Sleep -Seconds 2
}

Write-SyncLog "Git Auto-Sync Daemon started (Checking remote every 30s in $workspace)"

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

            # 1. Protect & snapshot all JSON data files before git reset (excluding package.json/package-lock.json)
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

            # 2. Pull changes cleanly (matching origin/main)
            & $gitExe reset --hard origin/main --quiet 2>$null

            # 3. Restore any protected JSON data files if modified or removed by git reset
            foreach ($kv in $snapshots.GetEnumerator()) {
                $relPath = $kv.Key
                $savedContent = $kv.Value
                $targetPath = Join-Path $workspace $relPath
                $safeBackupName = $relPath -replace "[\\/]", "__"
                $backupPath = Join-Path $backupDir $safeBackupName

                if (-not (Test-Path $targetPath)) {
                    Write-SyncLog "Restoring protected JSON file deleted during git pull: $relPath" "WARN"
                    $targetDir = Split-Path -Parent $targetPath
                    if (-not (Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force | Out-Null }
                    Copy-Item -Path $backupPath -Destination $targetPath -Force
                } else {
                    $currentContent = Get-Content -Path $targetPath -Raw
                    if ($currentContent -ne $savedContent) {
                        Write-SyncLog "Restoring protected JSON file modified during git pull: $relPath" "WARN"
                        Set-Content -Path $targetPath -Value $savedContent -NoNewline
                    }
                }
            }

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

            # Rebuild frontend UI production bundle
            Write-SyncLog "Rebuilding frontend UI production bundle..." "BUILD"
            $buildRes = cmd.exe /c "cd /d `"$workspace\frontend`" && npm run build" 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-SyncLog "npm run build warned - executing fallback vite build..." "WARN"
                cmd.exe /c "cd /d `"$workspace\frontend`" && npx vite build" 2>&1 | Out-Null
            }

            # Restart backend and frontend servers
            Restart-BackendServer
            Restart-FrontendServer

            Write-SyncLog "Successfully synced and updated to commit $remoteHash" "SUCCESS"
        }
    } catch {
        Write-SyncLog "Transient error checking git: $($_.Exception.Message)" "WARN"
    }

    Start-Sleep -Seconds 30
}
