import { ethers } from 'ethers'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { PeraWalletConnect } from '@perawallet/connect'
import { getNetworkById } from '@/lib/network-config'

export interface WalletBalance {
  chain: string
  address: string
  balance: string
  symbol: string
  decimals: number
}

export interface WalletConnection {
  chain: string
  walletType: 'metamask' | 'phantom' | 'pera' | 'near' | 'bitcoin'
  address: string
  isConnected: boolean
  balance?: string
}

// Initialize Pera Wallet
const peraWallet = new PeraWalletConnect({
  chainId: 416001, // Algorand testnet
  network: 'testnet'
})

// RPC URLs for different networks
const RPC_URLS = {
  'polygon-amoy': process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology',
  'ethereum-sepolia': process.env.NEXT_PUBLIC_ETHEREUM_SEPOLIA_RPC || 'https://sepolia.infura.io/v3/demo',
  'arbitrum-sepolia': process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC || 'https://sepolia-rollup.arbitrum.io/rpc',
  'base-sepolia': process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || 'https://sepolia.base.org',
  'optimism-sepolia': process.env.NEXT_PUBLIC_OPTIMISM_SEPOLIA_RPC || 'https://sepolia.optimism.io',
  'bsc-testnet': process.env.NEXT_PUBLIC_BSC_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545',
  'avalanche-fuji': process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC || 'https://api.avax-test.network/ext/bc/C/rpc',
  'fantom-testnet': process.env.NEXT_PUBLIC_FANTOM_TESTNET_RPC || 'https://rpc.testnet.fantom.network',
  'solana-devnet': process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com',
  'near-testnet': process.env.NEXT_PUBLIC_NEAR_TESTNET_RPC || 'https://rpc.testnet.near.org',
  'algorand-testnet': process.env.NEXT_PUBLIC_ALGORAND_TESTNET_RPC || 'https://testnet-api.algonode.cloud',
  'bitcoin-testnet': process.env.NEXT_PUBLIC_BITCOIN_TESTNET_RPC || 'https://blockstream.info/testnet/api'
}

// Token symbols for different chains
const TOKEN_SYMBOLS = {
  'polygon-amoy': 'POL',
  'ethereum-sepolia': 'ETH',
  'arbitrum-sepolia': 'ETH',
  'base-sepolia': 'ETH',
  'optimism-sepolia': 'ETH',
  'bsc-testnet': 'BNB',
  'avalanche-fuji': 'AVAX',
  'fantom-testnet': 'FTM',
  'solana-devnet': 'SOL',
  'near-testnet': 'NEAR',
  'algorand-testnet': 'ALGO',
  'bitcoin-testnet': 'BTC'
}

// Token decimals for different chains
const TOKEN_DECIMALS = {
  'polygon-amoy': 18,
  'ethereum-sepolia': 18,
  'arbitrum-sepolia': 18,
  'base-sepolia': 18,
  'optimism-sepolia': 18,
  'bsc-testnet': 18,
  'avalanche-fuji': 18,
  'fantom-testnet': 18,
  'solana-devnet': 9,
  'near-testnet': 24,
  'algorand-testnet': 6,
  'bitcoin-testnet': 8
}

export class WalletService {
  // Get balance for EVM chains
  static async getEVMBalance(chain: string, address: string): Promise<WalletBalance> {
    try {
      const rpcUrl = RPC_URLS[chain as keyof typeof RPC_URLS]
      if (!rpcUrl) {
        throw new Error(`No RPC URL found for chain: ${chain}`)
      }

      const provider = new ethers.JsonRpcProvider(rpcUrl)
      const balance = await provider.getBalance(address)
      const symbol = TOKEN_SYMBOLS[chain as keyof typeof TOKEN_SYMBOLS] || 'ETH'
      const decimals = TOKEN_DECIMALS[chain as keyof typeof TOKEN_DECIMALS] || 18

      return {
        chain,
        address,
        balance: ethers.formatUnits(balance, decimals),
        symbol,
        decimals
      }
    } catch (error) {
      console.error(`Error fetching EVM balance for ${chain}:`, error)
      throw new Error(`Failed to fetch balance for ${chain}: ${error}`)
    }
  }

