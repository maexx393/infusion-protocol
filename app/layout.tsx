import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppKitProvider } from '@/components/appkit-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InFusion - AI-Powered Cross-Chain DeFi',
  description: 'AI-powered DeFi protocol for Cross-Chain swaps and portfolio management',
  authors: [{ name: 'InFusion Team' }],
  keywords: ['DeFi', 'AI', 'Cross-Chain', 'Bitcoin', 'Ethereum', 'NEAR', 'Solana', 'Atomic Swaps'],
  openGraph: {
    title: 'InFusion - AI-Powered Cross-Chain DeFi',
    description: 'AI-powered DeFi protocol for Cross-Chain swaps and portfolio management',
    url: 'https://infusion.defi',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InFusion - AI-Powered Cross-Chain DeFi',
    description: 'Revolutionary DeFi platform combining AI with cross-chain atomic swaps',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppKitProvider>
          {children}
        </AppKitProvider>
      </body>
    </html>
  )
} 