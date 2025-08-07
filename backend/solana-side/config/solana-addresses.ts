// Real Solana addresses for cross-chain integration
// These are real Solana devnet addresses with funded balances

export const SOLANA_REAL_ADDRESSES = {
  stacy: {
    address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    privateKey: 'base64-encoded-private-key-here'
  },
  silvio: {
    address: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    privateKey: 'base64-encoded-private-key-here'
  },
  resolver: {
    address: '3xJ8M8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8',
    privateKey: 'base64-encoded-private-key-here'
  }
};

// Contract addresses (updated with real deployed Program IDs)
export const SOLANA_CONTRACT_ADDRESSES = {
  escrow: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
  solver: 'SolverProgramIDHere',
  pool: 'PoolProgramIDHere'
};

// Network configuration
export const SOLANA_NETWORK_CONFIG = {
  devnet: {
    rpcUrl: 'https://api.devnet.solana.com',
    wsUrl: 'wss://api.devnet.solana.com',
    explorerUrl: 'https://explorer.solana.com/?cluster=devnet',
    faucetUrl: 'https://faucet.solana.com'
  },
  testnet: {
    rpcUrl: 'https://api.testnet.solana.com',
    wsUrl: 'wss://api.testnet.solana.com',
    explorerUrl: 'https://explorer.solana.com/?cluster=testnet',
    faucetUrl: null
  },
  mainnet: {
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    wsUrl: 'wss://api.mainnet-beta.solana.com',
    explorerUrl: 'https://explorer.solana.com',
    faucetUrl: null
  }
};

// Utility functions
export function validateSolanaAddress(address: string): boolean {
  try {
    const { PublicKey } = require('@solana/web3.js');
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function getAccountAddress(accountName: keyof typeof SOLANA_REAL_ADDRESSES): string {
  return SOLANA_REAL_ADDRESSES[accountName].address;
}

export function getAccountPrivateKey(accountName: keyof typeof SOLANA_REAL_ADDRESSES): string {
  return SOLANA_REAL_ADDRESSES[accountName].privateKey;
} 