// Real Solana addresses for cross-chain integration
// These are real Solana testnet addresses with funded balances

export const SOLANA_REAL_ADDRESSES = {
  resolver: {
    address: 'HPzKmJz7XZvrNxdLeti8RkdNgRDzKErPYLXFMZncZfTb',
    privateKey: 'Lly5DnGwluNZfDHMQE4nb7C932AhMDrc2xLLiNKCQ9nznpWjpEr135yXZBF/8T6mwE4Ahkls831rvoGnijfMrg=='
  },
  silvio: {
    address: '8M3aUYmP5o4NSj6cTyDtoEsf5CdXD2sojEAceydgff7b',
    privateKey: '3U7ttqtIdNzG71kfJgVhvb6mJpjr0aIkts2z2OXesKZtJFayrDh++MD1kzCdB2zDTuyGuHQpIL/naC6VxNaSNg=='
  },
  stacy: {
    address: 'BQkYVpnw6Nk1v2EYYq5e7vBCKMmM7oXttWkMGro1HKbM',
    privateKey: '4o3J0MqT1tU8Dg/sLq9xnTQ6HlcoYWnkqCjUp7qHirWaqnZP7eE/aXlhZmSaef+VXASmV6cSvzKnnZjBIiKXUA=='
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