  // Get balance for Solana
  static async getSolanaBalance(chain: string, address: string): Promise<WalletBalance> {
    try {
      const rpcUrl = RPC_URLS[chain as keyof typeof RPC_URLS]
      if (!rpcUrl) {
        throw new Error(`No RPC URL found for chain: ${chain}`)
      }

      const connection = new Connection(rpcUrl)
      const publicKey = new PublicKey(address)
      const balance = await connection.getBalance(publicKey)
      const symbol = TOKEN_SYMBOLS[chain as keyof typeof TOKEN_SYMBOLS] || 'SOL'
      const decimals = TOKEN_DECIMALS[chain as keyof typeof TOKEN_DECIMALS] || 9

      return {
        chain,
        address,
        balance: (balance / LAMPORTS_PER_SOL).toString(),
        symbol,
        decimals
      }
    } catch (error) {
      console.error(`Error fetching Solana balance for ${chain}:`, error)
      throw new Error(`Failed to fetch Solana balance: ${error}`)
    }
  }

  // Get balance for Algorand
  static async getAlgorandBalance(chain: string, address: string): Promise<WalletBalance> {
    try {
      const rpcUrl = RPC_URLS[chain as keyof typeof RPC_URLS]
      if (!rpcUrl) {
        throw new Error(`No RPC URL found for chain: ${chain}`)
      }

      // Use Algorand SDK to fetch balance
      const response = await fetch(`${rpcUrl}/v2/accounts/${address}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch Algorand account: ${response.statusText}`)
      }

      const accountData = await response.json()
      const balance = accountData.amount || 0
      const symbol = TOKEN_SYMBOLS[chain as keyof typeof TOKEN_SYMBOLS] || 'ALGO'
      const decimals = TOKEN_DECIMALS[chain as keyof typeof TOKEN_DECIMALS] || 6

      return {
        chain,
        address,
        balance: (balance / Math.pow(10, decimals)).toString(),
        symbol,
        decimals
      }
    } catch (error) {
      console.error(`Error fetching Algorand balance for ${chain}:`, error)
      throw new Error(`Failed to fetch Algorand balance: ${error}`)
    }
  }

  // Get balance for NEAR
  static async getNEARBalance(chain: string, address: string): Promise<WalletBalance> {
    try {
      const rpcUrl = RPC_URLS[chain as keyof typeof RPC_URLS]
      if (!rpcUrl) {
        throw new Error(`No RPC URL found for chain: ${chain}`)
      }

      // Use NEAR RPC to fetch balance
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'dontcare',
          method: 'query',
          params: {
            request_type: 'view_account',
            finality: 'final',
            account_id: address,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch NEAR account: ${response.statusText}`)
      }

      const data = await response.json()
      const balance = data.result.amount || '0'
      const symbol = TOKEN_SYMBOLS[chain as keyof typeof TOKEN_SYMBOLS] || 'NEAR'
      const decimals = TOKEN_DECIMALS[chain as keyof typeof TOKEN_DECIMALS] || 24

      return {
        chain,
        address,
        balance: (parseInt(balance) / Math.pow(10, decimals)).toString(),
        symbol,
        decimals
      }
    } catch (error) {
      console.error(`Error fetching NEAR balance for ${chain}:`, error)
      throw new Error(`Failed to fetch NEAR balance: ${error}`)
    }
  }

  // Get balance for Bitcoin
  static async getBitcoinBalance(chain: string, address: string): Promise<WalletBalance> {
    try {
      const rpcUrl = RPC_URLS[chain as keyof typeof RPC_URLS]
      if (!rpcUrl) {
        throw new Error(`No RPC URL found for chain: ${chain}`)
      }

      // Use Blockstream API to fetch balance
      const response = await fetch(`${rpcUrl}/address/${address}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch Bitcoin address: ${response.statusText}`)
      }

      const data = await response.json()
      const balance = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum
      const symbol = TOKEN_SYMBOLS[chain as keyof typeof TOKEN_SYMBOLS] || 'BTC'
      const decimals = TOKEN_DECIMALS[chain as keyof typeof TOKEN_DECIMALS] || 8

      return {
        chain,
        address,
        balance: (balance / Math.pow(10, decimals)).toString(),
        symbol,
        decimals
      }
    } catch (error) {
      console.error(`Error fetching Bitcoin balance for ${chain}:`, error)
      throw new Error(`Failed to fetch Bitcoin balance: ${error}`)
    }
  }

  // Get balance for any chain
  static async getBalance(chain: string, address: string): Promise<WalletBalance> {
    if (chain.includes('ethereum') || chain.includes('polygon') || chain.includes('arbitrum') || 
        chain.includes('base') || chain.includes('optimism') || chain.includes('bsc') || 
        chain.includes('avalanche') || chain.includes('fantom')) {
      return this.getEVMBalance(chain, address)
    } else if (chain.includes('solana')) {
      return this.getSolanaBalance(chain, address)
    } else if (chain.includes('algorand')) {
      return this.getAlgorandBalance(chain, address)
    } else if (chain.includes('near')) {
      return this.getNEARBalance(chain, address)
    } else if (chain.includes('bitcoin')) {
      return this.getBitcoinBalance(chain, address)
    } else {
      throw new Error(`Unsupported chain: ${chain}`)
    }
  }

  // Validate address format for different chains
  static validateAddress(chain: string, address: string): boolean {
    try {
      if (chain.includes('ethereum') || chain.includes('polygon') || chain.includes('arbitrum') || 
          chain.includes('base') || chain.includes('optimism') || chain.includes('bsc') || 
          chain.includes('avalanche') || chain.includes('fantom')) {
        return ethers.isAddress(address)
      } else if (chain.includes('solana')) {
        try {
          new PublicKey(address)
          return true
        } catch {
          return false
        }
      } else if (chain.includes('algorand')) {
        // Algorand addresses are 58 characters long and start with A
        return address.length === 58 && address.startsWith('A')
      } else if (chain.includes('near')) {
        // NEAR addresses end with .near or .testnet
        return address.endsWith('.near') || address.endsWith('.testnet')
      } else if (chain.includes('bitcoin')) {
        // Basic Bitcoin address validation
        return address.length >= 26 && address.length <= 35
      }
      return false
    } catch {
      return false
    }
  }

  // Get wallet type for a chain
  static getWalletTypeForChain(chain: string): 'metamask' | 'phantom' | 'pera' | 'near' | 'bitcoin' {
    if (chain.includes('ethereum') || chain.includes('polygon') || chain.includes('arbitrum') || 
        chain.includes('base') || chain.includes('optimism') || chain.includes('bsc') || 
        chain.includes('avalanche') || chain.includes('fantom')) {
      return 'metamask'
    } else if (chain.includes('solana')) {
      return 'phantom'
    } else if (chain.includes('algorand')) {
      return 'pera'
    } else if (chain.includes('near')) {
      return 'near'
    } else if (chain.includes('bitcoin')) {
      return 'bitcoin'
    }
    return 'metamask' // default
  }

  // Get network icon
  static getNetworkIcon(chain: string): string {
    if (chain.includes('ethereum')) return '🔷'
    if (chain.includes('polygon')) return '🟣'
    if (chain.includes('solana')) return '🟣'
    if (chain.includes('algorand')) return '🟡'
    if (chain.includes('near')) return '🟢'
    if (chain.includes('bitcoin')) return '🟠'
    return '🔗'
  }

  // Get wallet icon
  static getWalletIcon(walletType: string): string {
    switch (walletType) {
      case 'metamask': return '🦊'
      case 'phantom': return '👻'
      case 'pera': return '🔵'
      case 'near': return '🟢'
      case 'bitcoin': return '🟠'
      default: return '💳'
    }
  }
} 