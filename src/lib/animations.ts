import gsap from 'gsap'

export const GSAP_DEFAULTS = {
  ease: 'power3.out',
  duration: 1,
} as const

export const SCROLL_TRIGGER_DEFAULTS = {
  scrub: 1.5,
  anticipatePin: 1,
} as const

export const EASING = {
  power1: 'power1.out',
  power2: 'power2.out',
  power3: 'power3.out',
  power4: 'power4.out',
  elastic: 'elastic.out(1, 0.5)',
  bounce: 'bounce.out',
  slow: 'power4.inOut',
} as const

export function createSceneTimeline(
  trigger: string | Element,
  options?: {
    pin?: boolean
    scrub?: number | boolean
    markers?: boolean
    start?: string
    end?: string
    toggleActions?: string
  }
) {
  const {
    pin = true,
    scrub = 1.5,
    markers = false,
    start = 'top top',
    end = 'bottom top',
  } = options || {}

  return gsap.timeline({
    scrollTrigger: {
      trigger,
      pin,
      scrub,
      markers,
      start,
      end,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  })
}

export function fadeUp(el: string | Element, delay = 0) {
  return gsap.fromTo(
    el,
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 1, ease: EASING.power3, delay }
  )
}

export function fadeIn(el: string | Element, delay = 0) {
  return gsap.fromTo(
    el,
    { opacity: 0 },
    { opacity: 1, duration: 0.8, ease: EASING.power2, delay }
  )
}

export function scaleIn(el: string | Element, delay = 0) {
  return gsap.fromTo(
    el,
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1, duration: 1, ease: EASING.power3, delay }
  )
}
