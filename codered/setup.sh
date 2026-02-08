#!/bin/bash

echo "🐛 Setting up CodeRed..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "⚙️  Creating .env.local..."
    echo "NEXT_PUBLIC_SOCKET_URL=http://localhost:3000" > .env.local
fi

echo "✅ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
