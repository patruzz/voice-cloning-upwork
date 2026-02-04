#!/bin/bash
# Final video generator with cloned voice
# No automation banner, professional quality

set -e

VIDEO_NUM=$1
REPO_URL=$2
NARRATION=$3
OUTPUT=$4

echo "🎬 Generating Video ${VIDEO_NUM}/3"
echo "📹 Repo: $REPO_URL"
echo "📝 Narration: $NARRATION"
echo ""

# Step 1: Generate audio with cloned voice
echo "🎙️ Cloning voice..."
AUDIO_FILE="${OUTPUT/.mp4/.wav}"

python3 << EOF
from TTS.api import TTS
import sys

try:
    print("Loading XTTS-v2 model...")
    tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
    
    with open("$NARRATION", "r") as f:
        text = f.read()
    
    print("Generating audio with cloned voice...")
    tts.tts_to_file(
        text=text,
        file_path="$AUDIO_FILE",
        speaker_wav="voice-sample.wav",
        language="en",
        split_sentences=True
    )
    
    print("✅ Audio generated!")
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
EOF

if [ ! -f "$AUDIO_FILE" ]; then
    echo "❌ Audio generation failed"
    exit 1
fi

# Step 2: Record video (60s)
echo "📹 Recording browser session..."
VIDEO_TEMP="${OUTPUT/.mp4/-video-only.mp4}"

# Start Xvfb if not running
export DISPLAY=:99
if ! pgrep Xvfb > /dev/null; then
    Xvfb :99 -screen 0 1920x1080x24 &
    sleep 2
fi

# Record with ffmpeg
ffmpeg -video_size 1920x1080 -framerate 30 -f x11grab -i :99.0 \
    -t 60 -c:v libx264 -preset fast -crf 22 "$VIDEO_TEMP" -y &
FFMPEG_PID=$!

# Open Chrome without automation banner
google-chrome \
    --no-sandbox \
    --disable-setuid-sandbox \
    --disable-dev-shm-usage \
    --disable-infobars \
    --disable-blink-features=AutomationControlled \
    --exclude-switches=enable-automation \
    --disable-extensions \
    --display=:99 \
    "$REPO_URL" &
CHROME_PID=$!

# Wait for recording
sleep 60

# Cleanup
kill $FFMPEG_PID 2>/dev/null || true
kill $CHROME_PID 2>/dev/null || true

# Step 3: Combine video + audio
echo "🎬 Combining video and audio..."
ffmpeg -i "$VIDEO_TEMP" -i "$AUDIO_FILE" \
    -c:v copy -c:a aac -b:a 192k -shortest "$OUTPUT" -y

# Cleanup temp files
rm "$VIDEO_TEMP" "$AUDIO_FILE"

# Verify
if [ -f "$OUTPUT" ]; then
    SIZE=$(du -h "$OUTPUT" | cut -f1)
    DUR=$(ffprobe -v error -show_entries format=duration \
        -of default=noprint_wrappers=1:nokey=1 "$OUTPUT" | cut -d. -f1)
    
    echo ""
    echo "✅ Video ${VIDEO_NUM}/3 complete!"
    echo "   File: $OUTPUT"
    echo "   Size: $SIZE"
    echo "   Duration: ${DUR}s"
    echo ""
else
    echo "❌ Video generation failed"
    exit 1
fi
