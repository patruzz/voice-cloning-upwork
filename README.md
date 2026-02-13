# 🎙️ Voice Cloning Pipeline — AI Voice Generation & Video Automation

End-to-end pipeline for cloning voices and generating narrated demo videos. Uses AI voice synthesis to create professional voiceovers from text scripts, with automated video composition.

---

## 🎯 What It Does

Need a consistent AI voice for content? This pipeline **clones a voice from a short sample**, then generates unlimited narrated audio from text scripts. Includes automated video generation that combines narration with screen recordings for polished demo reels.

- Clone any voice from a short audio sample
- Generate narrated audio from text scripts
- Automated video composition with narration overlay
- Telegram bot integration for remote voice generation
- Batch processing for multiple videos

## 📊 Key Results

| Metric | Value |
|--------|-------|
| Voice clone quality | Near-human |
| Audio generation time | ~30s per minute of audio |
| Videos generated per batch | 3-10+ |
| Manual effort saved | ~8 hours per video set |

## 🛠 Tech Stack

- **Python** — Voice cloning & audio processing
- **Coqui TTS / ElevenLabs** — AI voice synthesis
- **Node.js** — Video generation pipeline
- **FFmpeg** — Audio/video composition
- **Telegram Bot API** — Remote control interface
- **GCP** — Cloud VM for GPU processing

## 🏗 Architecture

```
Input                Pipeline              Output
┌──────────┐     ┌──────────────┐     ┌──────────┐
│ Voice    │────▶│  Voice Clone │────▶│ Narrated │
│ Sample   │     │  (AI Model)  │     │ Audio    │
├──────────┤     ├──────────────┤     ├──────────┤
│ Text     │────▶│  TTS Engine  │────▶│ Demo     │
│ Scripts  │     │  + Video Gen │     │ Videos   │
└──────────┘     └──────────────┘     └──────────┘
```

## 🚀 Quick Start

```bash
pip install -r requirements.txt
# Configure your TTS API keys in .env (see .env.example)
python clone-and-generate.py
```

> **Note:** Requires API keys for voice synthesis services. See `.env.example` for configuration.

## 📸 Screenshots

*Sample generated videos and voice quality comparisons coming soon*

## 📜 License

MIT — see [LICENSE](LICENSE). Attribution required.

---

**Built by [patruzz](https://github.com/patruzz)** — AI/ML automation specialist for content creation pipelines.
