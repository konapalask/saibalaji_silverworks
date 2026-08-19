' Sai Balaji Silverworks - 100% Invisible 24/7 Auto-Start Launcher
' Runs Backend (8000), Frontend (5173), Cloudflare Tunnel, and Git Sync on boot.

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

workspaceDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = workspaceDir

nodePath = "C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;" & workspaceDir & "\bin\git\cmd;" & WshShell.ExpandEnvironmentStrings("%LOCALAPPDATA%\Programs\nodejs") & ";" & WshShell.ExpandEnvironmentStrings("%APPDATA%\npm")

' 1. Set Power to Never Sleep
WshShell.Run "powercfg /change standby-timeout-ac 0", 0, True
WshShell.Run "powercfg /change hibernate-timeout-ac 0", 0, True
WshShell.Run "powercfg /change disk-timeout-ac 0", 0, True

' 2. Free ports if occupied
WshShell.Run "cmd /c ""for /f """"tokens=5"""" %a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /F /PID %a""", 0, True
WshShell.Run "cmd /c ""for /f """"tokens=5"""" %a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do taskkill /F /PID %a""", 0, True
WshShell.Run "taskkill /F /IM cloudflared.exe", 0, True

' 3. Start Keep-Awake thread
WshShell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -File """ & workspaceDir & "\scripts\keep_awake.ps1""", 0, False

' 4. Start Git Auto-Sync (60s)
WshShell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -File """ & workspaceDir & "\scripts\git_sync.ps1""", 0, False

' 5. Start Backend Server (Express on port 8000)
WshShell.Run "cmd.exe /c ""set PATH=" & nodePath & ";%PATH% && cd /d """ & workspaceDir & "\backend"" && node server.js""", 0, False

WScript.Sleep 3000

' 6. Start Production Frontend Server (Port 5173 with proxy to 8000)
WshShell.Run "cmd.exe /c ""set PATH=" & nodePath & ";%PATH% && cd /d """ & workspaceDir & "\backend"" && node serve_frontend.js""", 0, False

WScript.Sleep 3000

' 7. Start Cloudflare Named Tunnel (saibalaji.e3di.org)
cfToken = "eyJhIjoiMjQ2ZDQxN2Q1YzNkMGRlYTA3NDA4ZDFlYzAyNmMzOGMiLCJ0IjoiNzcxYmFhYzYtZjM2Zi00MzM4LTkzN2YtODY1YzVkNGY3YTJkIiwicyI6IllXUmtaREJpWldFdFpqVTBZeTAwTTJZeUxXRTRaVEV0TUdZd1pqQTNZVGMxTldVeSJ9"
WshShell.Run """" & workspaceDir & "\cloudflared.exe"" tunnel run --token " & cfToken, 0, False
