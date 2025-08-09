import { getNetworkById } from '@/lib/network-config'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'

export interface WalletConnection {
  chain: string
  walletType: 'metamask' | 'phantom' | 'pera' | 'near' | 'bitcoin'
  address: string
  isConnected: boolean
  balance?: string
  smartSessionId?: string
}

export class AppKitWalletService {
  private static instance: AppKitWalletService
  private connections: Map<string, WalletConnection> = new Map()

  static getInstance(): AppKitWalletService {
    if (!AppKitWalletService.instance) {
      AppKitWalletService.instance = new AppKitWalletService()
    }
    return AppKitWalletService.instance
  }

  // Connect wallet using AppKit
  async connectWallet(chain: string): Promise<WalletConnection> {
    const network = getNetworkById(chain)
    if (!network) {
      throw new Error(`Network ${chain} not supported`)
    }

    const walletType = this.getWalletTypeForChain(chain)
    
    switch (walletType) {
      case 'metamask':
        return this.connectEVMWallet(chain)
      case 'phantom':
        return this.connectSolanaWallet(chain)
      case 'bitcoin':
        return this.connectBitcoinWallet(chain)
      case 'pera':
        return this.connectAlgorandWallet(chain)
      case 'near':
        return this.connectNEARWallet(chain)
      default:
        throw new Error(`Unsupported wallet type for chain: ${chain}`)
    }
  }

