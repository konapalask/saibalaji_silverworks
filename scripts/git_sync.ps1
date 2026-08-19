# Sai Balaji Silverworks - Bulletproof Git Auto-Sync Daemon (60s)
# Automatically syncs with origin/main on GitHub and builds frontend seamlessly.

$workspace = "D:\server"
Set-Location $workspace

$gitExe = "$workspace\bin\git\cmd\git.exe"
if (-not (Test-Path $gitExe)) {
    $gitExe = (Get-Command git -ErrorAction SilentlyContinue).Source
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Sai Balaji Silverworks - Git Auto-Sync Daemon (60s)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "[Sync] Actively monitoring branch 'origin/main' every 60s..." -ForegroundColor Gray

while ($true) {
    try {
        # 1. Fetch remote silently
        & $gitExe fetch origin main --quiet 2>$null
        
        $localHash = (& $gitExe rev-parse HEAD).Trim()
        $remoteHash = (& $gitExe rev-parse origin/main).Trim()

        if ($localHash -ne $remoteHash) {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            Write-Host "[$timestamp] [UPDATE DETECTED] New commit on GitHub: $remoteHash" -ForegroundColor Yellow
            
            # 2. Get list of modified files
            $diffFiles = (& $gitExe diff --name-only $localHash $remoteHash 2>$null)

            # 3. Force clean sync to match GitHub exactly (zero conflict halts)
            & $gitExe reset --hard origin/main --quiet

            # 4. Check if package.json in backend or frontend was modified
            if ($diffFiles -match "backend/package\.json") {
                Write-Host "[$timestamp] Updating backend dependencies..." -ForegroundColor Magenta
                cmd.exe /c "set PATH=C:\Program Files\nodejs;%PATH% && cd /d D:\server\backend && npm install"
            }
            if ($diffFiles -match "frontend/package\.json") {
                Write-Host "[$timestamp] Updating frontend dependencies..." -ForegroundColor Magenta
                cmd.exe /c "set PATH=C:\Program Files\nodejs;%PATH% && cd /d D:\server\frontend && npm install"
            }

            # 5. Automatically build frontend if any frontend UI files changed
            if ($diffFiles -match "frontend/") {
                Write-Host "[$timestamp] Compiling updated frontend UI bundle..." -ForegroundColor Magenta
                cmd.exe /c "set PATH=C:\Program Files\nodejs;%PATH% && cd /d D:\server\frontend && npm run build"
            }

            Write-Host "[$timestamp] [SUCCESS] Site updated live to commit: $remoteHash" -ForegroundColor Green
        }
    } catch {
        # Catch and continue on transient network errors
    }

    Start-Sleep -Seconds 60
}
