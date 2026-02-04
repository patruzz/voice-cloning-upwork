#!/usr/bin/env python3
"""
Voice cloning using Coqui TTS XTTS-v2
Clones voice from short audio samples and generates speech
"""

import sys
import os
from pathlib import Path
from TTS.api import TTS

def clone_voice(text_file, voice_sample, output_file, language="en"):
    """
    Clone voice and generate speech
    
    Args:
        text_file: Path to text file with narration
        voice_sample: Path to voice sample audio (10-30s WAV/MP3)
        output_file: Output audio file path
        language: Language code (en, es, fr, de, etc.)
    """
    print(f"🎙️ Loading XTTS-v2 model...")
    
    # Initialize TTS with XTTS-v2
    tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
    
    print(f"📝 Reading text from {text_file}...")
    with open(text_file, 'r') as f:
        text = f.read().strip()
    
    print(f"🎤 Using voice sample: {voice_sample}")
    print(f"🗣️ Generating speech...")
    
    # Generate speech with cloned voice
    tts.tts_to_file(
        text=text,
        file_path=output_file,
        speaker_wav=voice_sample,
        language=language,
        split_sentences=True  # Better quality for long texts
    )
    
    print(f"✅ Audio saved to: {output_file}")
    
    # Get audio duration
    import soundfile as sf
    data, samplerate = sf.read(output_file)
    duration = len(data) / samplerate
    print(f"⏱️ Duration: {duration:.1f} seconds")
    
    return output_file

def main():
    if len(sys.argv) < 4:
        print("Usage: python voice-clone.py <text_file> <voice_sample> <output_file> [language]")
        print("Example: python voice-clone.py narration-1.txt voice-sample.wav output.wav en")
        sys.exit(1)
    
    text_file = sys.argv[1]
    voice_sample = sys.argv[2]
    output_file = sys.argv[3]
    language = sys.argv[4] if len(sys.argv) > 4 else "en"
    
    if not os.path.exists(text_file):
        print(f"❌ Text file not found: {text_file}")
        sys.exit(1)
    
    if not os.path.exists(voice_sample):
        print(f"❌ Voice sample not found: {voice_sample}")
        sys.exit(1)
    
    clone_voice(text_file, voice_sample, output_file, language)

if __name__ == "__main__":
    main()
