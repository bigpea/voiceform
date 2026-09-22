import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VoiceForm — Compila moduli PDF con la voce',
  description: 'Compila moduli PDF della PA italiana usando solo la voce. Per persone con disabilità motoria.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={spaceGrotesk.className}>{children}</body>
    </html>
  )
}
