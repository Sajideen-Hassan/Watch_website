import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Hero.module.scss'

gsap.registerPlugin(ScrollTrigger)

const FRAME_W = 1920
const FRAME_H = 1080
const TOTAL_FRAMES = 130
const PHASE_1_COUNT = 20
const BATCH_SIZE = 6
const MAX_RETRIES = 2
const LOADER_TIMEOUT = 8000
const MAX_DPR = 2

function getCoverParams(imgW, imgH, cw, ch) {
  const cr = cw / ch
  const ir = imgW / imgH
  if (ir > cr) {
    const sw = imgH * cr
    return { sx: (imgW - sw) / 2, sy: 0, sw, sh: imgH }
  }
  const sh = imgW / cr
  return { sx: 0, sy: (imgH - sh) / 2, sw: imgW, sh }
}

async function tryLoadFrame(url, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      if ('createImageBitmap' in window) {
        return await createImageBitmap(blob)
      }
      return await new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => { img.decode().then(() => resolve(img)).catch(() => resolve(img)) }
        img.onerror = () => reject(new Error('Image decode failed'))
        img.src = URL.createObjectURL(blob)
      })
    } catch (err) {
      if (attempt < retries) await new Promise(r => setTimeout(r, 200 * (attempt + 1)))
    }
  }
  return null
}

function Debug({ diag }) {
  const statusColor = diag.status === 'OK' ? '#4ade80' : diag.status === 'WARN' ? '#facc15' : '#f87171'
  return (
    <div className={styles.diagnosticsPanel}>
      <div className={styles.diagTitle}>Sequence Diagnostics</div>
      {[
        ['Current Frame', `${String(diag.currentFrame).padStart(3, '0')} / ${TOTAL_FRAMES}`],
        ['Rendered Frame', diag.renderedFrame > 0 ? String(diag.renderedFrame).padStart(3, '0') : '—'],
        ['Loaded', `${diag.loadedCount} / ${TOTAL_FRAMES}`],
        ['Scroll Progress', `${diag.scrollProgress}%`],
        ['Canvas', `${diag.cw}×${diag.ch}`],
      ].map(([label, value]) => (
        <div className={styles.diagRow} key={label}>
          <span>{label}</span>
          <span>{value}</span>
        </div>
      ))}
      <div className={styles.diagRow} style={{ marginTop: '0.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.25rem' }}>
        <span>Status</span>
        <span style={{ color: statusColor }}>{diag.status}</span>
      </div>
    </div>
  )
}

function FrameOverlay({ frame, total }) {
  return (
    <div className={styles.frameOverlay}>
      <span className={styles.frameNumber}>{String(frame).padStart(3, '0')}</span>
      <span className={styles.frameTotal}>{total}</span>
    </div>
  )
}

let cachedCoverParams = null

