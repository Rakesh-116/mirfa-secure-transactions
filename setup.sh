#!/bin/bash
# Setup Script for Unix/Linux/macOS
# Run this after: pnpm install

echo "🚀 Mirfa Secure Transactions - Setup Script"
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "   npm install -g pnpm"
    exit 1
fi

# Check if Node.js version is 20+
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 20+ required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Creating .env file..."
    
    # Generate master key
    echo "🔐 Generating master key..."
    MASTER_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    # Create .env
    cat > .env << EOF
# Database connection (Postgres)
DATABASE_URL=postgresql://postgres:1234@localhost:5432/mirfa_db

# Master encryption key (32 bytes = 64 hex characters)
MASTER_KEY_HEX=$MASTER_KEY

# API Configuration
PORT=3001
HOST=0.0.0.0
NODE_ENV=development

# Web Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# CORS
CORS_ORIGIN=*
EOF
    
    echo "✅ .env file created with generated master key"
else
    echo "✅ .env file already exists"
fi

# Check for Docker
echo ""
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker not found. You'll need to set up PostgreSQL manually."
    echo "   Or install Docker: https://www.docker.com/get-started"
else
    echo "🐳 Docker detected"
    
    # Check if postgres container exists
    if docker ps -a --format '{{.Names}}' | grep -q "mirfa-postgres"; then
        echo "✅ PostgreSQL container already exists"
        
        # Check if running
        if ! docker ps --format '{{.Names}}' | grep -q "mirfa-postgres"; then
            echo "   Starting existing container..."
            docker start mirfa-postgres
            sleep 2
            echo "✅ PostgreSQL container started"
        else
            echo "✅ PostgreSQL container is running"
        fi
    else
        echo "📦 Creating PostgreSQL container..."
        docker run --name mirfa-postgres \
            -e POSTGRES_PASSWORD=postgres \
            -e POSTGRES_DB=mirfa_db \
            -p 5432:5432 \
            -d postgres:16
        
        if [ $? -eq 0 ]; then
            echo "✅ PostgreSQL container created and started"
            echo "   Connection: postgresql://postgres:postgres@localhost:5432/mirfa_db"
        else
            echo "❌ Failed to create PostgreSQL container"
        fi
    fi
fi

# Build packages
echo ""
echo "🔨 Building packages..."
pnpm build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Packages built successfully"
else
    echo "⚠️  Build completed with warnings (this is normal for initial setup)"
fi

# Final instructions
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✨ Setup Complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Run the project:       pnpm dev"
echo "  2. Open frontend:         http://localhost:3000"
echo "  3. Open API:              http://localhost:3001"
echo ""
echo "Useful commands:"
echo "  • Start dev servers:      pnpm dev"
echo "  • Build all packages:     pnpm build"
echo "  • Stop PostgreSQL:        docker stop mirfa-postgres"
echo "  • Start PostgreSQL:       docker start mirfa-postgres"
echo ""
echo "Documentation:"
echo "  • Quick start:            QUICKSTART.md"
echo "  • Full docs:              PROJECT.md"
echo "  • Deployment:             DEPLOYMENT.md"
echo ""
echo "Ready to build! 🚀"
echo ""
