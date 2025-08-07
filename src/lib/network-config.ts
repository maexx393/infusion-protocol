// InFusion Network Configuration
// Comprehensive L1 blockchain network support

export interface NetworkConfig {
  id: string | number;
  name: string;
  symbol: string;
  icon: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
  category: 'evm' | 'solana' | 'bitcoin' | 'near' | 'algorand';
  isTestnet?: boolean;
  isMainnet?: boolean;
}

export const NETWORK_CONFIGS: NetworkConfig[] = [
  // EVM Networks
  {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '🔷',
    rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://eth-mainnet.g.alchemy.com/v2/demo',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    category: 'evm',
    isMainnet: true
  },
  {
    id: 11155111,
    name: 'Sepolia',
    symbol: 'ETH',
    icon: '🔷',
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC || 'https://sepolia.infura.io/v3/demo',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    category: 'evm',
    isTestnet: true
  },
  {
    id: 137,
    name: 'Polygon',
    symbol: 'POL',
    icon: '🟣',
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    category: 'evm',
    isMainnet: true
  },
  {
    id: 80002,
    name: 'Polygon Amoy',
    symbol: 'POL',
    icon: '🟣',
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology',
    explorerUrl: 'https://amoy.polygonscan.com',
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    category: 'evm',
    isTestnet: true
  },
  {
    id: 42161,
    name: 'Arbitrum One',
    symbol: 'ETH',
    icon: '🔵',
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    category: 'evm',
    isMainnet: true
  },
  {
    id: 421614,
    name: 'Arbitrum Sepolia',
    symbol: 'ETH',
    icon: '🔵',
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC || 'https://sepolia-rollup.arbitrum.io/rpc',
    explorerUrl: 'https://sepolia.arbiscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    category: 'evm',
    isTestnet: true
  },
  {
    id: 8453,
    name: 'Base',
    symbol: 'ETH',
    icon: '🔵',
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    category: 'evm',
    isMainnet: true
  },
  {
    id: 84532,
    name: 'Base Sepolia',
    symbol: 'ETH',
    icon: '🔵',
    rpcUrl: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    category: 'evm',
    isTestnet: true
  },
  {
    id: 10,
    name: 'Optimism',
    symbol: 'ETH',
    icon: '🔴',
    rpcUrl: process.env.NEXT_PUBLIC_OPTIMISM_RPC || 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    category: 'evm',
    isMainnet: true
  },
  {
    id: 11155420,
    name: 'Optimism Sepolia',
    symbol: 'ETH',
    icon: '🔴',
    rpcUrl: process.env.NEXT_PUBLIC_OPTIMISM_SEPOLIA_RPC || 'https://sepolia.optimism.io',
    explorerUrl: 'https://sepolia-optimism.etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    category: 'evm',
    isTestnet: true
  },
  {
    id: 56,
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    icon: '🟡',
    rpcUrl: process.env.NEXT_PUBLIC_BSC_RPC || 'https://bsc-dataseed1.binance.org',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    category: 'evm',
    isMainnet: true
  },
  {
    id: 97,
    name: 'BNB Smart Chain Testnet',
    symbol: 'tBNB',
    icon: '🟡',
    rpcUrl: process.env.NEXT_PUBLIC_BSC_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545',
    explorerUrl: 'https://testnet.bscscan.com',
    nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
    category: 'evm',
    isTestnet: true
  },
  {
    id: 43114,
    name: 'Avalanche',
    symbol: 'AVAX',
    icon: '🔴',
    rpcUrl: process.env.NEXT_PUBLIC_AVALANCHE_RPC || 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
    category: 'evm',
    isMainnet: true
  },
  {
    id: 43113,
    name: 'Avalanche Fuji',
    symbol: 'AVAX',
    icon: '🔴',
    rpcUrl: process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC || 'https://api.avax-test.network/ext/bc/C/rpc',
    explorerUrl: 'https://testnet.snowtrace.io',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
    category: 'evm',
    isTestnet: true
  },
  {
    id: 250,
    name: 'Fantom',
    symbol: 'FTM',
    icon: '🔵',
    rpcUrl: process.env.NEXT_PUBLIC_FANTOM_RPC || 'https://rpc.ftm.tools',
    explorerUrl: 'https://ftmscan.com',
    nativeCurrency: { name: 'FTM', symbol: 'FTM', decimals: 18 },
    category: 'evm',
    isMainnet: true
  },
  {
    id: 4002,
    name: 'Fantom Testnet',
    symbol: 'FTM',
    icon: '🔵',
    rpcUrl: process.env.NEXT_PUBLIC_FANTOM_TESTNET_RPC || 'https://rpc.testnet.fantom.network',
    explorerUrl: 'https://testnet.ftmscan.com',
    nativeCurrency: { name: 'FTM', symbol: 'FTM', decimals: 18 },
    category: 'evm',
    isTestnet: true
  },

  // Solana Networks
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
    id: 'solana-devnet',
    name: 'Solana Devnet',
    symbol: 'SOL',
    icon: '🟣',
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com',
    explorerUrl: 'https://explorer.solana.com/?cluster=devnet',
    nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
    category: 'solana',
    isTestnet: true
  },

  // Bitcoin Networks
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
  },

  // NEAR Networks
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
  },

  // Algorand Networks
  {
    id: 'algorand-mainnet',
    name: 'Algorand',
    symbol: 'ALGO',
    icon: '🔵',
    rpcUrl: process.env.NEXT_PUBLIC_ALGORAND_MAINNET_RPC || 'https://mainnet-api.algonode.cloud',
    explorerUrl: 'https://algoexplorer.io',
    nativeCurrency: { name: 'Algorand', symbol: 'ALGO', decimals: 6 },
    category: 'algorand',
    isMainnet: true
  },
  {
    id: 'algorand-testnet',
    name: 'Algorand Testnet',
    symbol: 'ALGO',
    icon: '🔵',
    rpcUrl: process.env.NEXT_PUBLIC_ALGORAND_TESTNET_RPC || 'https://testnet-api.algonode.cloud',
    explorerUrl: 'https://testnet.algoexplorer.io',
    nativeCurrency: { name: 'Algorand', symbol: 'ALGO', decimals: 6 },
    category: 'algorand',
    isTestnet: true
  }
];

export function getNetworkById(id: string | number): NetworkConfig | undefined {
  return NETWORK_CONFIGS.find(network => network.id === id);
}

export function getNetworksByCategory(category: NetworkConfig['category']): NetworkConfig[] {
  return NETWORK_CONFIGS.filter(network => network.category === category);
}

export function getMainnetNetworks(): NetworkConfig[] {
  return NETWORK_CONFIGS.filter(network => network.isMainnet);
}

export function getTestnetNetworks(): NetworkConfig[] {
  return NETWORK_CONFIGS.filter(network => network.isTestnet);
}

// Network status checker
export const checkNetworkStatus = async (network: NetworkConfig): Promise<boolean> => {
  try {
    if (network.category === 'evm') {
      const response = await fetch(network.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      })
      return response.ok
    }
    // Add other network type checks as needed
    return true
  } catch (error) {
    console.error(`Network status check failed for ${network.name}:`, error)
    return false
  }
} 