#!/bin/bash
# Generate 3 videos FAST - Money mode
set -e

export DISPLAY=:99
cd /home/l0v3/.openclaw/workspace/voice-cloning-upwork

echo "💰 GENERATING 3 VIDEOS FOR UPWORK - MONEY MODE"
echo ""

# Videos config
declare -A videos=(
    [1]="https://github.com/patruzz/real-estate-scraper|narrations/narration-1.txt|output/video-1-real-estate-scraper.mp4"
    [2]="https://github.com/patruzz/lead-gen-bot|narrations/narration-2.txt|output/video-2-lead-gen-bot.mp4"
    [3]="https://github.com/patruzz/pdf-invoice-parser|narrations/narration-3.txt|output/video-3-pdf-invoice-parser.mp4"
)

mkdir -p output

for i in 1 2 3; do
    IFS='|' read -r URL NARR OUT <<< "${videos[$i]}"
    
    echo "[$i/3] ========================================="
    echo "📹 $URL"
    
    # Generate audio (Edge TTS - fast and works)
    AUDIO="output/audio-$i.mp3"
    echo "🎙️ Generating audio..."
    edge-tts --voice en-US-GuyNeural --file "$NARR" --write-media "$AUDIO"
    
    # Get audio duration
    DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUDIO" | cut -d. -f1)
    VIDEO_DUR=$((DUR + 5))
    
    echo "⏱️ Audio: ${DUR}s, Video: ${VIDEO_DUR}s"
    
    # Record browser (clean, no banner)
    VIDEO_TEMP="output/video-$i-temp.mp4"
    echo "📹 Recording browser..."
    
    # Start Chrome (clean)
    google-chrome \
        --no-sandbox \
        --disable-setuid-sandbox \
        --disable-dev-shm-usage \
        --disable-infobars \
        --disable-blink-features=AutomationControlled \
        --exclude-switches=enable-automation \
        --display=:99 \
        --window-size=1920,1080 \
        "$URL" 2>/dev/null &
    CHROME_PID=$!
    
    sleep 3
    
    # Record
    timeout ${VIDEO_DUR}s ffmpeg -video_size 1920x1080 -framerate 30 \
        -f x11grab -i :99.0 -c:v libx264 -preset fast -crf 22 \
        "$VIDEO_TEMP" -y 2>/dev/null || true
    
    kill $CHROME_PID 2>/dev/null || true
    sleep 1
    
    # Combine
    echo "🎬 Combining..."
    ffmpeg -i "$VIDEO_TEMP" -i "$AUDIO" \
        -c:v copy -c:a aac -b:a 192k -shortest \
        "$OUT" -y 2>/dev/null
    
    rm "$VIDEO_TEMP" "$AUDIO"
    
    SIZE=$(du -h "$OUT" | cut -f1)
    echo "✅ Video $i: $OUT ($SIZE)"
    echo ""
done

echo "🎉 ALL 3 VIDEOS READY FOR UPWORK"
echo ""
ls -lh output/*.mp4
