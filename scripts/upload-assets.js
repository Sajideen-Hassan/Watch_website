import { createClient } from '@supabase/supabase-js'
import { readFileSync, statSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Add VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

const BUCKETS = {
  HERO: 'hero-sequence',
  WEBSITE: 'website-images',
  GALLERY: 'gallery-images',
  FUTURE: 'future-assets',
}

const CONCURRENCY = 8

async function ensureBucket(name) {
  const { data: buckets } = await supabase.storage.listBuckets()
  if (buckets?.some(b => b.name === name)) {
    console.log(`  Bucket "${name}" exists`)
    return
  }
  const { error } = await supabase.storage.createBucket(name, {
    public: true,
    fileSizeLimit: 52428800,
  })
  if (error) {
    console.error(`  Failed to create bucket "${name}": ${error.message}`)
  } else {
    console.log(`  Created bucket "${name}"`)
  }
}

async function uploadFile(bucket, filepath, filename, contentType, cacheControl = 'public, max-age=31536000, immutable') {
  const fileBuffer = readFileSync(filepath)
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, fileBuffer, { contentType, upsert: true, cacheControl })
  if (error) return { filename, success: false, error: error.message }
  return { filename, success: true }
}

async function uploadWebsiteImages() {
  console.log('\n--- Uploading Website Images ---')
  const imagesDir = resolve(PROJECT_ROOT, 'public', 'images')
  const imageFiles = [
    { file: 'watch-about.jpg', name: 'about-watch.jpg', type: 'image/jpeg' },
    { file: 'feature-craftsmanship.jpg', name: 'feature-craftsmanship.jpg', type: 'image/jpeg' },
    { file: 'feature-design.jpg', name: 'feature-design.jpg', type: 'image/jpeg' },
    { file: 'feature-precision.jpg', name: 'feature-precision.jpg', type: 'image/jpeg' },
    { file: 'feature-water.jpg', name: 'feature-water.jpg', type: 'image/jpeg' },
  ]

  let uploaded = 0
  let failed = 0

  for (let i = 0; i < imageFiles.length; i += CONCURRENCY) {
    const batch = imageFiles.slice(i, i + CONCURRENCY)
    const results = await Promise.all(
      batch.map(({ file, name, type }) => {
        const filepath = join(imagesDir, file)
        try {
          statSync(filepath)
          return uploadFile(BUCKETS.WEBSITE, filepath, name, type)
        } catch {
          return Promise.resolve({ filename: name, success: false, error: 'File not found' })
        }
      })
    )
    for (const r of results) {
      if (r.success) { uploaded++; process.stdout.write(`  \u2713 ${r.filename}\n`) }
      else { failed++; process.stdout.write(`  \u2717 ${r.filename} \u2014 ${r.error}\n`) }
    }
  }

  console.log(`\nWebsite images: ${uploaded} uploaded, ${failed} failed`)
  return failed === 0
}

async function uploadHeroFrames() {
  console.log('\n--- Uploading Hero Frames ---')
  const framesDir = resolve(PROJECT_ROOT, 'public', 'frames-avif')
  const TOTAL_FRAMES = 130

  try { statSync(framesDir) } catch {
    console.log('  Local frames-avif directory not found. Skipping frame upload.')
    console.log('  (Frames are already in Supabase from previous upload)')
    return true
  }

  const files = []
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const filename = `frame_${String(i).padStart(4, '0')}.avif`
    const filepath = join(framesDir, filename)
    try {
      statSync(filepath)
      files.push({ filename, filepath })
    } catch {}
  }

  if (files.length === 0) {
    console.log('  No frames found. Skipping.')
    return true
  }

  let uploaded = 0
  let failed = 0

  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY)
    const results = await Promise.all(
      batch.map(({ filename, filepath }) => uploadFile(BUCKETS.HERO, filepath, filename, 'image/avif'))
    )
    for (const r of results) {
      if (r.success) { uploaded++ }
      else { failed++; process.stdout.write(`  \u2717 ${r.filename} \u2014 ${r.error}\n`) }
    }
    process.stdout.write(`  Progress: ${uploaded + failed}/${files.length} (${uploaded} ok, ${failed} fail)\r`)
  }

  console.log(`\nHero frames: ${uploaded} uploaded, ${failed} failed`)
  return failed === 0
}

async function verifyBucket(bucket, expectedCount) {
  const { data, error } = await supabase.storage.from(bucket).list()
  if (error) {
    console.error(`  Failed to list ${bucket}: ${error.message}`)
    return false
  }
  console.log(`  ${bucket}: ${data.length} files`)
  if (expectedCount && data.length < expectedCount) {
    console.warn(`  WARNING: expected at least ${expectedCount} files, found ${data.length}`)
    return false
  }
  return true
}

async function main() {
  console.log('=== Supabase Multi-Bucket Uploader ===\n')

  for (const [, name] of Object.entries(BUCKETS)) {
    await ensureBucket(name)
  }

  await uploadWebsiteImages()
  await uploadHeroFrames()

  console.log('\n--- Verifying Buckets ---')
  await verifyBucket(BUCKETS.HERO, 130)
  await verifyBucket(BUCKETS.WEBSITE, 5)
  await verifyBucket(BUCKETS.GALLERY)
  await verifyBucket(BUCKETS.FUTURE)

  console.log('\n=== Done ===')
  console.log('Update local code references after upload:')
  console.log('  - supabase.js: BUCKET_NAME should match hero-sequence')
  console.log('  - assets.js: IMAGE_MAP keys should match uploaded filenames')
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
