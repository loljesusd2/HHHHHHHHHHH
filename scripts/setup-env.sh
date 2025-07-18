
#!/bin/bash

# Setup Environment Variables for Beauty GO Deploy
echo "🔧 Beauty GO - Environment Setup"
echo "=================================="

# Check if .env.example exists
if [ ! -f ".env.example" ]; then
    echo "❌ .env.example not found!"
    exit 1
fi

# Create .env from template if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your actual values before deploying!"
    echo ""
    echo "Required variables to update:"
    echo "- DATABASE_URL (your cloud database URL)"
    echo "- NEXTAUTH_URL (your Netlify app URL)" 
    echo "- NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Generate NEXTAUTH_SECRET if openssl is available
if command -v openssl &> /dev/null; then
    echo "🔐 Generated NEXTAUTH_SECRET:"
    openssl rand -base64 32
    echo ""
    echo "Copy this value to your NEXTAUTH_SECRET variable"
else
    echo "⚠️  openssl not found. Generate NEXTAUTH_SECRET manually"
fi

echo "📖 For detailed setup instructions, see:"
echo "- README-NETLIFY-DEPLOY.md (complete guide)"
echo "- deploy-instructions.md (quick reference)"
