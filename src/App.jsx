import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import BrandIntro from './components/BrandIntro/BrandIntro'
import About from './components/About/About'
import Features from './components/Features/Features'
import Collection from './components/Collection/Collection'
import Craftsmanship from './components/Craftsmanship/Craftsmanship'
import BuySection from './components/BuySection/BuySection'
import Footer from './components/Footer/Footer'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const lenisRef = useRef(null)

  useEffect(() => {
    let lenis = null
    const tickerFn = (time) => { if (lenis) lenis.raf(time * 1000) }

    const initLenis = () => {
      lenis = new Lenis({
        duration: 2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: true,
      })

      lenisRef.current = lenis
      window.__lenis = lenis

      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(tickerFn)
      gsap.ticker.lagSmoothing(0)
    }

    const id = 'requestIdleCallback' in window
      ? requestIdleCallback(initLenis, { timeout: 2000 })
      : setTimeout(initLenis, 100)

    return () => {
      if (typeof id === 'number') clearTimeout(id)
      else cancelIdleCallback(id)
      if (lenis) {
        gsap.ticker.remove(tickerFn)
        lenis.destroy()
      }
      window.__lenis = null
      lenisRef.current = null
    }
  }, [])

  return (
    <>
      <Navbar />
      <h1 className="sr-only">REISER — Swiss Luxury Timepieces</h1>
      <main>
        <Hero />
        <BrandIntro />
        <About />
        <Features />
        <Collection />
        <Craftsmanship />
        <BuySection />
      </main>
      <Footer />
    </>
  )
}

export default App
