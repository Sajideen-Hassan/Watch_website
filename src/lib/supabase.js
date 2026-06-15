const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const BUCKET_NAME = 'watch-frames'
export const TOTAL_FRAMES = 130
export const FRAME_W = 1920
export const FRAME_H = 1080

const isConfigured = supabaseUrl && supabaseAnonKey

if (isConfigured) {
  const origin = new URL(supabaseUrl).origin
  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = origin
  document.head.appendChild(link)
}

function buildUrl(index) {
  const padded = String(index).padStart(4, '0')
  if (isConfigured) {
    return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/frame_${padded}.avif`
  }
  return `/frames-avif/frame_${padded}.avif`
}

export const FRAME_URLS = Array.from(
  { length: TOTAL_FRAMES },
  (_, i) => buildUrl(i + 1)
)

if (isConfigured) {
  const preloadLink = document.createElement('link')
  preloadLink.rel = 'preload'
  preloadLink.as = 'image'
  preloadLink.href = FRAME_URLS[0]
  preloadLink.fetchPriority = 'high'
  document.head.appendChild(preloadLink)
}
