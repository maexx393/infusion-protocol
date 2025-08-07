import dotenv from 'dotenv';
import { ethers } from 'ethers';

// Load environment variables
dotenv.config();

// Core environment variables
export const ALICE_PRIVATE_KEY = process.env.ALICE_PRIVATE_KEY || '';
export const CAROL_PRIVATE_KEY = process.env.CAROL_PRIVATE_KEY || '';
export const DEV_PORTAL_API_TOKEN = process.env.DEV_PORTAL_API_TOKEN || '';

// Algorand-specific private keys (to avoid conflicts with EVM)
export const STACY_PRIVATE_KEY = process.env.STACY_PRIVATE_KEY || '';
export const SILVIO_PRIVATE_KEY = process.env.SILVIO_PRIVATE_KEY || '';

// Helper functions for Algorand private key validation
export const hasValidStacyPrivateKey = (): boolean => {
  return STACY_PRIVATE_KEY.length > 100 && STACY_PRIVATE_KEY.startsWith('0x') && 
         STACY_PRIVATE_KEY !== '0x1234567890123456789012345678901234567890123456789012345678901234';
};

export const hasValidSilvioPrivateKey = (): boolean => {
  return SILVIO_PRIVATE_KEY.length > 100 && SILVIO_PRIVATE_KEY.startsWith('0x') && 
         SILVIO_PRIVATE_KEY !== '0x1234567890123456789012345678901234567890123456789012345678901234';
};

export const hasValidAlgorandPrivateKeys = (): boolean => {
  return hasValidStacyPrivateKey() && hasValidSilvioPrivateKey();
};

// NEAR Configuration
export const NEAR_NETWORK = process.env.NEAR_NETWORK || 'testnet';
export const NEAR_OWNER_ACCOUNT = process.env.NEAR_OWNER_ACCOUNT || 'defiunite.testnet';
export const NEAR_ESCROW_CONTRACT = process.env.NEAR_ESCROW_CONTRACT || 'escrow.defiunite.testnet';
export const NEAR_SOLVER_CONTRACT = process.env.NEAR_SOLVER_CONTRACT || 'solver.defiunite.testnet';
export const NEAR_POOL_CONTRACT = process.env.NEAR_POOL_CONTRACT || 'pool.defiunite.testnet';
export const NEAR_NODE_URL = process.env.NEAR_NODE_URL || 'https://rpc.testnet.near.org';

// Algorand Configuration
export const ALGORAND_NETWORK = process.env.ALGORAND_NETWORK || 'testnet';
export const ALGORAND_ALGOD_URL = process.env.ALGORAND_ALGOD_URL || 'https://testnet-api.algonode.cloud';
export const ALGORAND_INDEXER_URL = process.env.ALGORAND_INDEXER_URL || 'https://testnet-idx.algonode.cloud';
export const ALGORAND_ESCROW_CONTRACT = process.env.ALGORAND_ESCROW_CONTRACT || '743881611';
export const ALGORAND_SOLVER_CONTRACT = process.env.ALGORAND_SOLVER_CONTRACT || '743881612';
export const ALGORAND_POOL_CONTRACT = process.env.ALGORAND_POOL_CONTRACT || '743881613';

// Network configuration
export const NETWORK = process.env.NETWORK || 'POLYGON_AMOY';

if (NETWORK !== 'POLYGON_AMOY' && NETWORK !== 'ETH_MAINNET') {
  throw new Error('NETWORK must be either "POLYGON_AMOY" or "ETH_MAINNET"');
}

// RPC URLs - only for supported networks
export const RPC_URLS = {
  POLYGON_AMOY: process.env.POLYGON_AMOY_RPC_URL || 'https://polygon-amoy.g.alchemy.com/v2/E-LLa6qeTOzgnGgIhe8q3',
  ETH_MAINNET: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
} as const;

// Chain IDs for supported networks
export const CHAIN_IDS = {
  POLYGON_AMOY: 80002,
  ETH_MAINNET: 1,
} as const;

// Block explorer URLs for supported networks
export const BLOCK_EXPLORERS = {
  POLYGON_AMOY: 'https://www.oklink.com/amoy',
  ETH_MAINNET: 'https://etherscan.io',
} as const;

