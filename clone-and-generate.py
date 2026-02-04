#!/usr/bin/env python3
"""
Voice cloning and video generation on molt
Execute on GCP VM with proper resources
"""

import os
from TTS.api import TTS

print("🎙️ VOICE CLONING WITH YOUR VOICE")
print("=" * 50)

# Files
VOICE_SAMPLE = "voice-sample.wav"
NARRATION = "narration-1.txt"
OUTPUT_AUDIO = "output-with-your-voice.wav"

# Check files exist
if not os.path.exists(VOICE_SAMPLE):
    print(f"❌ {VOICE_SAMPLE} not found")
    print("Upload with: gcloud compute scp voice-sample.wav molt:~/ --zone us-central1-a --project gen-lang-client-0988614926")
    exit(1)

if not os.path.exists(NARRATION):
    print(f"❌ {NARRATION} not found")
    print("Upload with: gcloud compute scp narration-1.txt molt:~/ --zone us-central1-a --project gen-lang-client-0988614926")
    exit(1)

# Load text
print(f"\n📝 Loading narration from {NARRATION}...")
with open(NARRATION, 'r') as f:
    text = f.read().strip()

print(f"Text: {text[:100]}...")
print(f"Length: {len(text)} characters")

# Initialize TTS
print(f"\n🤖 Loading XTTS-v2 model...")
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
print("✅ Model loaded")

# Clone voice and generate speech
print(f"\n🎙️ Cloning voice from {VOICE_SAMPLE}...")
print(f"🗣️ Generating speech...")

tts.tts_to_file(
    text=text,
    file_path=OUTPUT_AUDIO,
    speaker_wav=VOICE_SAMPLE,
    language="en",
    split_sentences=True
)

# Check output
import soundfile as sf
data, samplerate = sf.read(OUTPUT_AUDIO)
duration = len(data) / samplerate

print(f"\n✅ VOICE CLONING COMPLETE!")
print(f"Output: {OUTPUT_AUDIO}")
print(f"Duration: {duration:.1f} seconds")
print(f"Sample rate: {samplerate} Hz")

# File size
size_mb = os.path.getsize(OUTPUT_AUDIO) / (1024 * 1024)
print(f"Size: {size_mb:.2f} MB")

print("\n🎬 Next: Download audio and combine with video")
print(f"Download: gcloud compute scp molt:~/{OUTPUT_AUDIO} ./ --zone us-central1-a --project gen-lang-client-0988614926")
print("\n🔥 DONE!")
