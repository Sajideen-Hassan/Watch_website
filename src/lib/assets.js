const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const BUCKET = 'website-images'

export function getImage(path) {
  if (!path || !supabaseUrl) return ''
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`
}
