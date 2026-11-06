# KrishiSync - One-Click Local HTTP Server for Hackathon Demo
param(
    [int]$Port = 8080
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  🌱 KrishiSync (SoilSathi) - Local Web Server Starting   " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Serving files from: $scriptDir" -ForegroundColor Cyan
Write-Host "Local URL: http://localhost:$Port" -ForegroundColor Yellow

# Launch browser
Start-Process "http://localhost:$Port"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")

try {
    $listener.Start()
} catch {
    Write-Host "Port $Port is in use or blocked. Opening file directly in browser..." -ForegroundColor Yellow
    Start-Process "$scriptDir\index.html"
    exit
}

Write-Host "Server listening on http://localhost:$Port/ (Press Ctrl+C to stop)..." -ForegroundColor White

$mimeMap = @{
    ".html" = "text/html"
    ".css"  = "text/css"
    ".js"   = "application/javascript"
    ".json" = "application/json"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawUrl = $request.Url.LocalPath
        if ($rawUrl -eq "/" -or [string]::IsNullOrEmpty($rawUrl)) {
            $rawUrl = "/index.html"
        }

        $filePath = Join-Path $scriptDir $rawUrl.TrimStart("/").Replace("/", "\")

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = "application/octet-stream"
            if ($mimeMap.ContainsKey($ext)) {
                $mime = $mimeMap[$ext]
            }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($notFoundBytes, 0, $notFoundBytes.Length)
        }
        $response.Close()
    } catch {
        # Listener stopped or interrupted
        break
    }
}
$listener.Stop()