  // Connect EVM wallet using MetaMask
  async connectEVMWallet(chain: string): Promise<WalletConnection> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask extension.')
      }

      const network = getNetworkById(chain)
      if (!network) {
        throw new Error(`Network ${chain} not supported`)
      }

      // Request account access
      const accounts = await (window.ethereum as any).request({ 
        method: 'eth_requestAccounts' 
      })
      
      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const address = accounts[0]

      // Ensure correct network
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

  // Connect Solana wallet using Phantom
  async connectSolanaWallet(chain: string): Promise<WalletConnection> {
    try {
      if (typeof window === 'undefined' || !window.solana?.isPhantom) {
        window.open('https://phantom.app/', '_blank')
        throw new Error('Phantom wallet not installed')
      }

      const network = getNetworkById(chain)
      if (!network) {
        throw new Error(`Network ${chain} not supported`)
      }

      // Connect to Phantom
      const response = await window.solana.connect()
      const address = response.publicKey.toString()

      // Get balance
      const connection = new Connection(network.rpcUrl || 'https://api.testnet.solana.com')
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

  // Connect Bitcoin wallet (simulated for now)
  async connectBitcoinWallet(chain: string): Promise<WalletConnection> {
    const network = getNetworkById(chain)
    if (!network) {
      throw new Error(`Network ${chain} not supported`)
    }

    try {
      // Simulate Bitcoin wallet connection
      const address = `bc1q${Math.random().toString(36).substring(2, 42)}`
      
      const connection: WalletConnection = {
        chain,
        walletType: 'bitcoin',
        address,
        isConnected: true,
        balance: '0.00000000'
      }

      this.connections.set(chain, connection)
      return connection
    } catch (error) {
      throw new Error(`Failed to connect Bitcoin wallet: ${error}`)
    }
  }

  // Connect Algorand wallet using Pera
  async connectAlgorandWallet(chain: string): Promise<WalletConnection> {
    const network = getNetworkById(chain)
    if (!network) {
      throw new Error(`Network ${chain} not supported`)
    }

    try {
      const { PeraWalletConnect } = await import('@perawallet/connect')
      const peraWallet = new PeraWalletConnect({
        chainId: chain.includes('testnet') ? 416001 : 416002
      })

      // 1) Try to restore an existing session first (no popups)
      let accounts: string[] = []
      try {
        const existingAccounts = await peraWallet.reconnectSession()
        if (existingAccounts && existingAccounts.length > 0) {
          accounts = existingAccounts
        }
      } catch (_) {
        // ignore
      }

      // 2) If no existing session, start a new connection (may open popup/new tab)
      if (accounts.length === 0) {
        try {
          accounts = await peraWallet.connect()
        } catch (connectErr: any) {
          if (typeof window !== 'undefined') {
            // Surface a friendlier message for popup blockers
            throw new Error('Pera Wallet connection was blocked. Please allow popups and try again, or open the Pera Wallet app/extension to approve the session.')
          }
          throw connectErr
        }
      }

      if (accounts.length === 0) {
        throw new Error('No Algorand accounts approved in Pera Wallet')
      }

      const address = accounts[0]

      // Get balance using Algod (via algosdk)
      let balance = '0.0'
      try {
        const algosdk: any = await import('algosdk')
        const algodClient = new algosdk.Algodv2('', network.rpcUrl, '')
        const accountInfo = await algodClient.accountInformation(address).do()
        if (accountInfo && typeof accountInfo.amount === 'number') {
          balance = (accountInfo.amount / Math.pow(10, 6)).toFixed(4)
        }
      } catch (balanceError) {
        console.warn('Algorand balance fetch failed, continuing without balance:', balanceError)
      }

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
      throw new Error(`Failed to connect Algorand wallet: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Connect NEAR wallet via near-api-js with web wallet fallback
  async connectNEARWallet(chain: string): Promise<WalletConnection> {
    const network = getNetworkById(chain)
    if (!network) {
      throw new Error(`Network ${chain} not supported`)
    }

    try {
      // Dynamic import to avoid SSR issues
      const nearApi = await import('near-api-js')
      const { connect, keyStores, WalletConnection } = nearApi as any

      const isTestnet = String(chain).includes('testnet')
      const walletUrl = isTestnet ? 'https://wallet.testnet.near.org' : 'https://wallet.mainnet.near.org'
      const helperUrl = isTestnet ? 'https://helper.testnet.near.org' : 'https://helper.mainnet.near.org'

      const keyStore = new keyStores.BrowserLocalStorageKeyStore()
      const near = await connect({
        networkId: isTestnet ? 'testnet' : 'mainnet',
        nodeUrl: network.rpcUrl,
        walletUrl,
        helperUrl,
        deps: { keyStore }
      })

      const wallet = new WalletConnection(near, 'infusion-app')

      // If not signed in, initiate the web wallet sign-in flow (redirect)
      if (!wallet.isSignedIn()) {
        // This will redirect the user to NEAR Wallet for authorization
        await wallet.requestSignIn({})
        // Execution will continue after redirect when the user returns
        throw new Error('Redirecting to NEAR Wallet for authorization...')
      }

      const address = wallet.getAccountId()

      // Fetch balance using RPC
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

  // Ensure EVM network is connected
  private async ensureEVMNetwork(chain: string): Promise<void> {
    if (typeof window === 'undefined' || !window.ethereum) {
      return
    }

    try {
      const network = getNetworkById(chain)
      if (!network) return

      const targetChainIdHex = `0x${Number(network.id).toString(16)}`
      const currentChainId = await (window.ethereum as any).request({ method: 'eth_chainId' })

      if (currentChainId !== targetChainIdHex) {
        try {
          // Try to switch to the network
          await (window.ethereum as any).request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainIdHex }]
          })
        } catch (switchError: any) {
          // If the network doesn't exist, add it
          if (switchError.code === 4902) {
            await (window.ethereum as any).request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: targetChainIdHex,
                chainName: network.name,
                nativeCurrency: network.nativeCurrency || {
                  name: network.symbol,
                  symbol: network.symbol,
                  decimals: 18
                },
                rpcUrls: [network.rpcUrl],
                blockExplorerUrls: [network.explorerUrl]
              }]
            })
          } else {
            throw switchError
          }
        }
      }
    } catch (error) {
      console.warn('Failed to ensure EVM network:', error)
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

  // Get balance for a connected wallet
  async getBalance(chain: string, address: string): Promise<string> {
    const network = getNetworkById(chain)
    if (!network) {
      throw new Error(`Network ${chain} not supported`)
    }

    try {
      switch (network.category) {
        case 'evm':
          // Get EVM balance
          if (typeof window !== 'undefined' && window.ethereum) {
            const balance = await (window.ethereum as any).request({ 
              method: 'eth_getBalance', 
              params: [address, 'latest'] 
            })
            return (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4)
          }
          break
          
        case 'solana':
          // Get Solana balance
          const connection = new Connection(network.rpcUrl || 'https://api.testnet.solana.com')
          const balance = await connection.getBalance(new PublicKey(address))
          return (balance / LAMPORTS_PER_SOL).toFixed(4)
          
        case 'algorand':
          // Get Algorand balance via algosdk (Algod REST)
          try {
            const algosdk: any = await import('algosdk')
            const algodClient = new algosdk.Algodv2('', network.rpcUrl, '')
            const accountInfo = await algodClient.accountInformation(address).do()
            return accountInfo && typeof accountInfo.amount === 'number'
              ? (accountInfo.amount / Math.pow(10, 6)).toFixed(4)
              : '0.0'
          } catch (e) {
            console.warn('Algorand getBalance failed:', e)
            return '0.0'
          }
          
        case 'bitcoin':
          // Get Bitcoin balance (simulated)
          return '0.00000000'
          
        case 'near':
          // Get NEAR balance
          const nearBalanceResponse = await fetch(network.rpcUrl, {
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
          const nearBalanceData = await nearBalanceResponse.json()
          return nearBalanceData.result ? (parseInt(nearBalanceData.result.amount) / Math.pow(10, 24)).toFixed(4) : '0.0'
          
        default:
          return '0.0'
      }
    } catch (error) {
      console.error(`Error fetching balance for ${chain}:`, error)
      return '0.0'
    }

    return '0.0'
  }

  // Check if Smart Session is available for a wallet
  hasSmartSession(chain: string): boolean {
    const connection = this.getConnectedWallet(chain)
    return connection?.smartSessionId ? true : false
  }

  // Get Smart Session ID for a wallet
  getSmartSessionId(chain: string): string | undefined {
    const connection = this.getConnectedWallet(chain)
    return connection?.smartSessionId
  }

  // Create Algorand HTLC order (client-side signing via Pera)
  async algorandCreateOrder(params: {
    escrowAppId: number
    depositorAddress: string
    claimerAddress: string
    hashedSecret: string
    expirationSeconds: number
    network: string
  }): Promise<{ txId: string; explorerUrl: string }> {
    const networkCfg = getNetworkById(params.network)
    if (!networkCfg) throw new Error(`Unsupported network ${params.network}`)

    const algosdk: any = await import('algosdk')
    const pera = new PeraWalletConnect({ chainId: params.network.includes('testnet') ? 416001 : 416002 })
    const algod = new algosdk.Algodv2('', networkCfg.rpcUrl, '')

    const suggested = await algod.getTransactionParams().do()
    const expirationTime = Math.floor(Date.now() / 1000) + params.expirationSeconds

    const appArgs = [
      new Uint8Array(Buffer.from('create_order', 'utf8')),
      new Uint8Array(Buffer.from(params.hashedSecret)),
      new Uint8Array(Buffer.from(params.claimerAddress)),
      new Uint8Array(Buffer.from(params.hashedSecret)),
      algosdk.encodeUint64(expirationTime),
    ]

    const txn = algosdk.makeApplicationNoOpTxnFromObject({
      from: params.depositorAddress,
      appIndex: params.escrowAppId,
      appArgs,
      suggestedParams: suggested,
    })

    const txn_b64 = Buffer.from(txn.toByte()).toString('base64')
    const [{ signedTx }] = await pera.signTransaction([{ txn: txn_b64 }])
    const { txId } = await algod.sendRawTransaction(signedTx).do()

    return { txId, explorerUrl: `https://lora.algokit.io/testnet/tx/${txId}` }
  }

  // Claim Algorand HTLC order (client-side signing via Pera)
  async algorandClaimOrder(params: {
    escrowAppId: number
    claimerAddress: string
    depositId: string // hashed secret
    secret: string
    network: string
  }): Promise<{ txId: string; explorerUrl: string }> {
    const networkCfg = getNetworkById(params.network)
    if (!networkCfg) throw new Error(`Unsupported network ${params.network}`)

    const algosdk: any = await import('algosdk')
    const pera = new PeraWalletConnect({ chainId: params.network.includes('testnet') ? 416001 : 416002 })
    const algod = new algosdk.Algodv2('', networkCfg.rpcUrl, '')

    const suggested = await algod.getTransactionParams().do()

    const appArgs = [
      new Uint8Array(Buffer.from('claim_order', 'utf8')),
      new Uint8Array(Buffer.from(params.depositId)),
      new Uint8Array(Buffer.from(params.secret)),
    ]

    const txn = algosdk.makeApplicationNoOpTxnFromObject({
      from: params.claimerAddress,
      appIndex: params.escrowAppId,
      appArgs,
      suggestedParams: suggested,
    })

    const txn_b64 = Buffer.from(txn.toByte()).toString('base64')
    const [{ signedTx }] = await pera.signTransaction([{ txn: txn_b64 }])
    const { txId } = await algod.sendRawTransaction(signedTx).do()

    return { txId, explorerUrl: `https://lora.algokit.io/testnet/tx/${txId}` }
  }

  // Refund Algorand HTLC order (client-side signing via Pera)
  async algorandRefundOrder(params: {
    escrowAppId: number
    depositorAddress: string
    depositId: string
    network: string
  }): Promise<{ txId: string; explorerUrl: string }> {
    const networkCfg = getNetworkById(params.network)
    if (!networkCfg) throw new Error(`Unsupported network ${params.network}`)

    const algosdk: any = await import('algosdk')
    const pera = new PeraWalletConnect({ chainId: params.network.includes('testnet') ? 416001 : 416002 })
    const algod = new algosdk.Algodv2('', networkCfg.rpcUrl, '')

    const suggested = await algod.getTransactionParams().do()

    const appArgs = [
      new Uint8Array(Buffer.from('refund_order', 'utf8')),
      new Uint8Array(Buffer.from(params.depositId)),
    ]

    const txn = algosdk.makeApplicationNoOpTxnFromObject({
      from: params.depositorAddress,
      appIndex: params.escrowAppId,
      appArgs,
      suggestedParams: suggested,
    })

    const txn_b64 = Buffer.from(txn.toByte()).toString('base64')
    const [{ signedTx }] = await pera.signTransaction([{ txn: txn_b64 }])
    const { txId } = await algod.sendRawTransaction(signedTx).do()

    return { txId, explorerUrl: `https://lora.algokit.io/testnet/tx/${txId}` }
  }
}

// Export singleton instance
export const appKitWalletService = AppKitWalletService.getInstance() 