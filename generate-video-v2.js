const puppeteer = require('puppeteer');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');

const execAsync = promisify(exec);

// Human-like scrolling - más realista
const humanScroll = {
  getDelay: () => 1200 + Math.random() * 2000, // 1.2-3.2s entre scrolls
  getDistance: () => 250 + Math.random() * 350, // 250-600px
  shouldScrollBack: () => Math.random() < 0.12, // 12% scroll hacia arriba
  shouldPause: () => Math.random() < 0.35, // 35% pausas para "leer"
  getPauseDuration: () => 2000 + Math.random() * 3000, // 2-5s pausas
  shouldScrollSlow: () => Math.random() < 0.3, // 30% scrolls lentos
};

async function smoothScroll(page, distance, duration = 800) {
  await page.evaluate((dist, dur) => {
    return new Promise((resolve) => {
      const start = window.scrollY;
      const startTime = performance.now();
      
      function scroll(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / dur, 1);
        
        // Easing function para movimiento más natural
        const easeInOutQuad = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        window.scrollTo(0, start + (dist * easeInOutQuad));
        
        if (progress < 1) {
          requestAnimationFrame(scroll);
        } else {
          resolve();
        }
      }
      
      requestAnimationFrame(scroll);
    });
  }, distance, duration);
}

async function generateVideo(config) {
  const { repoUrl, narrationFile, outputFile, duration = 60, voiceName = 'en-US-GuyNeural' } = config;
  
  console.log(`\n🎬 Generando video: ${outputFile}`);
  console.log(`📹 Duración objetivo: ${duration}s`);
  console.log(`🌐 Repo: ${repoUrl}`);
  
  // Generar audio con Edge TTS
  console.log(`🎙️ Generando audio con ${voiceName}...`);
  const audioFile = outputFile.replace('.mp4', '-audio.mp3');
  
  try {
    await execAsync(
      `edge-tts --voice ${voiceName} --file "${narrationFile}" --write-media "${audioFile}"`
    );
  } catch (error) {
    console.error('❌ Error generando audio:', error.message);
    throw error;
  }
  
  // Obtener duración del audio
  const { stdout } = await execAsync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioFile}"`
  );
  const audioDuration = parseFloat(stdout.trim());
  console.log(`🎵 Audio: ${audioDuration.toFixed(1)}s`);
  
  // Video duration = max(objetivo, audio + 5s buffer)
  const videoDuration = Math.max(duration, Math.ceil(audioDuration + 5));
  console.log(`⏱️ Video final: ${videoDuration}s`);
  
  // Iniciar browser
  console.log(`🌐 Iniciando navegador...`);
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--display=:99',
      '--window-size=1920,1080',
      '--disable-gpu',
      '--disable-infobars',
      '--disable-blink-features=AutomationControlled',
      '--exclude-switches=enable-automation',
      '--disable-extensions'
    ],
    ignoreDefaultArgs: ['--enable-automation']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Ocultar que es automatizado
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
  });
  
  // Iniciar grabación de pantalla
  console.log(`📹 Iniciando grabación...`);
  const videoTempFile = outputFile.replace('.mp4', '-video.mp4');
  const ffmpegProcess = exec(
    `ffmpeg -video_size 1920x1080 -framerate 30 -f x11grab -i :99.0 ` +
    `-t ${videoDuration} -c:v libx264 -preset fast -crf 22 "${videoTempFile}" -y`,
    { maxBuffer: 50 * 1024 * 1024 }
  );
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Navegar al repo
  console.log(`🌐 Cargando ${repoUrl}...`);
  await page.goto(repoUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForTimeout(4000); // Pausa inicial para que se cargue todo
  
  const startTime = Date.now();
  const endTime = startTime + (videoDuration * 1000);
  
  let phase = 'readme';
  let phaseChangedAt = startTime;
  
  console.log(`📜 Fase: README`);
  
  // Loop de grabación con navegación inteligente
  while (Date.now() < endTime) {
    const elapsed = (Date.now() - startTime) / 1000;
    const remaining = (endTime - Date.now()) / 1000;
    const phaseElapsed = (Date.now() - phaseChangedAt) / 1000;
    
    // Cambios de fase basados en tiempo
    if (elapsed > videoDuration * 0.35 && phase === 'readme' && phaseElapsed > 5) {
      try {
        console.log(`\n📂 Fase: CÓDIGO`);
        // Buscar archivo .py o .js
        const codeFile = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*=".py"], a[href*=".js"]'));
          const mainFile = links.find(l => 
            l.href.includes('scraper.py') || 
            l.href.includes('lead_generator.py') ||
            l.href.includes('invoice_parser.py') ||
            l.href.includes('main.py')
          );
          return mainFile || links[0];
        });
        
        if (codeFile) {
          await codeFile.click();
          await page.waitForTimeout(3000);
          phase = 'code';
          phaseChangedAt = Date.now();
        }
      } catch (e) {
        console.log('⚠️ No se encontró código, continuando...');
      }
    }
    
    if (elapsed > videoDuration * 0.65 && phase === 'code' && phaseElapsed > 5) {
      try {
        console.log(`\n📊 Fase: OUTPUT`);
        // Volver al repo principal
        await page.goto(repoUrl, { waitUntil: 'networkidle2' });
        await page.waitForTimeout(2000);
        
        // Buscar CSV o JSON
        const dataFile = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*=".csv"], a[href*=".json"]'));
          return links[0];
        });
        
        if (dataFile) {
          await dataFile.click();
          await page.waitForTimeout(3000);
          phase = 'output';
          phaseChangedAt = Date.now();
        }
      } catch (e) {
        console.log('⚠️ No se encontraron archivos de datos');
      }
    }
    
    // Scroll humano
    if (humanScroll.shouldPause()) {
      const pauseDuration = humanScroll.getPauseDuration();
      await page.waitForTimeout(pauseDuration);
    } else {
      const distance = humanScroll.getDistance();
      const direction = humanScroll.shouldScrollBack() ? -1 : 1;
      const scrollDuration = humanScroll.shouldScrollSlow() ? 1500 : 800;
      
      await smoothScroll(page, distance * direction, scrollDuration);
      await page.waitForTimeout(humanScroll.getDelay());
    }
    
    // Log progreso cada 5s
    if (Math.floor(elapsed) % 5 === 0 && Math.floor(elapsed) !== Math.floor(elapsed - 1)) {
      console.log(`⏱️ ${elapsed.toFixed(0)}s / ${videoDuration}s`);
    }
  }
  
  console.log(`✅ Grabación completa`);
  await browser.close();
  
  // Esperar a que ffmpeg termine
  await new Promise((resolve, reject) => {
    ffmpegProcess.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg falló: ${code}`));
    });
  });
  
  // Combinar video + audio
  console.log(`🎬 Combinando video y audio...`);
  await execAsync(
    `ffmpeg -i "${videoTempFile}" -i "${audioFile}" ` +
    `-c:v copy -c:a aac -b:a 192k -shortest "${outputFile}" -y`
  );
  
  // Cleanup
  fs.unlinkSync(videoTempFile);
  fs.unlinkSync(audioFile);
  
  const stats = fs.statSync(outputFile);
  console.log(`✅ ${outputFile} (${(stats.size / (1024*1024)).toFixed(1)} MB)\n`);
  
  return outputFile;
}

// Generar los 3 videos
async function main() {
  const videos = [
    {
      repoUrl: 'https://github.com/patruzz/real-estate-scraper',
      narrationFile: 'narrations/narration-1.txt',
      outputFile: 'output/demo-1-real-estate-scraper-FINAL.mp4',
      duration: 60
    },
    {
      repoUrl: 'https://github.com/patruzz/lead-gen-bot',
      narrationFile: 'narrations/narration-2.txt',
      outputFile: 'output/demo-2-lead-gen-bot-FINAL.mp4',
      duration: 60
    },
    {
      repoUrl: 'https://github.com/patruzz/pdf-invoice-parser',
      narrationFile: 'narrations/narration-3.txt',
      outputFile: 'output/demo-3-pdf-invoice-parser-FINAL.mp4',
      duration: 60
    }
  ];
  
  console.log('🎬 GENERANDO 3 VIDEOS PROFESIONALES\n');
  console.log('Configuración:');
  console.log('- Duración: 60 segundos');
  console.log('- Resolución: 1920x1080');
  console.log('- Scroll: Humano (variable, pausas, retrocesos)');
  console.log('- Audio: Edge TTS Neural (Microsoft)\n');
  
  if (!fs.existsSync('output')) {
    fs.mkdirSync('output');
  }
  
  for (let i = 0; i < videos.length; i++) {
    console.log(`\n[${ i + 1}/3] ==========================================`);
    await generateVideo(videos[i]);
  }
  
  console.log('\n🎉 TODOS LOS VIDEOS GENERADOS!\n');
  console.log('📁 Archivos en: output/');
  console.log('   - demo-1-real-estate-scraper-FINAL.mp4');
  console.log('   - demo-2-lead-gen-bot-FINAL.mp4');
  console.log('   - demo-3-pdf-invoice-parser-FINAL.mp4\n');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateVideo };
