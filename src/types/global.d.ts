// Global type definitions for blockchain wallet extensions

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (params: any) => void) => void
      removeListener: (event: string, callback: (params: any) => void) => void
      isMetaMask?: boolean
      chainId?: string
      selectedAddress?: string
    }
    solana?: {
      isPhantom?: boolean
      connect: () => Promise<{ publicKey: { toString: () => string } }>
      disconnect: () => Promise<void>
      signTransaction: (transaction: any) => Promise<any>
      signAllTransactions: (transactions: any[]) => Promise<any[]>
    }
    near?: {
      connect: () => Promise<{ accountId: string }>
      disconnect: () => Promise<void>
      signAndSendTransaction: (transaction: any) => Promise<any>
    }
    bitcoin?: {
      connect: () => Promise<{ address: string }>
      disconnect: () => Promise<void>
      signMessage: (message: string) => Promise<{ signature: string }>
    }
  }
}

export {} 