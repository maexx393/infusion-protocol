'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppKitProvider as ReownAppkitProvider } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// Create adapter instances
const ethersAdapter = new EthersAdapter()
const solanaAdapter = new SolanaAdapter()
const bitcoinAdapter = new BitcoinAdapter()

export function AppkitProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReownAppkitProvider
        projectId={process.env.NEXT_PUBLIC_PROJECT_ID || 'infusion-defi-project'}
        metadata={{
          name: 'InFusion',
          description: 'AI-Powered Cross-Chain DeFi Platform',
          url: 'https://infusion.defi',
          icons: ['/icon.png']
        }}
        networks={[
          // Ethereum mainnet
          {
            id: 1,
            name: 'Ethereum',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: {
              default: { http: [process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://eth-mainnet.g.alchemy.com/v2/demo'] },
              public: { http: [process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://eth-mainnet.g.alchemy.com/v2/demo'] }
            },
            blockExplorers: {
              default: { name: 'Etherscan', url: 'https://etherscan.io' }
            }
          },
          // Ethereum Sepolia testnet
          {
            id: 11155111,
            name: 'Sepolia',
            nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: {
              default: { http: [process.env.NEXT_PUBLIC_SEPOLIA_RPC || 'https://sepolia.infura.io/v3/demo'] },
              public: { http: [process.env.NEXT_PUBLIC_SEPOLIA_RPC || 'https://sepolia.infura.io/v3/demo'] }
            },
            blockExplorers: {
              default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' }
            }
          },
          // Polygon mainnet
          {
            id: 137,
            name: 'Polygon',
            nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
            rpcUrls: {
              default: { http: [process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com'] },
              public: { http: [process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com'] }
            },
            blockExplorers: {
              default: { name: 'PolygonScan', url: 'https://polygonscan.com' }
            }
          },
          // Polygon Amoy testnet
          {
            id: 80002,
            name: 'Polygon Amoy',
            nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
            rpcUrls: {
              default: { http: [process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology'] },
              public: { http: [process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology'] }
            },
            blockExplorers: {
              default: { name: 'PolygonScan', url: 'https://amoy.polygonscan.com' }
            }
          },
          // Arbitrum One
          {
            id: 42161,
            name: 'Arbitrum One',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: {
              default: { http: [process.env.NEXT_PUBLIC_ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc'] },
              public: { http: [process.env.NEXT_PUBLIC_ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc'] }
            },
            blockExplorers: {
              default: { name: 'Arbiscan', url: 'https://arbiscan.io' }
            }
          },
          // Arbitrum Sepolia testnet
          {
            id: 421614,
            name: 'Arbitrum Sepolia',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: {
              default: { http: [process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC || 'https://sepolia-rollup.arbitrum.io/rpc'] },
              public: { http: [process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC || 'https://sepolia-rollup.arbitrum.io/rpc'] }
            },
            blockExplorers: {
              default: { name: 'Arbiscan', url: 'https://sepolia.arbiscan.io' }
            }
          },
          // Base mainnet
          {
            id: 8453,
            name: 'Base',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: {
              default: { http: [process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org'] },
              public: { http: [process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org'] }
            },
            blockExplorers: {
              default: { name: 'BaseScan', url: 'https://basescan.org' }
            }
          },
          // Base Sepolia testnet
          {
            id: 84532,
            name: 'Base Sepolia',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: {
              default: { http: [process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || 'https://sepolia.base.org'] },
              public: { http: [process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || 'https://sepolia.base.org'] }
            },
            blockExplorers: {
              default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' }
            }
          },
          // Optimism mainnet
          {
            id: 10,
            name: 'Optimism',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: {
              default: { http: [process.env.NEXT_PUBLIC_OPTIMISM_RPC || 'https://mainnet.optimism.io'] },
              public: { http: [process.env.NEXT_PUBLIC_OPTIMISM_RPC || 'https://mainnet.optimism.io'] }
            },
            blockExplorers: {
              default: { name: 'Optimistic Etherscan', url: 'https://optimistic.etherscan.io' }
            }
          },
          // Optimism Sepolia testnet
          {
            id: 11155420,
            name: 'Optimism Sepolia',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: {
              default: { http: [process.env.NEXT_PUBLIC_OPTIMISM_SEPOLIA_RPC || 'https://sepolia.optimism.io'] },
              public: { http: [process.env.NEXT_PUBLIC_OPTIMISM_SEPOLIA_RPC || 'https://sepolia.optimism.io'] }
            },
            blockExplorers: {
              default: { name: 'Optimistic Etherscan', url: 'https://sepolia-optimism.etherscan.io' }
            }
          }
        ]}
        adapters={[
          ethersAdapter,
          solanaAdapter,
          bitcoinAdapter
        ]}
      >
        {children}
      </ReownAppkitProvider>
    </QueryClientProvider>
  )
} 