#!/usr/bin/env python3
"""
Telegram bot to receive voice samples for cloning
Send a voice message to the bot and it saves as voice-sample.wav
"""

import os
import logging
from pathlib import Path
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from dotenv import load_dotenv
import asyncio

# Load environment variables
load_dotenv()
TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')

if not TOKEN:
    print("❌ TELEGRAM_BOT_TOKEN not found in .env file")
    print("Create .env file with: TELEGRAM_BOT_TOKEN=your_token_here")
    exit(1)

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Authorized user ID (from config or env)
AUTHORIZED_USER = int(os.getenv('TELEGRAM_USER_ID', '8074285321'))

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send a message when the command /start is issued."""
    await update.message.reply_text(
        "🎙️ Voice Cloning Bot\n\n"
        "Send me a voice message (10-30 seconds) and I'll save it as your voice sample.\n\n"
        "Tips for best results:\n"
        "• Speak naturally\n"
        "• Clear audio, no background noise\n"
        "• 10-30 seconds of varied speech\n"
        "• Read a paragraph or tell a short story"
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send a message when the command /help is issued."""
    await update.message.reply_text(
        "🎤 How to use:\n\n"
        "1. Record a voice message (10-30 seconds)\n"
        "2. Send it to me\n"
        "3. I'll save it as voice-sample.wav\n"
        "4. Use it to generate videos with your voice\n\n"
        "Commands:\n"
        "/start - Start the bot\n"
        "/help - Show this help\n"
        "/status - Check if voice sample exists"
    )

async def status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Check if voice sample exists."""
    sample_path = Path("voice-sample.wav")
    if sample_path.exists():
        size = sample_path.stat().st_size / 1024  # KB
        await update.message.reply_text(
            f"✅ Voice sample exists\n"
            f"Size: {size:.1f} KB\n"
            f"Path: {sample_path.absolute()}"
        )
    else:
        await update.message.reply_text(
            "❌ No voice sample found\n"
            "Send me a voice message to create one!"
        )

async def handle_voice(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle voice messages."""
    user_id = update.message.from_user.id
    
    # Check authorization
    if user_id != AUTHORIZED_USER:
        await update.message.reply_text(
            "❌ You're not authorized to use this bot."
        )
        return
    
    voice = update.message.voice
    duration = voice.duration
    
    if duration < 5:
        await update.message.reply_text(
            "⚠️ Voice message too short (less than 5 seconds)\n"
            "Please send a longer sample (10-30 seconds recommended)"
        )
        return
    
    if duration > 60:
        await update.message.reply_text(
            "⚠️ Voice message too long (more than 60 seconds)\n"
            "Please send a shorter sample (10-30 seconds recommended)"
        )
        return
    
    await update.message.reply_text(f"📥 Downloading voice sample ({duration}s)...")
    
    # Download voice file
    file = await context.bot.get_file(voice.file_id)
    temp_path = "voice-sample-temp.ogg"
    await file.download_to_drive(temp_path)
    
    # Convert to WAV using ffmpeg
    import subprocess
    output_path = "voice-sample.wav"
    
    try:
        subprocess.run([
            'ffmpeg', '-i', temp_path,
            '-ar', '22050',  # Sample rate for TTS
            '-ac', '1',      # Mono
            '-y',            # Overwrite
            output_path
        ], check=True, capture_output=True)
        
        os.remove(temp_path)
        
        await update.message.reply_text(
            f"✅ Voice sample saved!\n"
            f"Duration: {duration}s\n"
            f"File: {output_path}\n\n"
            f"You can now generate videos with your cloned voice! 🎬"
        )
        
        logger.info(f"Voice sample saved from user {user_id}, duration: {duration}s")
        
    except subprocess.CalledProcessError as e:
        await update.message.reply_text(
            f"❌ Error converting audio:\n{e.stderr.decode()}"
        )
        logger.error(f"FFmpeg error: {e}")

def main():
    """Start the bot."""
    # Create the Application
    application = Application.builder().token(TOKEN).build()

    # Register handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("status", status))
    application.add_handler(MessageHandler(filters.VOICE, handle_voice))

    # Start the bot
    print("🤖 Bot started! Send voice messages to save samples.")
    print(f"👤 Authorized user ID: {AUTHORIZED_USER}")
    application.run_polling()

if __name__ == '__main__':
    main()
