# Sai Balaji Silverworks - 24/7 Service Daemon & Self-Healing Watchdog
# Keeps Backend (8000), Frontend (5173), Cloudflare Tunnel, and Git Sync running permanently.

$workspace = "D:\server"
Set-Location $workspace

$nodePath = "C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;$workspace\bin\git\cmd;$env:LOCALAPPDATA\Programs\nodejs;$env:APPDATA\npm"
$env:PATH = "$nodePath;$env:PATH"

# Prevent Sleep
powercfg /change standby-timeout-ac 0 2>$null
powercfg /change hibernate-timeout-ac 0 2>$null
powercfg /change disk-timeout-ac 0 2>$null

# Start Keep-Awake thread
Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$workspace\scripts\keep_awake.ps1`"" -WindowStyle Hidden

# Start Git Auto-Sync (60s)
Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$workspace\scripts\git_sync.ps1`"" -WindowStyle Hidden

# Read Cloudflare Tunnel Token
$token = "eyJhIjoiMjQ2ZDQxN2Q1YzNkMGRlYTA3NDA4ZDFlYzAyNmMzOGMiLCJ0IjoiNzcxYmFhYzYtZjM2Zi00MzM4LTkzN2YtODY1YzVkNGY3YTJkIiwicyI6IllXUmtaREJpWldFdFpqVTBZeTAwTTJZeUxXRTRaVEV0TUdZd1pqQTNZVGMxTldVeSJ9"

while ($true) {
    try {
        # 1. Check Backend on port 8000
        $backendActive = (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue)
        if (-not $backendActive) {
            Start-Process cmd -ArgumentList "/c `"set PATH=$nodePath;%PATH% && cd /d `"$workspace\backend`" && node server.js`"" -WindowStyle Hidden
            Start-Sleep -Seconds 2
        }

        # 2. Check Production Frontend on port 5173
        $frontendActive = (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue)
        if (-not $frontendActive) {
            Start-Process cmd -ArgumentList "/c `"set PATH=$nodePath;%PATH% && cd /d `"$workspace\backend`" && node serve_frontend.js`"" -WindowStyle Hidden
            Start-Sleep -Seconds 2
        }

        # 3. Check Cloudflare Tunnel
        $cfProc = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
        if (-not $cfProc) {
            Start-Process "$workspace\cloudflared.exe" -ArgumentList "tunnel run --token $token" -WindowStyle Hidden
        }
    } catch {
        # Ignore and retry
    }

    Start-Sleep -Seconds 4
}
