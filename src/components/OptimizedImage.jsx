import { useState } from 'react'
import { getImage } from '../lib/assets'

export default function OptimizedImage({ path, src, alt = '', width, height, loading = 'lazy', decoding = 'async', className, style, ...rest }) {
  const [failed, setFailed] = useState(false)
  const imgSrc = path ? getImage(path) : src

  if (failed) {
    return <div className={className} style={{ ...style, width, height, background: '#0a0a0d' }} aria-hidden="true" />
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      className={className}
      style={style}
      onError={() => { if (import.meta.env.DEV) console.warn(`[assets] failed to load: ${path || src}`); setFailed(true) }}
      {...rest}
    />
  )
}
