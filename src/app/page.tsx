import HeroReveal from '@/components/sections/HeroReveal'
import Craftsmanship from '@/components/sections/Craftsmanship'
import Engineering from '@/components/sections/Engineering'
import SmartFeatures from '@/components/sections/SmartFeatures'
import Lifestyle from '@/components/sections/Lifestyle'
import PerformanceBattery from '@/components/sections/PerformanceBattery'
import ColorVariants from '@/components/sections/ColorVariants'
import FinalCTA from '@/components/sections/FinalCTA'

export default function Home() {
  return (
    <main>
      <HeroReveal />
      <Craftsmanship />
      <Engineering />
      <SmartFeatures />
      <Lifestyle />
      <PerformanceBattery />
      <ColorVariants />
      <FinalCTA />
    </main>
  )
}
