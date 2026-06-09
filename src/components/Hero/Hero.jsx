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
      console.error(`Frame attempt ${attempt + 1}/${retries + 1} failed:`, url, err)
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
        ['Pinned', diag.isPinned ? 'YES' : 'NO'],
        ['Frame Source', diag.frameSource],
        ['Canvas', diag.canvasStatus],
        ['Scroll Dist', `${diag.scrollDist}px`],
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

export default function Hero() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const framesRef = useRef([])
  const logRef = useRef({ lastLoggedFrame: -1 })
  const renderedRef = useRef(-1)
  const loadedFlagRef = useRef(false)

  const [loadProgress, setLoadProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(1)
  const [diag, setDiag] = useState({
    currentFrame: 1, renderedFrame: -1,
    loadedCount: 0, scrollProgress: 0,
    isPinned: false, frameSource: '—',
    canvasStatus: 'Initializing', status: 'INIT',
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const LOG = true

    let stMain, stExit, rafId, loaderTimeout
    let isDestroyed = false
    let loadedCount = 0
    const failedFrames = new Set()
    let hasDrawnInitial = false

    const sd = Math.round(Math.max(window.innerHeight * 2, TOTAL_FRAMES * 12))

    // ── Fill canvas black immediately so it's never blank ────────────
    const fillDark = () => {
      if (!canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const parent = canvas.parentElement
      if (parent) {
        const rect = parent.getBoundingClientRect()
        canvas.width = Math.floor(rect.width * dpr)
        canvas.height = Math.floor(rect.height * dpr)
        canvas.style.width = rect.width + 'px'
        canvas.style.height = rect.height + 'px'
      } else {
        canvas.width = Math.floor(window.innerWidth * dpr)
        canvas.height = Math.floor(window.innerHeight * dpr)
        canvas.style.width = window.innerWidth + 'px'
        canvas.style.height = window.innerHeight + 'px'
      }
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      setDiag(d => ({ ...d, canvasStatus: 'Dark Fill', canvasW: canvas.width, canvasH: canvas.height }))
    }
    fillDark()

    // ── Frame drawing ───────────────────────────────────────────────
    const drawFrame = (index) => {
      const bm = framesRef.current[index]
      if (!bm || !canvas) return false
      const cover = getCoverParams(FRAME_W, FRAME_H, canvas.width, canvas.height)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(bm, cover.sx, cover.sy, cover.sw, cover.sh, 0, 0, canvas.width, canvas.height)
      renderedRef.current = index

      if (LOG && logRef.current.lastLoggedFrame !== index) {
        logRef.current.lastLoggedFrame = index
        console.log(`Rendered Frame: ${index} | Progress: ${Math.round((index / TOTAL_FRAMES) * 100)}%`)
      }
      return true
    }

    // ── Frame loaded callback ───────────────────────────────────────
    const onFrameLoaded = (index, bitmap) => {
      if (isDestroyed) return
      framesRef.current[index] = bitmap
      loadedCount++
      const pct = Math.floor((loadedCount / TOTAL_FRAMES) * 100)
      setLoadProgress(pct)

      if (LOG) console.log(`Frame loaded: ${index} (${pct}%)`)

      setDiag(d => ({
        ...d, loadedCount,
        status: loadedCount === TOTAL_FRAMES ? 'OK' : d.status,
      }))

      // Frame 1: draw immediately
      if (index === 1) {
        drawFrame(1)
        setCurrentFrame(1)
        hasDrawnInitial = true
        setDiag(d => ({ ...d, renderedFrame: 1, canvasStatus: 'Active' }))
        if (LOG) {
          console.log('Initial Frame Rendered')
          console.log('Frame 1 Visible')
          console.log('Canvas Ready')
        }
      }

      if (!loadedFlagRef.current && loadedCount >= PHASE_1_COUNT) {
        loadedFlagRef.current = true
        setIsReady(true)
        setDiag(d => ({ ...d, status: 'ACTIVE' }))
        if (LOG) console.log(`Phase 1 ready — ${loadedCount} frames loaded`)
      }
    }

    // ── Frame loader ───────────────────────────────────────────────
    const loadFrame = async (i) => {
      if (framesRef.current[i] || failedFrames.has(i)) return
      const url = `/frames-avif/frame_${String(i).padStart(4, '0')}.avif`
      const bitmap = await tryLoadFrame(url)
      if (bitmap) {
        onFrameLoaded(i, bitmap)
      } else {
        failedFrames.add(i)
        console.error('Frame failed permanently:', i, url)
      }
    }

    // ── Canvas resize ──────────────────────────────────────────────
    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const w = Math.floor(rect.width * dpr)
      const h = Math.floor(rect.height * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        canvas.style.width = rect.width + 'px'
        canvas.style.height = rect.height + 'px'
        // redraw last known frame
        const lastIdx = renderedRef.current
        if (lastIdx > 0 && framesRef.current[lastIdx]) {
          drawFrame(lastIdx)
        } else {
          ctx.fillStyle = '#0a0a0a'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        setDiag(d => ({ ...d, canvasW: w, canvasH: h }))
      }
    }

    window.addEventListener('resize', resize)

    // ── Phase 1: frames 1–20 ───────────────────────────────────────
    const phase1 = async () => {
      const batch = []
      for (let i = 1; i <= PHASE_1_COUNT; i++) batch.push(loadFrame(i))
      await Promise.all(batch)
    }

    // ── Phase 2: frames 21–130 ─────────────────────────────────────
    const phase2 = async () => {
      for (let i = PHASE_1_COUNT + 1; i <= TOTAL_FRAMES; i += BATCH_SIZE) {
        if (isDestroyed) return
        const batch = []
        for (let j = i; j < i + BATCH_SIZE && j <= TOTAL_FRAMES; j++) batch.push(loadFrame(j))
        await Promise.all(batch)
        await new Promise(r => requestAnimationFrame(r))
      }
      if (LOG) console.log('All 130 frames loaded')
      if (failedFrames.size > 0) {
        setDiag(d => ({ ...d, status: 'WARN' }))
        if (LOG) console.warn(`Failed frames: ${[...failedFrames].join(', ')}`)
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
        if (LOG) console.warn('Loader timeout — forcing ready')
      }
    }, LOADER_TIMEOUT)

    // ── ScrollTrigger: pin only ───────────────────────────────────
    stMain = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: `+=${sd}`,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    })

    // ── Exit overlay — fades over last 120px ─────────────────────
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

    // ── Render loop — frame from stMain.progress directly ──────────
    function renderLoop(ts) {
      if (isDestroyed) return

      const progress = stMain ? stMain.progress : 0
      const pinned = stMain ? stMain.isActive : false

      // frame = floor(progress * (TOTAL_FRAMES - 1)) + 1
      // progress 0 → frame 1, progress 1 → frame 130
      const rawTarget = Math.floor(progress * (TOTAL_FRAMES - 1)) + 1
      const clampedTarget = Math.max(1, Math.min(TOTAL_FRAMES, rawTarget))

      // resolution: find nearest loaded frame
      let drawTarget = -1
      if (framesRef.current[clampedTarget]) {
        drawTarget = clampedTarget
      } else {
        for (let i = clampedTarget; i >= 1; i--) {
          if (framesRef.current[i]) { drawTarget = i; break }
        }
        if (drawTarget === -1) {
          for (let i = clampedTarget + 1; i <= TOTAL_FRAMES; i++) {
            if (framesRef.current[i]) { drawTarget = i; break }
          }
        }
      }

      const displayFrame = Math.max(clampedTarget, 1)
      setCurrentFrame(displayFrame)

      // source label for diagnostics
      let source = '—'
      if (drawTarget === clampedTarget) source = 'direct'
      else if (drawTarget > 0 && drawTarget < clampedTarget) source = `fallback_bwd_${clampedTarget - drawTarget}`
      else if (drawTarget > clampedTarget) source = `fallback_fwd_${drawTarget - clampedTarget}`
      else source = 'unavailable'

      setDiag(d => ({
        ...d, currentFrame: displayFrame,
        renderedFrame: renderedRef.current,
        scrollProgress: Math.round(progress * 100),
        isPinned: pinned, frameSource: source,
      }))

      // draw if we have a valid target and it differs from last drawn
      if (drawTarget > 0 && drawTarget !== renderedRef.current && framesRef.current[drawTarget]) {
        drawFrame(drawTarget)
      }

      rafId = requestAnimationFrame(renderLoop)
    }

    rafId = requestAnimationFrame(renderLoop)

    // ── Cleanup ──────────────────────────────────────────────────
    return () => {
      isDestroyed = true
      if (stMain) stMain.kill()
      if (stExit) stExit.kill()
      if (rafId) cancelAnimationFrame(rafId)
      clearTimeout(loaderTimeout)
      window.removeEventListener('resize', resize)
      framesRef.current.forEach(b => { if (b && typeof b.close === 'function') b.close() })
      framesRef.current.length = 0
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

      <FrameOverlay frame={currentFrame} total={TOTAL_FRAMES} />
      <Debug diag={diag} />
    </section>
  )
}
