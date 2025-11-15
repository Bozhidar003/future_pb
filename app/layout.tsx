import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Plinko Game - Casino Style Gambling',
  description: 'Play Plinko with realistic physics, multiple risk levels, and provably fair outcomes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
