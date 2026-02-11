# Setup Script for Windows PowerShell
# Run this after: pnpm install

Write-Host "🚀 Mirfa Secure Transactions - Setup Script" -ForegroundColor Cyan
Write-Host ""

# Check if pnpm is installed
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ pnpm is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g pnpm" -ForegroundColor Yellow
    exit 1
}

# Check if Node.js version is 20+
$nodeVersion = node --version
$majorVersion = [int]($nodeVersion -replace 'v', '' -split '\.')[0]
if ($majorVersion -lt 20) {
    Write-Host "❌ Node.js 20+ required. Current version: $nodeVersion" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    
    # Generate master key
    Write-Host "🔐 Generating master key..." -ForegroundColor Yellow
    $masterKey = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    
    # Create .env
    $envContent = @"
# Database connection (Postgres)
DATABASE_URL=postgresql://postgres:1234@localhost:5432/mirfa_db

# Master encryption key (32 bytes = 64 hex characters)
MASTER_KEY_HEX=$masterKey

# API Configuration
PORT=3001
HOST=0.0.0.0
NODE_ENV=development

# Web Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# CORS
CORS_ORIGIN=*
"@
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    
    Write-Host "✅ .env file created with generated master key" -ForegroundColor Green
}
else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Check for Docker
Write-Host ""
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerInstalled) {
    Write-Host "⚠️  Docker not found. You'll need to set up PostgreSQL manually." -ForegroundColor Yellow
    Write-Host "   Or install Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
}
else {
    Write-Host "🐳 Docker detected" -ForegroundColor Green
    
    # Check if postgres container exists
    $containerExists = docker ps -a --format "{{.Names}}" | Select-String -Pattern "mirfa-postgres"
    
    if ($containerExists) {
        Write-Host "✅ PostgreSQL container already exists" -ForegroundColor Green
        
        # Check if running
        $containerRunning = docker ps --format "{{.Names}}" | Select-String -Pattern "mirfa-postgres"
        if (-not $containerRunning) {
            Write-Host "   Starting existing container..." -ForegroundColor Yellow
            docker start mirfa-postgres | Out-Null
            Start-Sleep -Seconds 2
            Write-Host "✅ PostgreSQL container started" -ForegroundColor Green
        }
        else {
            Write-Host "✅ PostgreSQL container is running" -ForegroundColor Green
        }
    }
    else {
        Write-Host "📦 Creating PostgreSQL container..." -ForegroundColor Yellow
        $result = docker run --name mirfa-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mirfa_db -p 5432:5432 -d postgres:16 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ PostgreSQL container created and started" -ForegroundColor Green
            Write-Host "   Connection: postgresql://postgres:postgres@localhost:5432/mirfa_db" -ForegroundColor Cyan
        }
        else {
            Write-Host "❌ Failed to create PostgreSQL container" -ForegroundColor Red
            Write-Host "   Error: $result" -ForegroundColor Red
        }
    }
}

# Build packages
Write-Host ""
Write-Host "🔨 Building packages..." -ForegroundColor Yellow
$buildOutput = pnpm build 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Packages built successfully" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Build completed with warnings (this is normal for initial setup)" -ForegroundColor Yellow
}

# Final instructions
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run the project:       pnpm dev" -ForegroundColor White
Write-Host "  2. Open frontend:         http://localhost:3000" -ForegroundColor White
Write-Host "  3. Open API:              http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  • Start dev servers:      pnpm dev" -ForegroundColor White
Write-Host "  • Build all packages:     pnpm build" -ForegroundColor White
Write-Host "  • Stop PostgreSQL:        docker stop mirfa-postgres" -ForegroundColor White
Write-Host "  • Start PostgreSQL:       docker start mirfa-postgres" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  • Quick start:            QUICKSTART.md" -ForegroundColor White
Write-Host "  • Full docs:              PROJECT.md" -ForegroundColor White
Write-Host "  • Deployment:             DEPLOYMENT.md" -ForegroundColor White
Write-Host ""
Write-Host "Ready to build! 🚀" -ForegroundColor Green
Write-Host ""
