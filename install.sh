#!/bin/bash
# Quick install script for voice cloning system

echo "🚀 Installing Voice Cloning System..."

# System dependencies
echo "📦 Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y ffmpeg xvfb fluxbox python3-pip espeak google-chrome-stable

# Python packages
echo "🐍 Installing Python packages..."
pip3 install -r requirements.txt

# Node packages
echo "📦 Installing Node packages..."
npm install

# Create directories
echo "📁 Creating directories..."
mkdir -p narrations output

# Setup env
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️ Edit .env file with your Telegram bot token"
fi

echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your Telegram bot token (or skip if not using bot)"
echo "2. Place your voice sample as voice-sample.wav (or use telegram bot)"
echo "3. Run: node generate-video.js --all"