// Get current RPC URL based on network
export const getRpcUrl = (): string => {
  return RPC_URLS[NETWORK];
};

// Get current chain ID based on network
export const getChainId = (): number => {
  return CHAIN_IDS[NETWORK];
};

// Get current block explorer URL based on network
export const getBlockExplorerUrl = (): string => {
  return BLOCK_EXPLORERS[NETWORK];
};

// Get block explorer URL for a specific transaction hash
export const getTransactionUrl = (txHash: string): string => {
  const baseUrl = getBlockExplorerUrl();
  return `${baseUrl}/tx/${txHash}`;
};

// Get block explorer URL for a specific address
export const getAddressUrl = (address: string): string => {
  const baseUrl = getBlockExplorerUrl();
  return `${baseUrl}/address/${address}`;
};

// Get block explorer URL for a specific block
export const getBlockUrl = (blockNumber: string | number): string => {
  const baseUrl = getBlockExplorerUrl();
  return `${baseUrl}/block/${blockNumber}`;
};

// Validation helpers
export const hasValidAlicePrivateKey = (): boolean => {
  return ALICE_PRIVATE_KEY.length > 0 && ALICE_PRIVATE_KEY !== '0x';
};

export const hasValidCarolPrivateKey = (): boolean => {
  return CAROL_PRIVATE_KEY.length > 0 && CAROL_PRIVATE_KEY !== '0x';
};

export const hasValidPrivateKeys = (): boolean => {
  return hasValidAlicePrivateKey() && hasValidCarolPrivateKey();
};

export const hasValidApiToken = (): boolean => {
  return DEV_PORTAL_API_TOKEN.length > 0;
};

// Get Alice's address from her private key
export const getAliceAddress = (): string => {
  if (!hasValidAlicePrivateKey()) {
    throw new Error('ALICE_PRIVATE_KEY is not set or invalid');
  }
  const aliceWallet = new ethers.Wallet(ALICE_PRIVATE_KEY);
  return aliceWallet.address;
};

// Get Carol's address from her private key
export const getCarolAddress = (): string => {
  if (!hasValidCarolPrivateKey()) {
    throw new Error('CAROL_PRIVATE_KEY is not set or invalid');
  }
  const carolWallet = new ethers.Wallet(CAROL_PRIVATE_KEY);
  return carolWallet.address;
};

// Get native token address (ETH address for EVM chains)
export const getNativeTokenAddress = (): string => {
  return '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'; // Native ETH address for 1inch SDK
};

// Get escrow contract address
export const getEscrowContractAddress = (): string => {
  return '0x41d3151f0eC68aAB26302164F9E00268A99dB783';
};

// NEAR Configuration helpers
export const getNEARConfig = () => {
  return {
    network: NEAR_NETWORK,
    nodeUrl: NEAR_NODE_URL,
    ownerAccount: NEAR_OWNER_ACCOUNT,
    escrowContract: NEAR_ESCROW_CONTRACT,
    solverContract: NEAR_SOLVER_CONTRACT,
    poolContract: NEAR_POOL_CONTRACT,
  };
};

export const getNEARExplorerUrl = (accountId: string): string => {
  return `https://explorer.testnet.near.org/accounts/${accountId}`;
};

export const getNEARTransactionUrl = (txHash: string): string => {
  return `https://explorer.testnet.near.org/transactions/${txHash}`;
};

// Algorand Configuration helpers
export const getAlgorandConfig = () => {
  return {
    network: ALGORAND_NETWORK,
    algodUrl: ALGORAND_ALGOD_URL,
    indexerUrl: ALGORAND_INDEXER_URL,
    escrowContract: ALGORAND_ESCROW_CONTRACT,
    solverContract: ALGORAND_SOLVER_CONTRACT,
    poolContract: ALGORAND_POOL_CONTRACT,
  };
};

export const getAlgorandExplorerUrl = (appId: string): string => {
  return `https://lora.algokit.io/testnet/application/${appId}`;
};

export const getAlgorandTransactionUrl = (txHash: string): string => {
  return `https://lora.algokit.io/testnet/tx/${txHash}`;
};

export const getAlgorandAddressUrl = (address: string): string => {
  return `https://lora.algokit.io/testnet/address/${address}`;
};
