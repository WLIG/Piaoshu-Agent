Write-Host "Starting Next.js development server..." -ForegroundColor Green
Write-Host "Working directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

try {
    npm run dev 2>&1 | Tee-Object -FilePath "dev-server-log.txt"
} catch {
    Write-Host "Error occurred: $_" -ForegroundColor Red
    $_ | Out-File -FilePath "error-log.txt"
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
