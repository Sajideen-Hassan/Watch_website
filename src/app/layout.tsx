import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import LenisScrollProvider from '@/components/providers/LenisScrollProvider'
import GSAPProvider from '@/components/providers/GSAPProvider'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Horologe — Time. Reimagined.',
  description: 'A luxury timepiece engineered for the modern era. Discover precision craftsmanship, smart features, and enduring design.',
  openGraph: {
    title: 'Horologe — Time. Reimagined.',
    description: 'A luxury timepiece engineered for the modern era.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-full bg-background text-foreground font-sans">
        <GSAPProvider>
          <LenisScrollProvider>
            {children}
          </LenisScrollProvider>
        </GSAPProvider>
      </body>
    </html>
  )
}
