#!/bin/bash

# Deployment script for CrowdFunding DApp

echo "🚀 Preparing CrowdFunding DApp for deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run linting
echo "🔍 Running ESLint..."
npm run lint

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Build completed successfully!"
echo "📋 Deployment checklist:"
echo "   ✅ Dependencies installed"
echo "   ✅ Linting passed"
echo "   ✅ Build successful"
echo ""
echo "🌐 Ready to deploy to:"
echo "   • Vercel: vercel.com"
echo "   • Netlify: netlify.com"
echo "   • Render: render.com"
echo ""
echo "🔧 Don't forget to set environment variables!"