export default function Hero() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const framesRef = useRef([])
  const renderedRef = useRef(-1)
  const lastDrawFrameRef = useRef(-1)
  const loadedFlagRef = useRef(false)
  const dimsRef = useRef({ w: 0, h: 0 })

  const [loadProgress, setLoadProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(1)
  const [diag, setDiag] = useState({
    currentFrame: 1, renderedFrame: -1,
    loadedCount: 0, scrollProgress: 0,
    status: 'INIT', cw: 0, ch: 0,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let stMain, stExit, rafId, loaderTimeout
    let isDestroyed = false
    let loadedCount = 0
    const failedFrames = new Set()

    const sd = Math.round(Math.max(window.innerHeight * 2, TOTAL_FRAMES * 12))

    const setupCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const cw = Math.floor(window.innerWidth)
      const ch = Math.floor(window.innerHeight)
      const pw = Math.floor(cw * dpr)
      const ph = Math.floor(ch * dpr)

      canvas.width = pw
      canvas.height = ph
      canvas.style.width = cw + 'px'
      canvas.style.height = ch + 'px'

      dimsRef.current = { w: pw, h: ph, cw, ch }

      cachedCoverParams = getCoverParams(FRAME_W, FRAME_H, pw, ph)

      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, pw, ph)

      setDiag(d => ({ ...d, cw: pw, ch: ph, canvasStatus: 'Active' }))
    }

    setupCanvas()

    const drawFrame = (index) => {
      const bm = framesRef.current[index]
      if (!bm || !canvas) return false
      const cp = cachedCoverParams
      if (lastDrawFrameRef.current === index) return true
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(bm, cp.sx, cp.sy, cp.sw, cp.sh, 0, 0, canvas.width, canvas.height)
      renderedRef.current = index
      lastDrawFrameRef.current = index
      return true
    }

    const onFrameLoaded = (index, bitmap) => {
      if (isDestroyed) return
      framesRef.current[index] = bitmap
      loadedCount++
      const pct = Math.floor((loadedCount / TOTAL_FRAMES) * 100)
      setLoadProgress(pct)

      setDiag(d => ({ ...d, loadedCount, status: loadedCount === TOTAL_FRAMES ? 'OK' : d.status }))

      if (index === 1) {
        drawFrame(1)
        setCurrentFrame(1)
        setDiag(d => ({ ...d, renderedFrame: 1 }))
      }

      if (!loadedFlagRef.current && loadedCount >= PHASE_1_COUNT) {
        loadedFlagRef.current = true
        setIsReady(true)
        setDiag(d => ({ ...d, status: 'ACTIVE' }))
      }
    }

    const loadFrame = async (i) => {
      if (framesRef.current[i] || failedFrames.has(i)) return
      const url = `/frames-avif/frame_${String(i).padStart(4, '0')}.avif`
      const bitmap = await tryLoadFrame(url)
      if (bitmap) {
        onFrameLoaded(i, bitmap)
      } else {
        failedFrames.add(i)
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const cw = Math.floor(window.innerWidth)
      const ch = Math.floor(window.innerHeight)
      const pw = Math.floor(cw * dpr)
      const ph = Math.floor(ch * dpr)

      if (canvas.width === pw && canvas.height === ph) return

      canvas.width = pw
      canvas.height = ph
      canvas.style.width = cw + 'px'
      canvas.style.height = ch + 'px'

      dimsRef.current = { w: pw, h: ph, cw, ch }
      cachedCoverParams = getCoverParams(FRAME_W, FRAME_H, pw, ph)

      const lastIdx = renderedRef.current
      if (lastIdx > 0 && framesRef.current[lastIdx]) {
        drawFrame(lastIdx)
      } else {
        ctx.fillStyle = '#0a0a0a'
        ctx.fillRect(0, 0, pw, ph)
      }
      setDiag(d => ({ ...d, cw: pw, ch: ph }))
      ScrollTrigger.refresh()
    }

    window.addEventListener('resize', resize)

    const phase1 = async () => {
      const batch = []
      for (let i = 1; i <= PHASE_1_COUNT; i++) batch.push(loadFrame(i))
      await Promise.all(batch)
    }

    const phase2 = async () => {
      for (let i = PHASE_1_COUNT + 1; i <= TOTAL_FRAMES; i += BATCH_SIZE) {
        if (isDestroyed) return
        const batch = []
        for (let j = i; j < i + BATCH_SIZE && j <= TOTAL_FRAMES; j++) batch.push(loadFrame(j))
        await Promise.all(batch)
        await new Promise(r => requestAnimationFrame(r))
      }
      if (failedFrames.size > 0) {
        setDiag(d => ({ ...d, status: 'WARN' }))
      } else {
        setDiag(d => ({ ...d, status: 'OK' }))
      }
    }

    phase1().then(() => { phase2() })

    loaderTimeout = setTimeout(() => {
      if (!loadedFlagRef.current) {
        loadedFlagRef.current = true
        setIsReady(true)
        setDiag(d => ({ ...d, status: 'WARN' }))
      }
    }, LOADER_TIMEOUT)

    stMain = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: `+=${sd}`,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    })

    const exitEl = sectionRef.current.querySelector('.' + styles.exitOverlay)
    if (exitEl) {
      stExit = gsap.to(exitEl, {
        opacity: 1,
        ease: 'power2.in',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: `top+=${sd - 120}`,
          end: `+=120`,
          scrub: true,
        },
      })
    }

    ScrollTrigger.refresh()

    function computeFrame(progress) {
      const raw = Math.floor(progress * (TOTAL_FRAMES - 1)) + 1
      return Math.max(1, Math.min(TOTAL_FRAMES, raw))
    }

    function resolveFrame(target) {
      if (framesRef.current[target]) return target
      for (let i = target; i >= 1; i--) {
        if (framesRef.current[i]) return i
      }
      for (let i = target + 1; i <= TOTAL_FRAMES; i++) {
        if (framesRef.current[i]) return i
      }
      return -1
    }

    function renderLoop() {
      if (isDestroyed) return

      const progress = stMain ? stMain.progress : 0
      const target = computeFrame(progress)
      const drawTarget = resolveFrame(target)
      const displayFrame = Math.max(target, 1)

      if (displayFrame !== lastDrawFrameRef.current) {
        setCurrentFrame(displayFrame)
        setDiag(d => ({
          ...d,
          currentFrame: displayFrame,
          renderedFrame: renderedRef.current,
          scrollProgress: Math.round(progress * 100),
        }))
      }

      if (drawTarget > 0 && drawTarget !== renderedRef.current) {
        drawFrame(drawTarget)
      }

      rafId = requestAnimationFrame(renderLoop)
    }

    rafId = requestAnimationFrame(renderLoop)

    return () => {
      isDestroyed = true
      if (stMain) stMain.kill()
      if (stExit) stExit.kill()
      if (rafId) cancelAnimationFrame(rafId)
      clearTimeout(loaderTimeout)
      window.removeEventListener('resize', resize)
      framesRef.current.forEach(b => { if (b && typeof b.close === 'function') b.close() })
      framesRef.current.length = 0
      cachedCoverParams = null
    }
  }, [])

  return (
    <section id="home" ref={sectionRef} className={styles.hero}>
      <div className={`${styles.loaderOverlay} ${isReady ? styles.ready : ''}`}>
        <div className={styles.loaderInner}>
          <svg className={styles.loaderIcon} viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.25">
            <circle cx="14" cy="14" r="11" />
            <path d="M14 7v7l5 3" />
          </svg>
          <div className={styles.loaderTitle}>Loading Experience</div>
          <div className={styles.loaderPct}>{loadProgress}%</div>
          <div className={styles.loaderBar}>
            <div className={styles.loaderFill} style={{ width: `${loadProgress}%` }} />
          </div>
        </div>
      </div>

      <div className={styles.canvasWrapper}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>

      <div className={styles.exitOverlay} />

      <div className={`${styles.scrollIndicator} ${currentFrame === 1 && isReady ? styles.scrollVisible : ''}`}>
        <div className={styles.scrollArrow}>
          <svg width="20" height="32" viewBox="0 0 20 32" fill="none">
            <rect x="1.5" y="1.5" width="17" height="29" rx="8.5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="10" cy="11" r="2" fill="currentColor" className={styles.scrollDot} />
          </svg>
        </div>
        <span className={styles.scrollText}>Disquiet Your Ambition</span>
      </div>

      <FrameOverlay frame={currentFrame} total={TOTAL_FRAMES} />
      <Debug diag={diag} />
    </section>
  )
}
