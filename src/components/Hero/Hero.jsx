import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Hero.module.scss'
import { FRAME_URLS, TOTAL_FRAMES, FRAME_W, FRAME_H } from '../../lib/supabase'

const PRIORITY_COUNT = 12
const MAX_CONCURRENCY = 8
const MAX_RETRIES = 1
const LOADER_TIMEOUT = 8000
const MAX_DPR = 2
const MOBILE_BREAKPOINT = 768
const MOBILE_WINDOW = 40
const NEARBY_RADIUS = 20
const BACKGROUND_BATCH = 4

function isMobile() {
  return window.innerWidth < MOBILE_BREAKPOINT
}

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

async function loadBitmap(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const blob = await res.blob()
  if ('createImageBitmap' in window) {
    return createImageBitmap(blob)
  }
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => { img.decode().then(() => resolve(img)).catch(() => resolve(img)) }
    img.onerror = () => reject(new Error('Image decode failed'))
    img.src = URL.createObjectURL(blob)
  })
}

async function loadWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await loadBitmap(url)
    } catch {
      if (attempt < retries) await new Promise(r => setTimeout(r, 200))
    }
  }
  return null
}

function getMemoryInfo() {
  try {
    const mem = performance.memory
    if (mem) {
      return `${Math.round(mem.usedJSHeapSize / 1048576)}MB`
    }
  } catch {}
  return '—'
}

