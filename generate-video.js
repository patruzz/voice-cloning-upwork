const puppeteer = require('puppeteer');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');

const execAsync = promisify(exec);

// Human-like scrolling patterns
const humanScroll = {
  // Random delay between scrolls
  getDelay: () => 800 + Math.random() * 1200, // 0.8-2s
  
  // Random scroll distance (variable speed)
  getDistance: () => 200 + Math.random() * 400, // 200-600px
  
  // Sometimes scroll back up (like reading)
  shouldScrollBack: () => Math.random() < 0.15, // 15% chance
  
  // Pause to "read"
  shouldPause: () => Math.random() < 0.25, // 25% chance
  getPauseDuration: () => 1500 + Math.random() * 2000 // 1.5-3.5s
};

async function generateVideo(config) {
  const { repoUrl, narrationFile, outputFile, duration = 60 } = config;
  
  console.log(`🎬 Generating video for: ${repoUrl}`);
  console.log(`⏱️ Target duration: ${duration}s`);
  
  // Step 1: Generate audio with cloned voice
  console.log(`🎙️ Generating voice with cloning...`);
  const audioFile = outputFile.replace('.mp4', '.wav');
  
  try {
    await execAsync(
      `python3 voice-clone.py "${narrationFile}" voice-sample.wav "${audioFile}" en`
    );
  } catch (error) {
    console.error('❌ Voice cloning failed:', error.message);
    throw error;
  }
  
  // Get audio duration
  const { stdout } = await execAsync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioFile}"`);
  const audioDuration = parseFloat(stdout.trim());
  console.log(`🎵 Audio duration: ${audioDuration.toFixed(1)}s`);
  
  // Calculate video duration (audio + 3s buffer)
  const videoDuration = Math.max(duration, audioDuration + 3);
  
  // Step 2: Record browser session
  console.log(`📹 Recording browser session...`);
  
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--display=:99',
      '--window-size=1920,1080'
    ]
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Start screen recording with ffmpeg
  const videoTempFile = outputFile.replace('.mp4', '-video-only.mp4');
  const ffmpegProcess = exec(
    `ffmpeg -video_size 1920x1080 -framerate 30 -f x11grab -i :99.0 ` +
    `-t ${Math.ceil(videoDuration)} -c:v libx264 -preset fast -crf 22 "${videoTempFile}" -y`
  );
  
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for ffmpeg to start
  
  // Navigate to repo
  console.log(`🌐 Navigating to ${repoUrl}...`);
  await page.goto(repoUrl, { waitUntil: 'networkidle2' });
  await page.waitForTimeout(3000);
  
  // Record for specified duration with human-like scrolling
  const startTime = Date.now();
  const endTime = startTime + (videoDuration * 1000);
  
  let scrollPosition = 0;
  let phase = 'readme'; // readme -> code -> output
  
  while (Date.now() < endTime) {
    const elapsed = (Date.now() - startTime) / 1000;
    const remaining = (endTime - Date.now()) / 1000;
    
    // Phase transitions
    if (elapsed > videoDuration * 0.3 && phase === 'readme') {
      // Show code files
      try {
        console.log(`📂 Showing code files...`);
        const codeLinks = await page.$$('a[href$=".py"], a[href$=".js"]');
        if (codeLinks.length > 0) {
          await codeLinks[0].click();
          await page.waitForTimeout(2000);
          phase = 'code';
        }
      } catch (e) {
        console.log('No code files found, continuing...');
      }
    }
    
    if (elapsed > videoDuration * 0.6 && phase === 'code') {
      // Show output/data files
      try {
        console.log(`📊 Showing output files...`);
        const dataLinks = await page.$$('a[href$=".csv"], a[href$=".json"]');
        if (dataLinks.length > 0) {
          await dataLinks[0].click();
          await page.waitForTimeout(2000);
          phase = 'output';
        }
      } catch (e) {
        console.log('No output files found, continuing...');
      }
    }
    
    // Human-like scrolling
    if (humanScroll.shouldPause()) {
      const pauseDuration = humanScroll.getPauseDuration();
      console.log(`⏸️ Pausing to "read" for ${(pauseDuration/1000).toFixed(1)}s...`);
      await page.waitForTimeout(pauseDuration);
    } else {
      const scrollDistance = humanScroll.getDistance();
      const direction = humanScroll.shouldScrollBack() ? -1 : 1;
      
      await page.evaluate((dist, dir) => {
        window.scrollBy(0, dist * dir);
      }, scrollDistance, direction);
      
      scrollPosition += scrollDistance * direction;
      
      const delay = humanScroll.getDelay();
      await page.waitForTimeout(delay);
    }
    
    // Log progress
    if (Math.floor(elapsed) % 10 === 0) {
      console.log(`⏱️ Progress: ${elapsed.toFixed(0)}s / ${videoDuration.toFixed(0)}s`);
    }
  }
  
  console.log(`✅ Recording complete`);
  await browser.close();
  
  // Wait for ffmpeg to finish
  await new Promise((resolve, reject) => {
    ffmpegProcess.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });
  
  // Step 3: Combine video and audio
  console.log(`🎬 Combining video and audio...`);
  await execAsync(
    `ffmpeg -i "${videoTempFile}" -i "${audioFile}" ` +
    `-c:v copy -c:a aac -b:a 192k -shortest "${outputFile}" -y`
  );
  
  // Cleanup
  fs.unlinkSync(videoTempFile);
  fs.unlinkSync(audioFile);
  
  console.log(`✅ Video created: ${outputFile}`);
  
  // Get final stats
  const stats = fs.statSync(outputFile);
  const sizeKB = (stats.size / 1024).toFixed(1);
  console.log(`📦 Size: ${sizeKB} KB`);
  
  return outputFile;
}

async function generateAllVideos() {
  const videos = [
    {
      repoUrl: 'https://github.com/patruzz/real-estate-scraper',
      narrationFile: 'narrations/narration-1.txt',
      outputFile: 'output/demo-1-real-estate-scraper.mp4'
    },
    {
      repoUrl: 'https://github.com/patruzz/lead-gen-bot',
      narrationFile: 'narrations/narration-2.txt',
      outputFile: 'output/demo-2-lead-gen-bot.mp4'
    },
    {
      repoUrl: 'https://github.com/patruzz/pdf-invoice-parser',
      narrationFile: 'narrations/narration-3.txt',
      outputFile: 'output/demo-3-pdf-invoice-parser.mp4'
    }
  ];
  
  // Create output directory
  if (!fs.existsSync('output')) {
    fs.mkdirSync('output');
  }
  
  for (const video of videos) {
    await generateVideo(video);
  }
  
  console.log('\n🎉 All videos generated successfully!');
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--all')) {
    generateAllVideos().catch(console.error);
  } else if (args.includes('--repo')) {
    const repoIndex = args.indexOf('--repo');
    const repo = args[repoIndex + 1];
    const narration = args[args.indexOf('--narration') + 1];
    const output = args[args.indexOf('--output') + 1];
    
    generateVideo({
      repoUrl: repo,
      narrationFile: narration,
      outputFile: output,
      duration: 60
    }).catch(console.error);
  } else {
    console.log('Usage:');
    console.log('  node generate-video.js --all');
    console.log('  node generate-video.js --repo URL --narration FILE --output FILE');
  }
}

module.exports = { generateVideo, generateAllVideos };
