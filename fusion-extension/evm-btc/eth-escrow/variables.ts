import dotenv from 'dotenv';
import { ethers } from 'ethers';

// Load environment variables
dotenv.config();

// Core environment variables
export const ALICE_PRIVATE_KEY = process.env.ALICE_PRIVATE_KEY || '';
export const CAROL_PRIVATE_KEY = process.env.CAROL_PRIVATE_KEY || '';
export const DEV_PORTAL_API_TOKEN = process.env.DEV_PORTAL_API_TOKEN || '';

// Network configuration - only POLYGON_AMOY or ETH_MAINNET
export const NETWORK = (process.env.NETWORK || 'POLYGON_AMOY').toUpperCase() as 'POLYGON_AMOY' | 'ETH_MAINNET';

// Validate network value
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

// Get current RPC URL based on network
export const getRpcUrl = (): string => {
  return RPC_URLS[NETWORK];
};

// Get current chain ID based on network
export const getChainId = (): number => {
  return CHAIN_IDS[NETWORK];
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

// Get native token address (ETH address for EVM chains)
export const getNativeTokenAddress = (): string => {
  return '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'; // Native ETH address for 1inch SDK
};

// Get escrow contract address
export const getEscrowContractAddress = (): string => {
  return '0x41d3151f0eC68aAB26302164F9E00268A99dB783';
};
