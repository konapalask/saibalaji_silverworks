import os
import sys
import subprocess

print("========================================================")
print("  Sai Balaji Silverworks Cloudflare Live Tunnel Launcher")
print("========================================================")

workspace_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cloudflared_exe = os.path.join(workspace_dir, "cloudflared.exe")

if os.path.exists(cloudflared_exe):
    print("[*] Launching Cloudflare Live Tunnel on port 5173...")
    subprocess.run([cloudflared_exe, "tunnel", "--url", "http://localhost:5173"])
else:
    print("[*] Launching Cloudflare Tunnel...")
    subprocess.run(["cloudflared", "tunnel", "--url", "http://localhost:5173"], shell=True)
