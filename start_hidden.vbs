' Sai Balaji Silverworks - 100% Invisible 24/7 Auto-Start Launcher
' Automatically launches Service Daemon Watchdog on boot in detached mode.

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

workspaceDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = workspaceDir

psPath = WshShell.ExpandEnvironmentStrings("%SystemRoot%") & "\System32\WindowsPowerShell\v1.0\powershell.exe"
daemonScript = workspaceDir & "\scripts\service_daemon.ps1"

' Detach process completely in background with zero window
launchCmd = "cmd.exe /c start /b """" """ & psPath & """ -NoProfile -ExecutionPolicy Bypass -File """ & daemonScript & """"
WshShell.Run launchCmd, 0, False
