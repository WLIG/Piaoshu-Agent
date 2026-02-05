Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Piaoshu Agent Startup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies, please wait..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "Dependencies already exist, skipping..." -ForegroundColor Green
}
Write-Host ""

Write-Host "[2/4] Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to generate Prisma Client!" -ForegroundColor Red
    exit 1
}
Write-Host "Prisma Client generated successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "[3/4] Pushing database schema..." -ForegroundColor Yellow
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to push database schema!" -ForegroundColor Red
    exit 1
}
Write-Host "Database initialized successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "[4/4] Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Server starting..." -ForegroundColor Cyan
Write-Host "URL: http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npm run dev
