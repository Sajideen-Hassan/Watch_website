import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Hero.module.scss'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)

  // System States
  const [loadProgress, setLoadProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [stats, setStats] = useState({ fps: 0, currentFrame: 1, loadedCount: 0 })

  useEffect(() => {
    let stMain
    let stAnim
    let rafId
    let isDestroyed = false
    
    // FPS tracking vars
    let lastTime = performance.now()
    let frameCountTime = 0
    let currentFps = 0

    const initAnimation = async () => {
      try {
        // 1. Fetch metadata
        const res = await fetch('/frames-avif/meta.json')
        if (!res.ok) throw new Error('meta.json not found')
        const meta = await res.json()
        const totalFrames = meta.frameCount || 150

        const canvas = canvasRef.current
        if (!canvas) return
        const context = canvas.getContext('2d') // Standard context

        // Set native canvas resolution to source HD format
        canvas.width = 1920
        canvas.height = 1080

        const bitmaps = new Array(totalFrames + 1)
        let loadedCount = 0
        const REQUIRED_INITIAL_FRAMES = Math.min(2, totalFrames)

        // 2. Robust frame loader with createImageBitmap + standard Image() fallback
        const loadFrame = async (i) => {
          if (isDestroyed) return
          const index = i.toString().padStart(4, '0')
          const url = `/frames-avif/frame_${index}.avif`
          
          try {
            const response = await fetch(url)
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            
            const blob = await response.blob()
            
            // Attempt off-thread decoding first (fastest, no jank)
            try {
              const bitmap = await createImageBitmap(blob)
              bitmaps[i] = bitmap
            } catch (bitmapError) {
              // FALLBACK: If browser rejects AVIF in createImageBitmap, use native Image
              const img = new Image()
              img.src = URL.createObjectURL(blob)
              await new Promise((resolve, reject) => {
                img.onload = () => resolve()
                img.onerror = () => reject(new Error('Image fallback load failed'))
              })
              bitmaps[i] = img
            }

            loadedCount++
            setLoadProgress(Math.floor((loadedCount / totalFrames) * 100))

            // If we hit our initial threshold, unlock the UI
            if (loadedCount === REQUIRED_INITIAL_FRAMES) {
              setIsReady(true)
            }
          } catch (e) {
            console.error("Frame failed:", i, e)
            // Sequence will continue; render loop handles missing frames
          }
        }

        // 3. Priority Preloader Queue
        const preloadSequence = async () => {
           // Eagerly load the critical first batch sequentially
           for (let i = 1; i <= REQUIRED_INITIAL_FRAMES; i++) {
             await loadFrame(i)
           }
           
           // Background load the rest in non-blocking chunks
           const CHUNK_SIZE = 4
           for (let i = REQUIRED_INITIAL_FRAMES + 1; i <= totalFrames; i += CHUNK_SIZE) {
             if (isDestroyed) break
             const promises = []
             for (let j = i; j < i + CHUNK_SIZE && j <= totalFrames; j++) {
               promises.push(loadFrame(j))
             }
             await Promise.all(promises)
             
             // Yield strictly to the main thread event loop to prevent scroll locking
             await new Promise(resolve => requestAnimationFrame(resolve))
           }
        }
        
        preloadSequence()

        // 4. Scroll Trigger Setup
        const playhead = { frame: 1 }
        const scrollDistance = totalFrames * 25 // Scroll duration multiplier

        stMain = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${scrollDistance}`,
          pin: true,
          pinSpacing: true
        })

        // GSAP animates the playhead virtual object (no direct rendering here)
        stAnim = gsap.to(playhead, {
          frame: totalFrames,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: `+=${scrollDistance}`,
            scrub: 0.1, // Near-instant interpolation
          }
        })
        
        // Refresh ScrollTrigger since we created these asynchronously
        ScrollTrigger.refresh()

        // 5. Standalone requestAnimationFrame Render Loop
        let lastDrawnFrame = -1

        const renderLoop = (time) => {
          if (isDestroyed) return

          // FPS calculation
          frameCountTime++
          if (time - lastTime >= 1000) {
            currentFps = frameCountTime
            frameCountTime = 0
            lastTime = time
          }

          // Determine target integer frame
          let targetFrame = Math.round(playhead.frame)
          
          // Safety Check: Nearest loaded frame search
          if (!bitmaps[targetFrame]) {
            let found = false
            for (let i = targetFrame; i >= 1; i--) {
              if (bitmaps[i]) {
                targetFrame = i
                found = true
                break
              }
            }
            if (!found) targetFrame = lastDrawnFrame // if nothing before, hold current
          }

          // Only draw if frame has changed and exists
          if (targetFrame !== lastDrawnFrame && bitmaps[targetFrame]) {
            context.clearRect(0, 0, canvas.width, canvas.height)
            context.drawImage(bitmaps[targetFrame], 0, 0, canvas.width, canvas.height)
            lastDrawnFrame = targetFrame
            
            // Throttle state updates slightly to avoid React render thrashing
            if (targetFrame % 3 === 0) {
              setStats(s => ({ ...s, currentFrame: targetFrame, fps: currentFps }))
            }
          } else {
             // Keep tracking FPS even if idle
             setStats(s => ({ ...s, fps: currentFps }))
          }

          rafId = requestAnimationFrame(renderLoop)
        }

        rafId = requestAnimationFrame(renderLoop)

      } catch (err) {
        console.error("Error initializing sequence", err)
      }
    }

    initAnimation()

    return () => {
      isDestroyed = true
      if (stMain) stMain.kill()
      if (stAnim) stAnim.kill()
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <section id="home" ref={sectionRef} className={styles.hero}>
      {/* ─── Loading Overlay ─── */}
      <div className={`${styles.loaderOverlay} ${isReady ? styles.ready : ''}`}>
        <div className={styles.loaderText}>Initializing Engine {loadProgress}%</div>
        <div className={styles.loaderBar}>
          <div className={styles.loaderFill} style={{ width: `${loadProgress}%` }} />
        </div>
      </div>

      {/* ─── Background Canvas ─── */}
      <div className={styles.canvasWrapper}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>

    </section>
  )
}
