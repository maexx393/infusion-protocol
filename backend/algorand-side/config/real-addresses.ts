// Auto-generated Algorand addresses configuration
// Generated on: 2025-08-06T07:42:49.533Z
// WARNING: Keep this file secure and never commit to version control

export const ALGORAND_REAL_ADDRESSES = {
  deployer: {
    address: '6XUCBPC3ERAJN63K67JVRC2ZVJV6HTXSI24HJWANPM5WOGB3PDEJJJIWIU',
    mnemonic: 'purity wish habit loyal burden gorilla forum phone educate turn feed torch champion obey idea tower congress invite vacuum cloud birth kind crunch ability capital'
  },
  alice: {
    address: 'UGIZF2BAMX24PRVQEU2DW4UDG6P5R7UKTFHSE5J75Q6XESHP4WQIBGH6QU',
    mnemonic: 'hamster leave nurse labor equal battle mosquito broken spend swift dance crouch marine current observe brown ostrich crater outdoor furnace confirm endless myself abstract wrist'
  },
  carol: {
    address: '4VZTY6CVXP2GGTICCNU5E4AMQRKNVDHHDGAIKWPKACNM2RTSEM64OXIK4Y',
    mnemonic: 'must admit frown firm senior prepare word dose picture design must artefact diamond mansion talent jeans imitate beach inner medal whale funny thing abstract victory'
  },
  resolver: {
    address: '5KUWYUYVK64M6EW6LYBKO53WP7T4XMON5JJE7UUDUTAKBUAXDOQPURVCY4',
    mnemonic: 'carbon broom horror scissors drop busy empower ostrich ladder fix lock vehicle satoshi subject oblige ladder wrong valve exhaust couch pulse asset prize able bacon'
  }
};

// Contract addresses (will be populated after deployment)
export const ALGORAND_CONTRACT_ADDRESSES = {
  escrow: 'REPLACE_WITH_ESCROW_CONTRACT_ID',
  solver: 'REPLACE_WITH_SOLVER_CONTRACT_ID', 
  pool: 'REPLACE_WITH_POOL_CONTRACT_ID'
};

// Network configuration
export const ALGORAND_NETWORK_CONFIG = {
  testnet: {
    algodUrl: 'https://testnet-api.algonode.cloud',
    indexerUrl: 'https://testnet-idx.algonode.cloud',
    explorerUrl: 'https://testnet.algoexplorer.io',
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
  const account = ALGORAND_REAL_ADDRESSES[accountName];
  if (!account) {
    throw new Error(`Account ${accountName} not found in configuration`);
  }
  return account.address;
}

export function getAccountMnemonic(accountName: keyof typeof ALGORAND_REAL_ADDRESSES): string {
  const account = ALGORAND_REAL_ADDRESSES[accountName];
  if (!account) {
    throw new Error(`Account ${accountName} not found in configuration`);
  }
  return account.mnemonic;
}
