#!/bin/bash

echo "🏨 Hotel Room Reservation System - Deployment Script"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Build frontend
echo "🔨 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build frontend"
    exit 1
fi

cd ..

echo "✅ Build completed successfully!"
echo ""
echo "🚀 To start the application:"
echo "   npm start"
echo ""
echo "🌐 The application will be available at:"
echo "   http://localhost:3001"
echo ""
echo "📱 Frontend will be served from the backend at the same URL"
echo ""
echo "🧪 To test the API endpoints:"
echo "   curl http://localhost:3001/api/rooms"
echo "   curl -X POST -H 'Content-Type: application/json' -d '{\"numRooms\": 3}' http://localhost:3001/api/book"
echo ""
echo "✨ Hotel Room Reservation System is ready!"
