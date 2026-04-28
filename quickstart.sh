#!/bin/bash

# Quick Start Script for Amazon Ads MCP Remote Server
# Run: bash quickstart.sh

set -e

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║        🚀 Amazon Ads MCP Remote Server - Quick Start 🚀         ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "   Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🏗️  Building TypeScript..."
npm run build

echo ""
echo "📝 Setting up environment variables..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your credentials:"
    echo "   1. AMAZON_CLIENT_ID"
    echo "   2. AMAZON_CLIENT_SECRET"
    echo "   3. PUBLIC_URL (or use ngrok)"
    echo ""
    echo "   Edit with: nano .env"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║                    ✅ Setup Complete! ✅                        ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  Edit .env with your Amazon credentials:"
echo "   nano .env"
echo ""
echo "2️⃣  Option A - Use ngrok for quick testing:"
echo "   • In another terminal: ngrok http 3000"
echo "   • Copy the HTTPS URL from ngrok"
echo "   • Update PUBLIC_URL in .env"
echo "   • Run: npm run dev"
echo ""
echo "2️⃣  Option B - Deploy to Render/Railway:"
echo "   • See DEPLOYMENT.md for detailed instructions"
echo ""
echo "3️⃣  Authorize with Amazon Ads:"
echo "   • Visit: https://your-server-url/auth"
echo "   • Sign in and grant permissions"
echo ""
echo "4️⃣  Verify token is valid:"
echo "   • curl https://your-server-url/token-status"
echo ""
echo "5️⃣  Connect to Claude:"
echo "   • Settings > Connectors > Add custom connector"
echo "   • URL: https://your-server-url/mcp"
echo "   • Complete OAuth flow"
echo ""
echo "📚 For more details, see:"
echo "   • README.md - Complete documentation"
echo "   • DEPLOYMENT.md - Deployment options"
echo ""
echo "🎉 Ready to go! Start your server and connect to Claude."
echo ""
