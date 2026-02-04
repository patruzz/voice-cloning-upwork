#!/bin/bash
# Quick voice cloning on molt - execute when internet is back

set -e

echo "🚀 MOLT QUICK SETUP - Voice Cloning"
echo ""

# Update and install
echo "📦 Installing dependencies..."
sudo apt-get update -qq
sudo apt-get install -y python3-pip ffmpeg git curl wget

# Install TTS (fast on GCP network)
echo "🎙️ Installing Coqui TTS..."
pip3 install --upgrade pip --quiet
pip3 install TTS soundfile librosa --quiet

# Download XTTS model (will cache for future use)
echo "📥 Downloading XTTS-v2 model..."
python3 -c "from TTS.api import TTS; TTS('tts_models/multilingual/multi-dataset/xtts_v2')"

echo ""
echo "✅ MOLT READY FOR VOICE CLONING"
echo ""
echo "Next: Upload voice sample + narration → Generate video"
