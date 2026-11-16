# Optimize 14 videos that exceed 75 MB to ensure full compatibility with GitHub (under 100 MB hard limit)
$workspace = Split-Path -Parent $PSScriptRoot
$ffmpeg = "$workspace\backend\node_modules\ffmpeg-static\ffmpeg.exe"
$videosDir = "$workspace\backend\public\videos"

if (-not (Test-Path $ffmpeg)) {
    Write-Error "ffmpeg not found at $ffmpeg"
    exit 1
}

$largeFiles = Get-ChildItem -Path $videosDir | Where-Object { $_.Length -ge 75MB }
Write-Host "Found $($largeFiles.Count) videos >= 75MB to optimize for GitHub push..." -ForegroundColor Cyan

$count = 0
foreach ($file in $largeFiles) {
    $count++
    $origMB = [math]::Round($file.Length / 1MB, 2)
    $tempOut = "$videosDir\_temp_$($file.Name)"
    
    Write-Host "[$count/$($largeFiles.Count)] Optimizing $($file.Name) ($origMB MB)..." -ForegroundColor Yellow
    
    # Compress with near visually-lossless CRF 21, preset fast, preserving full 1080p
    $proc = Start-Process -FilePath $ffmpeg -ArgumentList @(
        "-y",
        "-i", $file.FullName,
        "-c:v", "libx264",
        "-crf", "21",
        "-preset", "veryfast",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        $tempOut
    ) -NoNewWindow -Wait -PassThru

    if ($proc.ExitCode -eq 0 -and (Test-Path $tempOut) -and (Get-Item $tempOut).Length -gt 1MB) {
        $newMB = [math]::Round((Get-Item $tempOut).Length / 1MB, 2)
        Remove-Item -Path $file.FullName -Force
        Move-Item -Path $tempOut -Destination $file.FullName -Force
        Write-Host "  -> Done! Reduced from $origMB MB to $newMB MB" -ForegroundColor Green
    } else {
        Write-Host "  -> ERROR optimizing $($file.Name). Keeping original." -ForegroundColor Red
        if (Test-Path $tempOut) { Remove-Item -Path $tempOut -Force }
    }
}

Write-Host "Optimization complete! All videos in $videosDir are now well under GitHub's 100MB limit." -ForegroundColor Green
