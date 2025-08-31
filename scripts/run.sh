#!/bin/bash

# Medium Clone GraphQL Server Setup and Run Script

echo "🚀 Starting Medium Clone GraphQL Server setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
else
    echo "📦 Dependencies already installed"
fi

# Check if .env file exists, if not copy from .env.example
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from .env.example..."
    cp .env.example .env
fi

# Check if MongoDB is running (try to connect)
echo "🔍 Checking MongoDB connection..."
MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017/medium-clone-graphql"}

# Start MongoDB with Docker if docker-compose.yml exists
if [ -f "docker-compose.yml" ]; then
    echo "🐳 Starting MongoDB with Docker..."
    docker-compose up -d
    sleep 5
else
    echo "ℹ️  No docker-compose.yml found. Make sure MongoDB is running on $MONGODB_URI"
fi

# Start the GraphQL server
echo "🔄 Starting GraphQL server..."
npm start
