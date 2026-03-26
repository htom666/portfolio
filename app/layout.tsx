import type { Metadata } from 'next'
import { JetBrains_Mono, Press_Start_2P } from 'next/font/google'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const pressStart2P = Press_Start_2P({
  subsets: ['latin'],
  variable: '--font-pixel',
  weight: '400',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'tom — portfolio',
  description: 'UI/UX Designer · Developer · Researcher',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>▋</text></svg>",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${pressStart2P.variable}`}>
      <body className={jetbrainsMono.className}>{children}</body>
    </html>
  )
}
