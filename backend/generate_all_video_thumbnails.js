const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const ffmpeg = require('ffmpeg-static');

const videosDir = path.join(__dirname, 'public', 'videos');
const thumbsDir = path.join(__dirname, 'public', 'video_thumbnails');

if (!fs.existsSync(thumbsDir)) {
  fs.mkdirSync(thumbsDir, { recursive: true });
}

const files = fs.readdirSync(videosDir).filter(f => f.toLowerCase().endsWith('.mp4'));
console.log(`Found ${files.length} MP4 videos in ${videosDir}`);

const CONCURRENCY = 4;
let currentIndex = 0;
let completed = 0;
let skipped = 0;
let failed = 0;

function processVideo(filename) {
  return new Promise((resolve) => {
    const inputPath = path.join(videosDir, filename);
    const baseName = path.parse(filename).name;
    const outputPath = path.join(thumbsDir, `${baseName}.webp`);

    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
      skipped++;
      return resolve();
    }

    const args = [
      '-y',
      '-ss', '00:00:01',
      '-i', inputPath,
      '-vframes', '1',
      '-vf', 'scale=640:-1',
      '-quality', '80',
      outputPath
    ];

    const proc = spawn(ffmpeg, args, { stdio: 'ignore' });
    proc.on('close', (code) => {
      if (code === 0) {
        completed++;
      } else {
        failed++;
        console.error(`Failed to generate thumbnail for ${filename} (code ${code})`);
      }
      resolve();
    });
    proc.on('error', (err) => {
      failed++;
      console.error(`Error spawning ffmpeg for ${filename}:`, err.message);
      resolve();
    });
  });
}

async function worker() {
  while (currentIndex < files.length) {
    const idx = currentIndex++;
    const file = files[idx];
    await processVideo(file);
    if ((completed + skipped + failed) % 20 === 0 || (completed + skipped + failed) === files.length) {
      console.log(`Progress: ${completed + skipped + failed}/${files.length} (Generated: ${completed}, Skipped: ${skipped}, Failed: ${failed})`);
    }
  }
}

async function run() {
  const startTime = Date.now();
  console.log(`Starting thumbnail generation with concurrency ${CONCURRENCY}...`);
  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Finished in ${elapsed}s! Total: ${files.length} | Generated: ${completed} | Skipped: ${skipped} | Failed: ${failed}`);

  // Now update backend/videos_data.json and frontend/src/data/videosData.ts
  const backendJsonPath = path.join(__dirname, 'videos_data.json');
  if (fs.existsSync(backendJsonPath)) {
    let videosData = JSON.parse(fs.readFileSync(backendJsonPath, 'utf8'));
    let updatedCount = 0;
    videosData = videosData.map(v => {
      if (v.filename) {
        const baseName = path.parse(v.filename).name;
        const thumbUrl = `/public/video_thumbnails/${baseName}.webp`;
        if (v.thumbnail_url !== thumbUrl) {
          updatedCount++;
          return { ...v, thumbnail_url: thumbUrl };
        }
      }
      return v;
    });
    fs.writeFileSync(backendJsonPath, JSON.stringify(videosData, null, 2), 'utf8');
    console.log(`Updated ${updatedCount} entries in backend/videos_data.json with .webp thumbnails`);
  }

  const frontendDataPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'videosData.ts');
  if (fs.existsSync(frontendDataPath)) {
    let content = fs.readFileSync(frontendDataPath, 'utf8');
    // Replace "/public/videos/(.*?).MP4" in thumbnail_url with "/public/video_thumbnails/$1.webp"
    const replaced = content.replace(/"thumbnail_url":\s*"\/public\/videos\/(.*?)\.(?:MP4|mp4)"/g, '"thumbnail_url": "/public/video_thumbnails/$1.webp"');
    fs.writeFileSync(frontendDataPath, replaced, 'utf8');
    console.log('Updated frontend/src/data/videosData.ts with .webp thumbnail paths');
  }
}

run().catch(console.error);
