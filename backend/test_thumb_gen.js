const ffmpeg = require('ffmpeg-static');
const { execFileSync } = require('child_process');
const fs = require('fs');

console.log('Using ffmpeg binary:', ffmpeg);
const input = 'D:/saibalaji_silverworks/backend/public/videos/6Z1A1790.MP4';
const output = 'D:/saibalaji_silverworks/backend/public/test_thumb.webp';

try {
  execFileSync(ffmpeg, [
    '-y',
    '-ss', '00:00:01',
    '-i', input,
    '-vframes', '1',
    '-vf', 'scale=640:-1',
    '-quality', '80',
    output
  ], { stdio: 'inherit' });

  const stat = fs.statSync(output);
  console.log('Successfully generated test_thumb.webp! Size:', stat.size, 'bytes');
} catch (err) {
  console.error('Error generating thumbnail:', err);
}
