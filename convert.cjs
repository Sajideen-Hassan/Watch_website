const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

const inputPattern = path.join(__dirname, 'frames', '%03d.png');
const framesDir = path.join(__dirname, 'public', 'frames');

// Create frames directory if it doesn't exist
if (!fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir, { recursive: true });
}

console.log('Converting PNG sequence to WebP using ffmpeg at:', ffmpegPath);
console.log('Input pattern:', inputPattern);
console.log('Output directory:', framesDir);

const ffmpeg = spawn(ffmpegPath, [
  '-y', // Overwrite output files
  '-framerate', '24', // Input framerate
  '-i', inputPattern,
  '-c:v', 'libwebp',
  '-quality', '85', // WebP quality
  path.join(framesDir, 'frame_%04d.webp')
]);

ffmpeg.stdout.on('data', (data) => {
  // console.log(`stdout: ${data}`);
});

ffmpeg.stderr.on('data', (data) => {
  const str = data.toString();
  if (str.includes('frame=')) {
    process.stdout.write(`\r${str.trim()}`);
  }
});

ffmpeg.on('close', (code) => {
  console.log(`\nFFmpeg process exited with code ${code}`);
  if (code === 0) {
    console.log('Conversion complete!');
    // Count frames and write meta.json
    const files = fs.readdirSync(framesDir).filter(f => f.endsWith('.webp'));
    const meta = { frameCount: files.length };
    fs.writeFileSync(path.join(framesDir, 'meta.json'), JSON.stringify(meta));
    console.log(`Wrote meta.json with ${files.length} frames.`);
  } else {
    console.error('Conversion failed.');
  }
});
