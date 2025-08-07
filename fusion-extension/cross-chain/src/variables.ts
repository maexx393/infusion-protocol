// Production variables for cross-chain swaps
// This file contains all the configuration variables needed by the production utilities

// Environment variables with fallbacks
export const ALICE_PRIVATE_KEY = process.env.ALICE_PRIVATE_KEY || '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
export const CAROL_PRIVATE_KEY = process.env.CAROL_PRIVATE_KEY || '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
export const STACY_PRIVATE_KEY = process.env.STACY_PRIVATE_KEY || '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
export const SILVIO_PRIVATE_KEY = process.env.SILVIO_PRIVATE_KEY || '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

// Solana private keys (64 bytes)
export const SOLANA_PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY || '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
export const SOLANA_CLAIMER_PRIVATE_KEY = process.env.SOLANA_CLAIMER_PRIVATE_KEY || '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

// Algorand private keys
export const ALGORAND_PRIVATE_KEY = process.env.ALGORAND_PRIVATE_KEY || '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
export const ALGORAND_CLAIMER_PRIVATE_KEY = process.env.ALGORAND_CLAIMER_PRIVATE_KEY || '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

// NEAR account IDs
export const NEAR_DEPOSITOR_ACCOUNT = process.env.NEAR_DEPOSITOR_ACCOUNT || 'alice.defiunite.testnet';
export const NEAR_CLAIMER_ACCOUNT = process.env.NEAR_CLAIMER_ACCOUNT || 'carol.defiunite.testnet';

// Addresses
export const ALICE_ADDRESS = process.env.ALICE_ADDRESS || '0xC3aA518408938854DA4fb75feE44926304901865';
export const CAROL_ADDRESS = process.env.CAROL_ADDRESS || '0xD704Df5404EF372259d5B563179099abE34b7341';

// Solana addresses
export const SOLANA_DEPOSITOR_ADDRESS = process.env.SOLANA_DEPOSITOR_ADDRESS || 'HPzKmJz7XZvrNxdLeti8RkdNgRDzKErPYLXFMZncZfTb';
export const SOLANA_CLAIMER_ADDRESS = process.env.SOLANA_CLAIMER_ADDRESS || '8M3aUYmP5o4NSj6cTyDtoEsf5CdXD2sojEAceydgff7b';

// Algorand addresses
export const ALGORAND_DEPOSITOR_ADDRESS = process.env.ALGORAND_DEPOSITOR_ADDRESS || 'alice.defiunite.testnet';
export const ALGORAND_CLAIMER_ADDRESS = process.env.ALGORAND_CLAIMER_ADDRESS || 'carol.defiunite.testnet';

// RPC URLs
export const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/E-LLa6qeTOzgnGgIhe8q3';
export const POLYGON_AMOY_RPC_URL = process.env.POLYGON_AMOY_RPC_URL || 'https://polygon-amoy.g.alchemy.com/v2/E-LLa6qeTOzgnGgIhe8q3';
export const ARBITRUM_SEPOLIA_RPC_URL = process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc';
export const OPTIMISM_SEPOLIA_RPC_URL = process.env.OPTIMISM_SEPOLIA_RPC_URL || 'https://sepolia.optimism.io';
export const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';
export const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.testnet.solana.com';
export const NEAR_RPC_URL = process.env.NEAR_RPC_URL || 'https://rpc.testnet.near.org';
export const ALGORAND_RPC_URL = process.env.ALGORAND_RPC_URL || 'https://testnet-api.algonode.cloud';
export const BITCOIN_RPC_URL = process.env.BITCOIN_RPC_URL || 'http://localhost:8332';

// Chain IDs
export const ETHEREUM_CHAIN_ID = 11155111; // Sepolia
export const POLYGON_AMOY_CHAIN_ID = 80002;
export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
export const OPTIMISM_SEPOLIA_CHAIN_ID = 11155420;
export const BASE_SEPOLIA_CHAIN_ID = 84532;

// Contract addresses
export const EVM_ESCROW_CONTRACT = '0x41d3151f0eC68aAB26302164F9E00268A99dB783';
export const NEAR_ESCROW_CONTRACT = 'escrow.defiunite.testnet';
export const ALGORAND_ESCROW_CONTRACT = '743881611';
export const SOLANA_ESCROW_CONTRACT = 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS';

// Helper functions
export function getRpcUrl(): string {
  return POLYGON_AMOY_RPC_URL;
}

export function getChainId(): number {
  return POLYGON_AMOY_CHAIN_ID;
}

export function getEscrowContractAddress(): string {
  return EVM_ESCROW_CONTRACT;
}

export function getAliceAddress(): string {
  return ALICE_ADDRESS;
}

export function getCarolAddress(): string {
  return CAROL_ADDRESS;
}

export function getTransactionUrl(txHash: string): string {
  return `https://www.oklink.com/amoy/tx/${txHash}`;
}

export function getAddressUrl(address: string): string {
  return `https://www.oklink.com/amoy/address/${address}`;
}

export function hasValidPrivateKeys(): boolean {
  return ALICE_PRIVATE_KEY !== '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' &&
         CAROL_PRIVATE_KEY !== '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
}

export function hasValidAlicePrivateKey(): boolean {
  return ALICE_PRIVATE_KEY !== '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
}

export function hasValidCarolPrivateKey(): boolean {
  return CAROL_PRIVATE_KEY !== '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
}

export function hasValidAlgorandPrivateKeys(): boolean {
  return ALGORAND_PRIVATE_KEY !== '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' &&
         ALGORAND_CLAIMER_PRIVATE_KEY !== '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
}
