# Voice Cloning System for Upwork Portfolio Videos

Automated system to create professional portfolio demo videos with voice cloning.

## Features

🎙️ **Voice Cloning**: Clone any voice from short audio samples (10-30 seconds)  
🎬 **Automated Video Recording**: Browser automation with natural scrolling  
🤖 **Telegram Integration**: Send audio samples via Telegram  
🎯 **Upwork-Optimized**: 60-second demos perfect for freelance portfolios  

## Tech Stack

- **Voice Cloning**: Coqui TTS XTTS-v2 (open source)
- **Video Recording**: Puppeteer + FFmpeg
- **Bot Integration**: Telegram Bot API
- **Display**: Xvfb (virtual X server)

## Installation

```bash
# 1. Install system dependencies
sudo apt-get update
sudo apt-get install -y ffmpeg xvfb fluxbox python3-pip espeak

# 2. Install Python packages
pip3 install -r requirements.txt

# 3. Install Node.js packages
npm install

# 4. Set up Telegram bot token (optional for voice upload)
echo "TELEGRAM_BOT_TOKEN=your_token_here" > .env
```

## Usage

### 1. Record Voice Sample

Send a 10-30 second voice message to the Telegram bot or save as `voice-sample.wav`:

```bash
# Option A: Via Telegram
# Just send a voice message to your bot

# Option B: Manual upload
cp your-voice.wav voice-sample.wav
```

### 2. Generate Videos

```bash
# Generate all 3 portfolio videos with your cloned voice
node generate-videos.js

# Or generate single video
node generate-single.js --repo real-estate-scraper --script narration-1.txt
```

### 3. Output

Videos will be saved as:
- `demo-1-real-estate-scraper.mp4`
- `demo-2-lead-gen-bot.mp4`
- `demo-3-pdf-invoice-parser.mp4`

## Voice Cloning Details

- **Model**: XTTS-v2 (multilingual, 10-30s sample needed)
- **Quality**: Near-human quality with good samples
- **Languages**: English, Spanish, French, German, Italian, Portuguese, Polish, Turkish, Russian, Dutch, Czech, Arabic, Chinese, Japanese, Hungarian, Korean
- **Speed**: ~2-3 seconds per 10 seconds of audio

## Video Recording Details

- **Resolution**: 1920x1080 HD
- **Duration**: 60 seconds (Upwork optimal)
- **Scrolling**: Human-like variable speed with pauses
- **Navigation**: Automated GitHub repository browsing
- **Audio**: Synced voice narration with video

## Narration Scripts

Edit scripts in `narrations/` folder:
- `narration-1.txt` - Real Estate Scraper
- `narration-2.txt` - Lead Gen Bot
- `narration-3.txt` - PDF Invoice Parser

## Configuration

Edit `config.json`:

```json
{
  "repos": [
    {
      "name": "real-estate-scraper",
      "url": "https://github.com/patruzz/real-estate-scraper",
      "narration": "narrations/narration-1.txt"
    }
  ],
  "voice": {
    "sample": "voice-sample.wav",
    "language": "en",
    "speed": 1.0
  },
  "video": {
    "duration": 60,
    "scroll_speed": "human",
    "show_code": true
  }
}
```

## Architecture

```
voice-cloning-upwork/
├── generate-videos.js       # Main video generator
├── voice-clone.py           # Voice cloning with XTTS-v2
├── telegram-bot.js          # Telegram voice sample receiver
├── record-with-voice.js     # Puppeteer + voice recording
├── config.json              # Configuration
├── narrations/              # Narration scripts
│   ├── narration-1.txt
│   ├── narration-2.txt
│   └── narration-3.txt
├── voice-sample.wav         # Your voice sample
└── output/                  # Generated videos
```

## Telegram Bot Setup

1. Create bot via @BotFather
2. Get token and add to `.env`
3. Send voice message to bot
4. Bot auto-saves as `voice-sample.wav`

## Tips for Best Results

### Voice Samples
- **Length**: 10-30 seconds (longer = better quality)
- **Quality**: Clear audio, no background noise
- **Content**: Natural speech, varied pitch/tone
- **Format**: WAV preferred, MP3/OGG also work

### Video Recording
- Repos should have good READMEs
- Show: Features, code, output examples
- Keep code sections short (5-10 lines max)

## License

MIT

## Author

Created for automating Upwork portfolio video creation with personalized voice cloning.
