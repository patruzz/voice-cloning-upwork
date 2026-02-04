#!/bin/bash
# Test voice cloning con tu voz

echo "🎙️ Probando clonación de voz..."
echo "Audio sample: voice-sample.wav (64 segundos)"
echo "RAM disponible: $(free -h | grep Mem | awk '{print $7}')"
echo ""

# Test con narración corta
cat > test-short.txt << EOF
Hey there! This is a test of the voice cloning system. If this sounds like me, then we're good to go.
EOF

echo "📝 Texto de prueba creado"
echo "🚀 Intentando clonar voz..."

python3 voice-clone.py test-short.txt voice-sample.wav test-output.wav en

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Voice cloning EXITOSO!"
    echo "🎵 Reproduciendo resultado..."
    ffplay -nodisp -autoexit test-output.wav 2>/dev/null || echo "Audio generado: test-output.wav"
    ls -lh test-output.wav
else
    echo ""
    echo "❌ Voice cloning FALLÓ"
    echo "Necesitamos usar servicio cloud o VM más grande"
fi