function Debug({ diag }) {
  const statusColor = diag.status === 'OK' ? '#4ade80' : diag.status === 'WARN' ? '#facc15' : '#f87171'
  return (
    <div className={styles.diagnosticsPanel}>
      <div className={styles.diagTitle}>Sequence Diagnostics</div>
      {[
        ['Current Frame', `${String(diag.currentFrame).padStart(3, '0')} / ${TOTAL_FRAMES}`],
        ['Rendered', diag.renderedFrame > 0 ? String(diag.renderedFrame).padStart(3, '0') : '—'],
        ['Loaded', `${diag.loadedCount} / ${TOTAL_FRAMES}`],
        ['Missing', `${diag.missingCount}`],
        ['FPS', `${diag.fps}`],
        ['Scroll', `${diag.scrollProgress}%`],
        ['Canvas', `${diag.cw}×${diag.ch}`],
        ['Network', diag.activeRequests > 0 ? `${diag.activeRequests} active` : 'idle'],
        ['Memory', diag.memory],
        ['Cache', diag.cacheHits > 0 ? `${diag.cacheHits} hits` : '—'],
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

function Loader({ progress, isReady, firstFrameReady }) {
  const showLoader = !isReady
  return (
    <div className={`${styles.loaderOverlay} ${showLoader ? '' : styles.ready}`}>
      {!firstFrameReady && (
        <div className={styles.loaderInner}>
          <svg className={styles.loaderIcon} viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.25">
            <circle cx="14" cy="14" r="11" />
            <path d="M14 7v7l5 3" />
          </svg>
          <div className={styles.loaderTitle}>Loading Experience</div>
          <div className={styles.loaderPct}>{progress}%</div>
          <div className={styles.loaderBar}>
            <div className={styles.loaderFill} style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      {firstFrameReady && !isReady && (
        <div className={styles.quickLoader}>
          <div className={styles.quickLoaderFill} style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      )}
    </div>
  )
}

let cachedCoverParams = null

export default function Hero() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const framesRef = useRef([])
  const prevDrawFrameRef = useRef(-1)
  const prevRenderedRef = useRef(-1)
  const framesLoadedRef = useRef(null)
  const framesFailedRef = useRef(null)
  const framesPendingRef = useRef(null)
  const isReadyRef = useRef(false)
  const firstFrameReadyRef = useRef(false)
  const isMobileRef = useRef(false)
  const cacheHitCountRef = useRef(0)
  const cacheTrackedRef = useRef(null)

  if (!framesLoadedRef.current) framesLoadedRef.current = new Set()
  if (!framesFailedRef.current) framesFailedRef.current = new Set()
  if (!framesPendingRef.current) framesPendingRef.current = new Set()
  if (!cacheTrackedRef.current) cacheTrackedRef.current = new Set()

  const [loadProgress, setLoadProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [firstFrameReady, setFirstFrameReady] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(1)
  const [diag, setDiag] = useState({
    currentFrame: 1, renderedFrame: -1,
    loadedCount: 0, missingCount: 0,
    scrollProgress: 0, fps: 0,
    status: 'INIT', cw: 0, ch: 0,
    activeRequests: 0, memory: '—', cacheHits: 0,
  })

  const updateDiag = useCallback((patch) => {
    setDiag(d => ({ ...d, ...patch }))
  }, [])

  const refreshDiagnostics = useCallback(() => {
    updateDiag({ memory: getMemoryInfo(), cacheHits: cacheHitCountRef.current })
  }, [updateDiag])

  const onFrameLoaded = useCallback((index, bitmap) => {
    if (canvasRef.current === null) return
    framesRef.current[index] = bitmap
    framesLoadedRef.current.add(index)

    const loadedCount = framesLoadedRef.current.size
    const failedCount = framesFailedRef.current.size
    const pct = Math.floor((loadedCount / TOTAL_FRAMES) * 100)
    setLoadProgress(pct)

    updateDiag({
      loadedCount,
      missingCount: failedCount,
      activeRequests: framesPendingRef.current.size,
      memory: getMemoryInfo(),
    })

    if (index === 1 && !firstFrameReadyRef.current) {
      firstFrameReadyRef.current = true
      setFirstFrameReady(true)
      drawFrame(1)
      setCurrentFrame(1)
      updateDiag({ renderedFrame: 1 })
    }

    if (!isReadyRef.current && loadedCount >= PRIORITY_COUNT) {
      isReadyRef.current = true
      setIsReady(true)
      updateDiag({ status: 'ACTIVE' })
    }

    if (loadedCount + failedCount >= TOTAL_FRAMES) {
      updateDiag({ status: failedCount > 0 ? 'WARN' : 'OK' })
    }
  }, [updateDiag])

  const drawFrame = useCallback((index) => {
    const bm = framesRef.current[index]
    const canvas = canvasRef.current
    if (!bm || !canvas || !cachedCoverParams) return false
    if (prevDrawFrameRef.current === index) return true
    const ctx = canvas.getContext('2d')
    const cp = cachedCoverParams
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(bm, cp.sx, cp.sy, cp.sw, cp.sh, 0, 0, canvas.width, canvas.height)
    prevDrawFrameRef.current = index
    prevRenderedRef.current = index
    return true
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let stMain, stExit, rafId, loaderTimeout, diagInterval
    let isDestroyed = false
    let frameTimings = []
    let lastFpsUpdate = 0

    isMobileRef.current = isMobile()
    let currentCanvasWidth = 0
    let currentCanvasHeight = 0

    const sd = Math.round(Math.max(window.innerHeight * 2, TOTAL_FRAMES * 12))

    function setupCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const cw = Math.floor(window.innerWidth)
      const ch = Math.floor(window.innerHeight)
      const pw = Math.floor(cw * dpr)
      const ph = Math.floor(ch * dpr)

      currentCanvasWidth = pw
      currentCanvasHeight = ph
      canvas.width = pw
      canvas.height = ph
      canvas.style.width = cw + 'px'
      canvas.style.height = ch + 'px'

      cachedCoverParams = getCoverParams(FRAME_W, FRAME_H, pw, ph)

      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, pw, ph)
      updateDiag({ cw: pw, ch: ph })
    }

    setupCanvas()

    function handleResize() {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const cw = Math.floor(window.innerWidth)
      const ch = Math.floor(window.innerHeight)
      const pw = Math.floor(cw * dpr)
      const ph = Math.floor(ch * dpr)

      if (pw === currentCanvasWidth && ph === currentCanvasHeight) return

      canvas.width = pw
      canvas.height = ph
      canvas.style.width = cw + 'px'
      canvas.style.height = ch + 'px'

      currentCanvasWidth = pw
      currentCanvasHeight = ph
      cachedCoverParams = getCoverParams(FRAME_W, FRAME_H, pw, ph)

      const lastRendered = prevRenderedRef.current
      if (lastRendered > 0 && framesRef.current[lastRendered]) {
        const bm = framesRef.current[lastRendered]
        const cp = cachedCoverParams
        ctx.clearRect(0, 0, pw, ph)
        ctx.drawImage(bm, cp.sx, cp.sy, cp.sw, cp.sh, 0, 0, pw, ph)
      } else {
        ctx.fillStyle = '#0a0a0a'
        ctx.fillRect(0, 0, pw, ph)
      }
      updateDiag({ cw: pw, ch: ph })
      ScrollTrigger.refresh()
    }

    window.addEventListener('resize', handleResize)

    function updateFps(now) {
      frameTimings.push(now)
      while (frameTimings.length > 0 && frameTimings[0] < now - 1000) frameTimings.shift()
      if (now - lastFpsUpdate > 500) {
        lastFpsUpdate = now
        return frameTimings.length
      }
      return null
    }

    async function loadSingleFrame(index) {
      if (framesLoadedRef.current.has(index) || framesFailedRef.current.has(index) || framesPendingRef.current.has(index)) return null

      const url = FRAME_URLS[index - 1]

      if (cacheTrackedRef.current.has(url)) {
        cacheHitCountRef.current++
      } else {
        cacheTrackedRef.current.add(url)
      }

      framesPendingRef.current.add(index)
      updateDiag({ activeRequests: framesPendingRef.current.size })

      const bitmap = await loadWithRetry(url)
      framesPendingRef.current.delete(index)

      if (bitmap) {
        onFrameLoaded(index, bitmap)
        return bitmap
      }
      framesFailedRef.current.add(index)
      updateDiag({
        missingCount: framesFailedRef.current.size,
        activeRequests: framesPendingRef.current.size,
        status: 'WARN',
      })
      return null
    }

    async function loadPriorityFrames() {
      const indices = Array.from({ length: PRIORITY_COUNT }, (_, i) => i + 1)
      async function loadNext() {
        while (indices.length > 0) {
          const idx = indices.shift()
          await loadSingleFrame(idx)
        }
      }
      const workers = Array.from({ length: MAX_CONCURRENCY }, () => loadNext())
      await Promise.all(workers)
    }

    async function loadNearbyFrames(target) {
      const nearby = []
      for (let offset = 1; offset <= NEARBY_RADIUS; offset++) {
        const forward = target + offset
        const backward = target - offset
        if (forward >= 1 && forward <= TOTAL_FRAMES && !framesLoadedRef.current.has(forward) && !framesFailedRef.current.has(forward)) {
          nearby.push(forward)
        }
        if (backward >= 1 && backward <= TOTAL_FRAMES && !framesLoadedRef.current.has(backward) && !framesFailedRef.current.has(backward)) {
          nearby.push(backward)
        }
      }
      if (nearby.length === 0) return
      async function loadNext() {
        while (nearby.length > 0) {
          const idx = nearby.shift()
          if (framesLoadedRef.current.has(idx) || framesFailedRef.current.has(idx)) continue
          await loadSingleFrame(idx)
        }
      }
      const workers = Array.from({ length: Math.min(MAX_CONCURRENCY, nearby.length + 1) }, () => loadNext())
      await Promise.all(workers)
    }

    async function loadRemainingFrames() {
      const indices = []
      for (let i = PRIORITY_COUNT + 1; i <= TOTAL_FRAMES; i++) {
        indices.push(i)
      }
      while (indices.length > 0) {
        if (isDestroyed) return
        const batch = indices.splice(0, BACKGROUND_BATCH)
        async function loadNext() {
          while (batch.length > 0) {
            if (isDestroyed) return
            const idx = batch.shift()
            if (framesLoadedRef.current.has(idx) || framesFailedRef.current.has(idx)) continue
            await loadSingleFrame(idx)
          }
        }
        const workers = Array.from({ length: Math.min(MAX_CONCURRENCY, batch.length + 1) }, () => loadNext())
        await Promise.all(workers)
        if (!isDestroyed) await new Promise(r => setTimeout(r, 0))
      }
    }

    function releaseUnusedFrames(currentTarget) {
      if (!isMobileRef.current) return
      const halfWindow = MOBILE_WINDOW / 2
      const start = Math.max(1, currentTarget - halfWindow)
      const end = Math.min(TOTAL_FRAMES, currentTarget + halfWindow)

      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        if (i < start || i > end) {
          const bm = framesRef.current[i]
          if (bm && typeof bm.close === 'function') {
            bm.close()
          }
          framesRef.current[i] = null
          framesLoadedRef.current.delete(i)
        }
      }
    }

    loadPriorityFrames().then(() => {
      if (isDestroyed) return
      updateDiag({ status: 'ACTIVE' })
      loadRemainingFrames()
    })

    loaderTimeout = setTimeout(() => {
      if (!isReadyRef.current) {
        isReadyRef.current = true
        setIsReady(true)
        updateDiag({ status: 'WARN' })
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

    let nearbyLoadScheduled = false

    function scheduleNearbyLoad(target) {
      if (nearbyLoadScheduled) return
      nearbyLoadScheduled = true
      requestAnimationFrame(() => {
        nearbyLoadScheduled = false
        if (!isDestroyed && isReadyRef.current) {
          loadNearbyFrames(target)
        }
      })
    }

    function renderLoop(timestamp) {
      if (isDestroyed) return

      const progress = stMain ? stMain.progress : 0
      const target = computeFrame(progress)
      const drawTarget = resolveFrame(target)
      const displayFrame = Math.max(target, 1)

      const fps = updateFps(timestamp)

      if (displayFrame !== prevDrawFrameRef.current) {
        setCurrentFrame(displayFrame)
        updateDiag({
          currentFrame: displayFrame,
          renderedFrame: prevRenderedRef.current,
          scrollProgress: Math.round(progress * 100),
          fps: fps !== null ? fps : 0,
        })
      }

      if (drawTarget > 0 && drawTarget !== prevRenderedRef.current) {
        drawFrame(drawTarget)
      }

      if (isReadyRef.current) {
        scheduleNearbyLoad(target)
      }

      if (isMobileRef.current) {
        releaseUnusedFrames(target)
      }

      rafId = requestAnimationFrame(renderLoop)
    }

    rafId = requestAnimationFrame(renderLoop)

    diagInterval = setInterval(refreshDiagnostics, 2000)

    return () => {
      isDestroyed = true
      if (stMain) stMain.kill()
      if (stExit) stExit.kill()
      if (rafId) cancelAnimationFrame(rafId)
      clearTimeout(loaderTimeout)
      clearInterval(diagInterval)
      window.removeEventListener('resize', handleResize)
      for (const bm of framesRef.current) {
        if (bm && typeof bm.close === 'function') bm.close()
      }
      framesRef.current.length = 0
      framesLoadedRef.current.clear()
      framesFailedRef.current.clear()
      framesPendingRef.current.clear()
      cacheTrackedRef.current.clear()
      cacheHitCountRef.current = 0
      cachedCoverParams = null
    }
  }, [drawFrame, onFrameLoaded, updateDiag, refreshDiagnostics])

  return (
    <section id="home" ref={sectionRef} className={styles.hero}>
      <Loader progress={loadProgress} isReady={isReady} firstFrameReady={firstFrameReady} />

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
