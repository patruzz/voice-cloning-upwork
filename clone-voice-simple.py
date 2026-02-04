#!/usr/bin/env python3
"""
Voice cloning usando servicios cloud gratuitos o locales ligeros
"""

import sys
import os
import subprocess

def try_local_xtts():
    """Intenta usar Coqui TTS local si está instalado"""
    try:
        from TTS.api import TTS
        print("✅ Coqui TTS encontrado")
        return True
    except ImportError:
        print("❌ Coqui TTS no instalado")
        return False

def try_bark():
    """Intenta usar Bark (más ligero que XTTS)"""
    try:
        from bark import SAMPLE_RATE, generate_audio, preload_models
        print("✅ Bark encontrado")
        return True
    except ImportError:
        print("❌ Bark no instalado")
        return False

def use_edge_tts_with_speed_pitch():
    """Fallback: Edge TTS con modificaciones de pitch para sonar más natural"""
    print("📢 Usando Edge TTS (no es clonación perfecta pero funcional)")
    return True

def main():
    if len(sys.argv) < 4:
        print("Usage: python clone-voice-simple.py <text_file> <voice_sample> <output_file>")
        sys.exit(1)
    
    text_file = sys.argv[1]
    voice_sample = sys.argv[2]
    output_file = sys.argv[3]
    
    print(f"🎙️ Voice Cloning")
    print(f"📝 Text: {text_file}")
    print(f"🎤 Sample: {voice_sample}")
    print(f"💾 Output: {output_file}")
    print()
    
    # Intentar métodos en orden de preferencia
    methods = [
        ("Coqui TTS XTTS-v2 (Local)", try_local_xtts),
        ("Bark (Ligero)", try_bark),
        ("Edge TTS (Fallback)", use_edge_tts_with_speed_pitch)
    ]
    
    for method_name, method_func in methods:
        print(f"🔍 Probando {method_name}...")
        if method_func():
            print(f"✅ Usando {method_name}")
            
            if "Edge TTS" in method_name:
                # Fallback a Edge TTS
                with open(text_file, 'r') as f:
                    text = f.read()
                
                subprocess.run([
                    'edge-tts',
                    '--voice', 'en-US-GuyNeural',
                    '--text', text,
                    '--write-media', output_file
                ], check=True)
                
                print(f"✅ Audio generado: {output_file}")
                print("⚠️ Nota: Este NO es tu voz clonada, es Edge TTS")
                print("   Para clonación real necesitamos usar Google Cloud VM")
                return
            
            elif "Coqui" in method_name:
                # Usar XTTS
                from TTS.api import TTS
                with open(text_file, 'r') as f:
                    text = f.read()
                
                tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
                tts.tts_to_file(
                    text=text,
                    file_path=output_file,
                    speaker_wav=voice_sample,
                    language="en",
                    split_sentences=True
                )
                print(f"✅ Audio generado con TU VOZ: {output_file}")
                return
            
            break
    
    print("❌ No se pudo generar audio")
    sys.exit(1)

if __name__ == "__main__":
    main()
