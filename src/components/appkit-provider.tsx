'use client'

import { AppKitProvider as BaseAppKitProvider } from '@reown/appkit/react'
import { ReactNode } from 'react'

interface AppKitProviderProps {
  children: ReactNode
}

export function AppKitProvider({ children }: AppKitProviderProps) {
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'your-walletconnect-project-id'

  const networks = [
    // EVM Networks
    {
      id: 'polygon-amoy',
      name: 'Polygon Amoy',
      chainId: 80002,
      rpcUrl: process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology',
      explorerUrl: 'https://amoy.polygonscan.com',
      icon: '🟣',
      symbol: 'POL',
      isMainnet: false
    },
    {
      id: 'ethereum-sepolia',
      name: 'Ethereum Sepolia',
      chainId: 11155111,
      rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_SEPOLIA_RPC || 'https://sepolia.infura.io/v3/demo',
      explorerUrl: 'https://sepolia.etherscan.io',
      icon: '🔷',
      symbol: 'ETH',
      isMainnet: false
    },
    {
      id: 'arbitrum-sepolia',
      name: 'Arbitrum Sepolia',
      chainId: 421614,
      rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC || 'https://sepolia-rollup.arbitrum.io/rpc',
      explorerUrl: 'https://sepolia.arbiscan.io',
      icon: '🔴',
      symbol: 'ETH',
      isMainnet: false
    },
    {
      id: 'base-sepolia',
      name: 'Base Sepolia',
      chainId: 84532,
      rpcUrl: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || 'https://sepolia.base.org',
      explorerUrl: 'https://sepolia.basescan.org',
      icon: '🔵',
      symbol: 'ETH',
      isMainnet: false
    },
    {
      id: 'optimism-sepolia',
      name: 'Optimism Sepolia',
      chainId: 11155420,
      rpcUrl: process.env.NEXT_PUBLIC_OPTIMISM_SEPOLIA_RPC || 'https://sepolia.optimism.io',
      explorerUrl: 'https://sepolia-optimism.etherscan.io',
      icon: '🟠',
      symbol: 'ETH',
      isMainnet: false
    },
    {
      id: 'bsc-testnet',
      name: 'BSC Testnet',
      chainId: 97,
      rpcUrl: process.env.NEXT_PUBLIC_BSC_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545',
      explorerUrl: 'https://testnet.bscscan.com',
      icon: '🟡',
      symbol: 'BNB',
      isMainnet: false
    },
    {
      id: 'avalanche-fuji',
      name: 'Avalanche Fuji',
      chainId: 43113,
      rpcUrl: process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC || 'https://api.avax-test.network/ext/bc/C/rpc',
      explorerUrl: 'https://testnet.snowtrace.io',
      icon: '🔴',
      symbol: 'AVAX',
      isMainnet: false
    },
    {
      id: 'fantom-testnet',
      name: 'Fantom Testnet',
      chainId: 4002,
      rpcUrl: process.env.NEXT_PUBLIC_FANTOM_TESTNET_RPC || 'https://rpc.testnet.fantom.network',
      explorerUrl: 'https://testnet.ftmscan.com',
      icon: '🔵',
      symbol: 'FTM',
      isMainnet: false
    },
    // Solana Networks
    {
      id: 'solana-devnet',
      name: 'Solana Devnet',
      chainId: -1, // Solana uses different chain ID system
      rpcUrl: process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com',
      explorerUrl: 'https://explorer.solana.com/?cluster=devnet',
      icon: '🟣',
      symbol: 'SOL',
      isMainnet: false
    },
    {
      id: 'solana-mainnet',
      name: 'Solana Mainnet',
      chainId: -1,
      rpcUrl: process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com',
      explorerUrl: 'https://explorer.solana.com',
      icon: '🟣',
      symbol: 'SOL',
      isMainnet: true
    },
    // NEAR Networks
    {
      id: 'near-testnet',
      name: 'NEAR Testnet',
      chainId: -1,
      rpcUrl: process.env.NEXT_PUBLIC_NEAR_TESTNET_RPC || 'https://rpc.testnet.near.org',
      explorerUrl: 'https://testnet.nearblocks.io',
      icon: '🟢',
      symbol: 'NEAR',
      isMainnet: false
    },
    {
      id: 'near-mainnet',
      name: 'NEAR Mainnet',
      chainId: -1,
      rpcUrl: process.env.NEXT_PUBLIC_NEAR_MAINNET_RPC || 'https://rpc.mainnet.near.org',
      explorerUrl: 'https://nearblocks.io',
      icon: '🟢',
      symbol: 'NEAR',
      isMainnet: true
    },
    // Algorand Networks
    {
      id: 'algorand-testnet',
      name: 'Algorand Testnet',
      chainId: 416001,
      rpcUrl: process.env.NEXT_PUBLIC_ALGORAND_TESTNET_RPC || 'https://testnet-api.algonode.cloud',
      explorerUrl: 'https://testnet.algoexplorer.io',
      icon: '🟡',
      symbol: 'ALGO',
      isMainnet: false
    },
    {
      id: 'algorand-mainnet',
      name: 'Algorand Mainnet',
      chainId: 416002,
      rpcUrl: process.env.NEXT_PUBLIC_ALGORAND_MAINNET_RPC || 'https://mainnet-api.algonode.cloud',
      explorerUrl: 'https://algoexplorer.io',
      icon: '🟡',
      symbol: 'ALGO',
      isMainnet: true
    },
    // Bitcoin Networks
    {
      id: 'bitcoin-testnet',
      name: 'Bitcoin Testnet',
      chainId: -1,
      rpcUrl: process.env.NEXT_PUBLIC_BITCOIN_TESTNET_RPC || 'https://blockstream.info/testnet/api',
      explorerUrl: 'https://blockstream.info/testnet',
      icon: '🟠',
      symbol: 'BTC',
      isMainnet: false
    },
    {
      id: 'bitcoin-mainnet',
      name: 'Bitcoin Mainnet',
      chainId: -1,
      rpcUrl: process.env.NEXT_PUBLIC_BITCOIN_MAINNET_RPC || 'https://blockstream.info/api',
      explorerUrl: 'https://blockstream.info',
      icon: '🟠',
      symbol: 'BTC',
      isMainnet: true
    }
  ]

  const adapters = [
    // EVM Adapters
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      type: 'evm',
      supportedChains: networks.filter(n => 
        n.id.includes('ethereum') || n.id.includes('polygon') || n.id.includes('arbitrum') || 
        n.id.includes('base') || n.id.includes('optimism') || n.id.includes('bsc') || 
        n.id.includes('avalanche') || n.id.includes('fantom')
      )
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      type: 'universal',
      supportedChains: networks
    },
    // Solana Adapters
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      type: 'solana',
      supportedChains: networks.filter(n => n.id.includes('solana'))
    },
    // NEAR Adapters
    {
      id: 'near-wallet',
      name: 'NEAR Wallet',
      icon: '🟢',
      type: 'near',
      supportedChains: networks.filter(n => n.id.includes('near'))
    },
    // Algorand Adapters
    {
      id: 'pera-wallet',
      name: 'Pera Wallet',
      icon: '🔵',
      type: 'algorand',
      supportedChains: networks.filter(n => n.id.includes('algorand'))
    },
    // Bitcoin Adapters
    {
      id: 'bitcoin-wallet',
      name: 'Bitcoin Wallet',
      icon: '🟠',
      type: 'bitcoin',
      supportedChains: networks.filter(n => n.id.includes('bitcoin'))
    }
  ]

  return (
    <BaseAppKitProvider
      projectId={projectId}
      networks={networks}
      adapters={adapters}
      theme="dark"
      accentColor="purple"
    >
      {children}
    </BaseAppKitProvider>
  )
} 