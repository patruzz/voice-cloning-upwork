#!/usr/bin/env python3
"""
ElevenLabs voice cloning - Alternative if Coqui TTS fails
Free tier: 10,000 characters/month
"""

import sys
import os
from elevenlabs import clone, generate, play, save, set_api_key

def clone_voice_elevenlabs(text_file, voice_sample, output_file, api_key=None):
    """
    Clone voice using ElevenLabs API
    """
    if not api_key:
        api_key = os.getenv('ELEVENLABS_API_KEY')
        if not api_key:
            print("❌ ELEVENLABS_API_KEY not set")
            print("Get one at: https://elevenlabs.io/")
            print("Free tier: 10,000 chars/month")
            sys.exit(1)
    
    set_api_key(api_key)
    
    print("🎙️ ElevenLabs Voice Cloning")
    print(f"📝 Text: {text_file}")
    print(f"🎤 Sample: {voice_sample}")
    print("")
    
    # Read text
    with open(text_file, 'r') as f:
        text = f.read()
    
    char_count = len(text)
    print(f"📊 Characters: {char_count}")
    
    if char_count > 5000:
        print("⚠️ Warning: Text is long, may use significant quota")
    
    # Clone voice
    print("🔬 Analyzing voice sample...")
    voice = clone(
        name="Patru",
        description="Professional voice for Upwork videos",
        files=[voice_sample]
    )
    
    # Generate audio
    print("🎵 Generating audio...")
    audio = generate(
        text=text,
        voice=voice
    )
    
    # Save
    save(audio, output_file)
    
    print(f"✅ Audio saved: {output_file}")
    print(f"💰 Used {char_count} characters from quota")
    
    return output_file

def main():
    if len(sys.argv) < 4:
        print("Usage: python elevenlabs-clone.py <text_file> <voice_sample> <output_file> [api_key]")
        sys.exit(1)
    
    text_file = sys.argv[1]
    voice_sample = sys.argv[2]
    output_file = sys.argv[3]
    api_key = sys.argv[4] if len(sys.argv) > 4 else None
    
    clone_voice_elevenlabs(text_file, voice_sample, output_file, api_key)

if __name__ == "__main__":
    main()
