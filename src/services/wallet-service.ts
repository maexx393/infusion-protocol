import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { connect, ConnectConfig } from 'near-api-js'
import { getNetworkById } from '@/lib/network-config'

export interface WalletConnection {
  chain: string
  walletType: 'metamask' | 'phantom' | 'pera' | 'near' | 'bitcoin'
  address: string
  isConnected: boolean
  balance?: string
}

export class WalletService {
  private static instance: WalletService
  private connections: Map<string, WalletConnection> = new Map()

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService()
    }
    return WalletService.instance
  }

  // EVM Wallet Connection (MetaMask)
  async connectEVMWallet(chain: string): Promise<WalletConnection> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not found. Please install MetaMask extension.')
    }

    const network = getNetworkById(chain)
    if (!network) {
      throw new Error(`Network ${chain} not supported`)
    }

    try {
      // Request account access
      const accounts = await (window.ethereum as any).request({ 
        method: 'eth_requestAccounts' 
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const address = accounts[0]

      // Check and switch network if needed
      await this.ensureEVMNetwork(chain)

      // Get balance
      const balance = await (window.ethereum as any).request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      })

      const connection: WalletConnection = {
        chain,
        walletType: 'metamask',
        address,
        isConnected: true,
        balance: (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4)
      }

      this.connections.set(chain, connection)
      return connection
    } catch (error) {
      throw new Error(`Failed to connect EVM wallet: ${error}`)
    }
  }

  // Solana Wallet Connection (Phantom)
  async connectSolanaWallet(chain: string): Promise<WalletConnection> {
    if (typeof window === 'undefined' || !window.solana?.isPhantom) {
      throw new Error('Phantom wallet not found. Please install Phantom extension.')
    }

    const network = getNetworkById(chain)
    if (!network) {
      throw new Error(`Network ${chain} not supported`)
    }

    try {
      // Connect to Phantom wallet
      const response = await window.solana.connect()
      const address = response.publicKey.toString()
      
      // Get balance using Solana RPC
      const connection = new Connection(network.rpcUrl)
      const balance = await connection.getBalance(new PublicKey(address))

      const walletConnection: WalletConnection = {
        chain,
        walletType: 'phantom',
        address,
        isConnected: true,
        balance: (balance / LAMPORTS_PER_SOL).toFixed(4)
      }

      this.connections.set(chain, walletConnection)
      return walletConnection
    } catch (error) {
      throw new Error(`Failed to connect Solana wallet: ${error}`)
    }
  }

  // Algorand Wallet Connection (Pera)
  async connectAlgorandWallet(chain: string): Promise<WalletConnection> {
    const network = getNetworkById(chain)
    if (!network) {
      throw new Error(`Network ${chain} not supported`)
    }

    try {
      // Import PeraWalletConnect dynamically to avoid SSR issues
      const { PeraWalletConnect } = await import('@perawallet/connect')
      
      const peraWallet = new PeraWalletConnect({
        chainId: chain.includes('testnet') ? 416001 : 416002 // Algorand testnet/mainnet
      })

      // Connect to Pera wallet
      const accounts = await peraWallet.connect()
      
      if (accounts.length === 0) {
        throw new Error('No Algorand accounts found')
      }

      const address = accounts[0]

      // Get balance using Algorand RPC
      const balanceResponse = await fetch(network.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'account_info',
          params: [address]
        })
      })

      const balanceData = await balanceResponse.json()
      const balance = balanceData.result ? (balanceData.result.account.amount / Math.pow(10, 6)).toFixed(4) : '0.0'

      const connection: WalletConnection = {
        chain,
        walletType: 'pera',
        address,
        isConnected: true,
        balance
      }

      this.connections.set(chain, connection)
      return connection
    } catch (error) {
      throw new Error(`Failed to connect Algorand wallet: ${error}`)
    }
  }

  // NEAR Wallet Connection
  async connectNEARWallet(chain: string): Promise<WalletConnection> {
    if (typeof window === 'undefined' || !window.near) {
      throw new Error('NEAR wallet not found. Please install NEAR wallet extension.')
    }

    const network = getNetworkById(chain)
    if (!network) {
      throw new Error(`Network ${chain} not supported`)
    }

    try {
      // Connect to NEAR wallet
      const account = await window.near.connect()
      const address = account.accountId

      // Get balance using NEAR RPC
      const balanceResponse = await fetch(network.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'query',
          params: {
            request_type: 'view_account',
            account_id: address,
            finality: 'final'
          }
        })
      })

      const balanceData = await balanceResponse.json()
      const balance = balanceData.result ? (parseInt(balanceData.result.amount) / Math.pow(10, 24)).toFixed(4) : '0.0'

      const connection: WalletConnection = {
        chain,
        walletType: 'near',
        address,
        isConnected: true,
        balance
      }

      this.connections.set(chain, connection)
      return connection
    } catch (error) {
      throw new Error(`Failed to connect NEAR wallet: ${error}`)
    }
  }

  // Bitcoin Wallet Connection (Lightning Network)
  async connectBitcoinWallet(chain: string): Promise<WalletConnection> {
    if (typeof window === 'undefined' || !window.bitcoin) {
      throw new Error('Bitcoin wallet not found. Please install a Bitcoin Lightning wallet extension.')
    }

    const network = getNetworkById(chain)
    if (!network) {
      throw new Error(`Network ${chain} not supported`)
    }

    try {
      // Connect to Bitcoin wallet (assuming Lightning Network)
      const account = await window.bitcoin.connect()
      const address = account.address

      // Get balance using Bitcoin RPC
      const balanceResponse = await fetch(network.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getbalance',
          params: []
        })
      })

      const balanceData = await balanceResponse.json()
      const balance = balanceData.result ? balanceData.result.toFixed(8) : '0.00000000'

      const connection: WalletConnection = {
        chain,
        walletType: 'bitcoin',
        address,
        isConnected: true,
        balance
      }

      this.connections.set(chain, connection)
      return connection
    } catch (error) {
      throw new Error(`Failed to connect Bitcoin wallet: ${error}`)
    }
  }

  // Ensure EVM network is correct
  private async ensureEVMNetwork(chain: string): Promise<void> {
    if (typeof window === 'undefined' || !window.ethereum) {
      return
    }

    const network = getNetworkById(chain)
    if (!network) {
      throw new Error(`Network ${chain} not supported`)
    }

    const currentChainId = await (window.ethereum as any).request({ 
      method: 'eth_chainId' 
    })

    const targetChainId = `0x${Number(network.id).toString(16)}`

    if (currentChainId !== targetChainId) {
      try {
        // Try to switch to the target network
        await (window.ethereum as any).request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetChainId }],
        })
      } catch (switchError: any) {
        // If the network doesn't exist in MetaMask, add it
        if (switchError.code === 4902) {
          await (window.ethereum as any).request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: targetChainId,
              chainName: network.name,
              nativeCurrency: network.nativeCurrency || {
                name: network.symbol,
                symbol: network.symbol,
                decimals: 18
              },
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.explorerUrl]
            }],
          })
        } else {
          throw new Error(`Failed to switch to ${network.name}: ${switchError.message}`)
        }
      }
    }
  }

  // Disconnect wallet
  disconnectWallet(chain: string): void {
    this.connections.delete(chain)
  }

  // Get connected wallet
  getConnectedWallet(chain: string): WalletConnection | undefined {
    return this.connections.get(chain)
  }

  // Get all connected wallets
  getAllConnectedWallets(): WalletConnection[] {
    return Array.from(this.connections.values())
  }

  // Check if wallet is connected
  isWalletConnected(chain: string): boolean {
    return this.connections.has(chain) && this.connections.get(chain)?.isConnected === true
  }

  // Get wallet type for chain
  getWalletTypeForChain(chain: string): 'metamask' | 'phantom' | 'pera' | 'near' | 'bitcoin' {
    const net = getNetworkById(chain)
    switch (net?.category) {
      case 'evm': return 'metamask'
      case 'solana': return 'phantom'
      case 'algorand': return 'pera'
      case 'near': return 'near'
      case 'bitcoin': return 'bitcoin'
      default: return 'metamask'
    }
  }

  // Connect wallet based on chain type
  async connectWallet(chain: string): Promise<WalletConnection> {
    const walletType = this.getWalletTypeForChain(chain)
    
    switch (walletType) {
      case 'metamask':
        return this.connectEVMWallet(chain)
      case 'phantom':
        return this.connectSolanaWallet(chain)
      case 'pera':
        return this.connectAlgorandWallet(chain)
      case 'near':
        return this.connectNEARWallet(chain)
      case 'bitcoin':
        return this.connectBitcoinWallet(chain)
      default:
        throw new Error(`Unsupported wallet type for chain: ${chain}`)
    }
  }
}

// Export singleton instance
export const walletService = WalletService.getInstance() 
} 