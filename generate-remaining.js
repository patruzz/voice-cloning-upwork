const { generateVideo } = require('./generate-video-v2.js');

async function main() {
  const videos = [
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
  
  console.log('🎬 Generando videos 2 y 3...\n');
  
  for (let i = 0; i < videos.length; i++) {
    console.log(`\n[${i+2}/3] ==========================================`);
    await generateVideo(videos[i]);
  }
  
  console.log('\n✅ Todos los videos completados!');
}

main().catch(console.error);
