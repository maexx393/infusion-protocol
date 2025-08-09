import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { 
  mainnet, 
  arbitrum, 
  base, 
  scroll, 
  polygon,
  sepolia,
  arbitrumSepolia,
  baseSepolia,
  polygonAmoy,
  optimism,
  optimismSepolia,
  bsc,
  bscTestnet,
  avalanche,
  avalancheFuji,
  fantom,
  fantomTestnet
} from '@reown/appkit/networks'

// Environment variables
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '865c931386843631a84e0461df3b26fa'

// Metadata for the dApp
const metadata = {
  name: 'InFusion Cross-Chain Swaps',
  description: 'AI-powered cross-chain atomic swaps with real-time agent orchestration',
  url: 'https://infusion.defiunite.com',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// EVM Networks (supported by AppKit)
const evmNetworks = [
  mainnet,
  sepolia,
  polygon,
  polygonAmoy,
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  optimism,
  optimismSepolia,
  bsc,
  bscTestnet,
  avalanche,
  avalancheFuji,
  fantom,
  fantomTestnet
]

// Custom Solana Networks (for UI display)
const solanaNetworks = [
  {
    id: 'solana-mainnet',
    name: 'Solana',
    symbol: 'SOL',
    icon: '🟣',
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://explorer.solana.com',
    nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
    category: 'solana',
    isMainnet: true
  },
  {
    id: 'solana-testnet',
    name: 'Solana Testnet',
    symbol: 'SOL',
    icon: '🟣',
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_TESTNET_RPC || 'https://api.testnet.solana.com',
    explorerUrl: 'https://explorer.solana.com/?cluster=testnet',
    nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
    category: 'solana',
    isTestnet: true
  }
]

// Custom Bitcoin Networks (for UI display)
const bitcoinNetworks = [
  {
    id: 'bitcoin-mainnet',
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '🟠',
    rpcUrl: process.env.NEXT_PUBLIC_BITCOIN_MAINNET_RPC || 'https://blockstream.info/api',
    explorerUrl: 'https://blockstream.info',
    nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 8 },
    category: 'bitcoin',
    isMainnet: true
  },
  {
    id: 'bitcoin-testnet',
    name: 'Bitcoin Testnet',
    symbol: 'BTC',
    icon: '🟠',
    rpcUrl: process.env.NEXT_PUBLIC_BITCOIN_TESTNET_RPC || 'https://blockstream.info/testnet/api',
    explorerUrl: 'https://blockstream.info/testnet',
    nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 8 },
    category: 'bitcoin',
    isTestnet: true
  }
]

// Custom Algorand Networks (for UI display)
const algorandNetworks = [
  {
    id: 'algorand-mainnet',
    name: 'Algorand',
    symbol: 'ALGO',
    icon: '🔵',
    rpcUrl: process.env.NEXT_PUBLIC_ALGORAND_MAINNET_RPC || 'https://mainnet-api.algonode.cloud',
    explorerUrl: 'https://algoexplorer.io',
    nativeCurrency: { name: 'Algorand', symbol: 'ALGO', decimals: 6 },
    category: 'algorand',
    isMainnet: true,
    chainId: 416002
  },
  {
    id: 'algorand-testnet',
    name: 'Algorand Testnet',
    symbol: 'ALGO',
    icon: '🔵',
    rpcUrl: process.env.NEXT_PUBLIC_ALGORAND_TESTNET_RPC || 'https://testnet-api.algonode.cloud',
    explorerUrl: 'https://lora.algokit.io/testnet',
    nativeCurrency: { name: 'Algorand', symbol: 'ALGO', decimals: 6 },
    category: 'algorand',
    isTestnet: true,
    chainId: 416001
  }
]

// Custom NEAR Networks (for UI display)
const nearNetworks = [
  {
    id: 'near-mainnet',
    name: 'NEAR',
    symbol: 'NEAR',
    icon: '🟢',
    rpcUrl: process.env.NEXT_PUBLIC_NEAR_MAINNET_RPC || 'https://rpc.mainnet.near.org',
    explorerUrl: 'https://nearblocks.io',
    nativeCurrency: { name: 'NEAR', symbol: 'NEAR', decimals: 24 },
    category: 'near',
    isMainnet: true
  },
  {
    id: 'near-testnet',
    name: 'NEAR Testnet',
    symbol: 'NEAR',
    icon: '🟢',
    rpcUrl: process.env.NEXT_PUBLIC_NEAR_TESTNET_RPC || 'https://rpc.testnet.near.org',
    explorerUrl: 'https://testnet.nearblocks.io',
    nativeCurrency: { name: 'NEAR', symbol: 'NEAR', decimals: 24 },
    category: 'near',
    isTestnet: true
  }
]

// All networks for UI display
const allNetworks = [...evmNetworks, ...solanaNetworks, ...bitcoinNetworks, ...algorandNetworks, ...nearNetworks]

// Create Wagmi Adapter for EVM networks only
const wagmiAdapter = new WagmiAdapter({
  networks: evmNetworks,
  projectId,
  ssr: true
})

// Create AppKit instance with EVM adapter only
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: evmNetworks,
  projectId,
  metadata,
  features: {
    analytics: true
  }
})

// Export adapter for use in components
export { wagmiAdapter }

// Export network helpers
export const getNetworkById = (id: string) => {
  return allNetworks.find(network => network.id === id)
}

export const getNetworksByCategory = (category: string) => {
  return allNetworks.filter(network => network.category === category)
}

export const getEVMNetworks = () => evmNetworks
export const getSolanaNetworks = () => solanaNetworks
export const getBitcoinNetworks = () => bitcoinNetworks
export const getAlgorandNetworks = () => algorandNetworks
export const getNEARNetworks = () => nearNetworks

// Smart Sessions configuration
export const smartSessionConfig = {
  enabled: true,
  permissions: {
    contractCall: true,
    transaction: true,
    balance: true
  }
}

// AppKit connection state (for compatibility)
export interface AppKitConnection {
  address?: string
  isConnected?: boolean
}

// Extended AppKit interface
export interface ExtendedAppKit {
  modal?: {
    open: () => Promise<void>
    close: () => Promise<void>
  }
  connection?: AppKitConnection
  disconnect: () => Promise<void>
}

// Type assertion for AppKit
export const extendedAppKit = appKit as ExtendedAppKit 