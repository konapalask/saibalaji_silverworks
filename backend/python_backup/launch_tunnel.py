import os
import sys
import subprocess

print("========================================================")
print("  Sai Balaji Silverworks Cloudflare Live Tunnel Launcher")
print("========================================================")

workspace_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cloudflared_exe = os.path.join(workspace_dir, "cloudflared.exe")

token = "eyJhIjoiMjQ2ZDQxN2Q1YzNkMGRlYTA3NDA4ZDFlYzAyNmMzOGMiLCJ0IjoiNzcxYmFhYzYtZjM2Zi00MzM4LTkzN2YtODY1YzVkNGY3YTJkIiwicyI6IllXUmtaREJpWldFdFpqVTBZeTAwTTJZeUxXRTRaVEV0TUdZd1pqQTNZVGMxTldVeSJ9"

if os.path.exists(cloudflared_exe):
    print("[*] Launching Cloudflare Named Tunnel (saibalaji.e3di.org)...")
    subprocess.run([cloudflared_exe, "tunnel", "run", "--token", token])
else:
    print("[*] Launching Cloudflare Named Tunnel (saibalaji.e3di.org)...")
    subprocess.run(["cloudflared", "tunnel", "run", "--token", token], shell=True)
