// Real Algorand addresses and mnemonics for cross-chain integration
// These are real Algorand testnet addresses with funded balances

export const ALGORAND_REAL_ADDRESSES = {
  stacy: {
    address: 'UGIZF2BAMX24PRVQEU2DW4UDG6P5R7UKTFHSE5J75Q6XESHP4WQIBGH6QU',
    mnemonic: 'hamster leave nurse labor equal battle mosquito broken spend swift dance crouch marine current observe brown ostrich crater outdoor furnace confirm endless myself abstract wrist'
  },
  silvio: {
    address: '4VZTY6CVXP2GGTICCNU5E4AMQRKNVDHHDGAIKWPKACNM2RTSEM64OXIK4Y',
    mnemonic: 'must admit frown firm senior prepare word dose picture design must artefact diamond mansion talent jeans imitate beach inner medal whale funny thing abstract victory'
  },
  resolver: {
    address: '5KUWYUYVK64M6EW6LYBKO53WP7T4XMON5JJE7UUDUTAKBUAXDOQPURVCY4',
    mnemonic: 'carbon broom horror scissors drop busy empower ostrich ladder fix lock vehicle satoshi subject oblige ladder wrong valve exhaust couch pulse asset prize able bacon'
  }
};

// Contract addresses (updated with real deployed App IDs)
export const ALGORAND_CONTRACT_ADDRESSES = {
  escrow: '743876974',
  solver: '743876975', 
  pool: '743876985'
};

// Network configuration
export const ALGORAND_NETWORK_CONFIG = {
  testnet: {
    algodUrl: 'https://testnet-api.algonode.cloud',
    indexerUrl: 'https://testnet-idx.algonode.cloud',
    explorerUrl: 'https://lora.algokit.io/testnet',
    dispenserUrl: 'https://bank.testnet.algorand.network/'
  },
  mainnet: {
    algodUrl: 'https://mainnet-api.algonode.cloud',
    indexerUrl: 'https://mainnet-idx.algonode.cloud',
    explorerUrl: 'https://algoexplorer.io',
    dispenserUrl: null
  }
};

// Utility functions
export function validateAlgorandAddress(address: string): boolean {
  return address.length === 58 && /^[A-Z2-7]+$/.test(address);
}

export function getAccountAddress(accountName: keyof typeof ALGORAND_REAL_ADDRESSES): string {
  return ALGORAND_REAL_ADDRESSES[accountName].address;
}

export function getAccountMnemonic(accountName: keyof typeof ALGORAND_REAL_ADDRESSES): string {
  return ALGORAND_REAL_ADDRESSES[accountName].mnemonic;
}
