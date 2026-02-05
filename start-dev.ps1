$env:DATABASE_URL="file:./db/custom.db"
$env:Z_AI_API_KEY="demo_key"
$env:Z_AI_BASE_URL="https://api.z.ai/v1"
$env:OPENAI_API_KEY="demo_key"
$env:NEXTAUTH_URL="http://localhost:3000"
$env:NEXTAUTH_SECRET="development_secret_key_change_in_production"
$env:NODE_ENV="development"
$env:NEXT_PUBLIC_APP_URL="http://localhost:3000"

Write-Host "启动飘叔Agent开发服务器..."
Write-Host "访问地址: http://localhost:3000"
Write-Host ""

npm run dev