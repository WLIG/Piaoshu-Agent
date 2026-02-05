$ErrorActionPreference = "Continue"

Write-Host "Cleaning .next directory..."
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}

Write-Host "Starting build..."
Write-Host ""

$output = & npx next build 2>&1 | Out-String

Write-Host $output

$output | Out-File -FilePath "build-log.txt" -Encoding UTF8

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build SUCCESS!"
} else {
    Write-Host "Build FAILED! Exit code: $LASTEXITCODE"
    Write-Host "Log saved to build-log.txt"
}
