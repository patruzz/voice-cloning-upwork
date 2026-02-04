#!/bin/bash
# Generate single video

REPO_URL=$1
NARRATION=$2
OUTPUT=$3
DURATION=${4:-60}

echo "🎬 Generando: $OUTPUT"
echo "📹 Repo: $REPO_URL"

# Generate audio
AUDIO_FILE="${OUTPUT/.mp4/-audio.mp3}"
echo "🎙️ Generando audio..."
edge-tts --voice en-US-GuyNeural --file "$NARRATION" --write-media "$AUDIO_FILE"

# Get audio duration
AUDIO_DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUDIO_FILE")
VIDEO_DUR=$(echo "$AUDIO_DUR + 5" | bc | cut -d. -f1)
if [ $VIDEO_DUR -lt $DURATION ]; then
    VIDEO_DUR=$DURATION
fi

echo "⏱️ Audio: ${AUDIO_DUR}s, Video: ${VIDEO_DUR}s"

# Record browser
VIDEO_TEMP="${OUTPUT/.mp4/-video.mp4}"
echo "📹 Grabando navegador..."

# Start Chrome and record
google-chrome --no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --display=:99 "$REPO_URL" &
CHROME_PID=$!
sleep 5

ffmpeg -video_size 1920x1080 -framerate 30 -f x11grab -i :99.0 -t $VIDEO_DUR -c:v libx264 -preset fast -crf 22 "$VIDEO_TEMP" -y

kill $CHROME_PID 2>/dev/null

# Combine
echo "🎬 Combinando video y audio..."
ffmpeg -i "$VIDEO_TEMP" -i "$AUDIO_FILE" -c:v copy -c:a aac -b:a 192k -shortest "$OUTPUT" -y

# Cleanup
rm "$VIDEO_TEMP" "$AUDIO_FILE"

echo "✅ $OUTPUT listo!"
ls -lh "$OUTPUT"
