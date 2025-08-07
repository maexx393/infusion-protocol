import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'InFusion - Agentic AI Cross-Chain Atomic Swaps',
  description: 'Revolutionary DeFi platform combining real AI agents with cross-chain atomic swaps across Solana, EVM, NEAR, Bitcoin, and Algorand networks for production-ready revenue generation.',
  authors: [{ name: 'InFusion Team' }],
  keywords: [
    'DeFi', 'AI Agents', 'Atomic Swaps', 'Cross-Chain', 'Solana', 'EVM', 'NEAR', 'Bitcoin', 'Algorand',
    'Agentic AI', 'OpenAI', 'Production Trading', 'Revenue Generation', 'Real Transactions'
  ],
  openGraph: {
    title: 'InFusion - Agentic AI Cross-Chain Atomic Swaps',
    description: 'Revolutionary DeFi platform with real AI agents performing cross-chain atomic swaps',
    url: 'https://infusion.defi/infusion',
    type: 'website',
    images: [
      {
        url: '/og-image-infusion.png',
        width: 1200,
        height: 630,
        alt: 'InFusion Agentic AI Swap Interface'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InFusion - Agentic AI Cross-Chain Atomic Swaps',
    description: 'Real AI agents performing production cross-chain atomic swaps with revenue generation',
    images: ['/og-image-infusion.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function InfusionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <div className="relative">
          {/* Animated background gradient */}
          <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 animate-gradient-shift" />
          
          {/* Ambient light effects */}
          <div className="fixed inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
            <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </ThemeProvider>

      <style jsx global>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-gradient-shift {
          background: linear-gradient(-45deg, #0f172a, #581c87, #1e1b4b, #0f172a);
          background-size: 400% 400%;
          animation: gradient-shift 15s ease infinite;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}