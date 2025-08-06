import algosdk from 'algosdk';

export interface AlgorandConfig {
  networkId: string;
  algodUrl: string;
  indexerUrl: string;
  explorerUrl: string;
  contractName: string;
  ownerAccount: string;
  escrowContract: string;
  solverContract: string;
  poolContract: string;
}

export interface AlgorandAccount {
  address: string;
  privateKey: string;
  publicKey: string;
  mnemonic?: string;
}

export interface AlgorandToken {
  assetId: number;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}

// Network configurations
export const ALGORAND_NETWORKS = {
  testnet: {
    name: 'testnet',
    algodUrl: 'https://testnet-api.algonode.cloud',
    indexerUrl: 'https://testnet-idx.algonode.cloud',
    explorerUrl: 'https://testnet.algoexplorer.io',
    port: 443,
    token: ''
  },
  mainnet: {
    name: 'mainnet',
    algodUrl: 'https://mainnet-api.algonode.cloud',
    indexerUrl: 'https://mainnet-idx.algonode.cloud',
    explorerUrl: 'https://algoexplorer.io',
    port: 443,
    token: ''
  },
  localnet: {
    name: 'localnet',
    algodUrl: 'http://localhost',
    indexerUrl: 'http://localhost:8980',
    explorerUrl: 'http://localhost:4001',
    port: 4001,
    token: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  }
};

export const getAlgorandConfig = (network: 'testnet' | 'mainnet' | 'localnet' = 'testnet'): AlgorandConfig => {
  const networkConfig = ALGORAND_NETWORKS[network];
  
  return {
    networkId: networkConfig.name,
    algodUrl: networkConfig.algodUrl,
    indexerUrl: networkConfig.indexerUrl,
    explorerUrl: networkConfig.explorerUrl,
    contractName: 'fusion-contracts',
    ownerAccount: 'defiunite.testnet',
    escrowContract: 'escrow.defiunite.testnet',
    solverContract: 'solver.defiunite.testnet',
    poolContract: 'pool.defiunite.testnet'
  };
};

export class AlgorandAccountManager {
  private algodClient: algosdk.Algodv2;
  private indexerClient: algosdk.Indexer;
  private config: AlgorandConfig;

  constructor(config: AlgorandConfig) {
    this.config = config;
    this.algodClient = new algosdk.Algodv2('', config.algodUrl, '');
    this.indexerClient = new algosdk.Indexer('', config.indexerUrl, '');
  }

  async createAccount(): Promise<AlgorandAccount> {
    const account = algosdk.generateAccount();
    const mnemonic = algosdk.secretKeyToMnemonic(account.sk);
    
    return {
      address: account.addr,
      privateKey: Buffer.from(account.sk).toString('base64'),
      publicKey: Buffer.from(account.pk).toString('base64'),
      mnemonic
    };
  }

  async getAccountInfo(address: string): Promise<any> {
    try {
      const accountInfo = await this.algodClient.accountInformation(address).do();
      return accountInfo;
    } catch (error) {
      console.error('Error getting account info:', error);
      throw error;
    }
  }

  async getAccountBalance(address: string): Promise<number> {
    try {
      const accountInfo = await this.getAccountInfo(address);
      return accountInfo.amount;
    } catch (error) {
      console.error('Error getting account balance:', error);
      return 0;
    }
  }

  getAlgodClient(): algosdk.Algodv2 {
    return this.algodClient;
  }

  getIndexerClient(): algosdk.Indexer {
    return this.indexerClient;
  }

  static generateKeyPair(): { privateKey: string; publicKey: string } {
    const account = algosdk.generateAccount();
    return {
      privateKey: Buffer.from(account.sk).toString('base64'),
      publicKey: Buffer.from(account.pk).toString('base64')
    };
  }

  static createTestAccounts(): { alice: AlgorandAccount; carol: AlgorandAccount } {
    const aliceAccount = algosdk.generateAccount();
    const carolAccount = algosdk.generateAccount();

    return {
      alice: {
        address: aliceAccount.addr,
        privateKey: Buffer.from(aliceAccount.sk).toString('base64'),
        publicKey: Buffer.from(aliceAccount.pk).toString('base64'),
        mnemonic: algosdk.secretKeyToMnemonic(aliceAccount.sk)
      },
      carol: {
        address: carolAccount.addr,
        privateKey: Buffer.from(carolAccount.sk).toString('base64'),
        publicKey: Buffer.from(carolAccount.pk).toString('base64'),
        mnemonic: algosdk.secretKeyToMnemonic(carolAccount.sk)
      }
    };
  }
}

export class AlgorandTokenUtils {
  static microAlgosToAlgos(microAlgos: number): number {
    return microAlgos / 1000000;
  }

  static algosToMicroAlgos(algos: number): number {
    return algos * 1000000;
  }

  static formatAlgos(microAlgos: number, decimals: number = 6): string {
    const algos = this.microAlgosToAlgos(microAlgos);
    return algos.toFixed(decimals);
  }

  static formatAssetAmount(amount: number, decimals: number): string {
    return (amount / Math.pow(10, decimals)).toFixed(decimals);
  }

  static assetAmountToRaw(amount: number, decimals: number): number {
    return amount * Math.pow(10, decimals);
  }
}

export class AlgorandContractUtils {
  static generateHashlock(secret: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(secret).digest('hex');
  }

  static generateSecret(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('base64');
  }

  static generateOrderId(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static isValidAddress(address: string): boolean {
    try {
      algosdk.decodeAddress(address);
      return true;
    } catch {
      return false;
    }
  }

  static isValidAmount(amount: string): boolean {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  }

  static async waitForConfirmation(algodClient: algosdk.Algodv2, txId: string, timeout: number = 10): Promise<any> {
    const start = Date.now();
    while (Date.now() - start < timeout * 1000) {
      try {
        const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
        if (pendingInfo['confirmed-round'] && pendingInfo['confirmed-round'] > 0) {
          return pendingInfo;
        }
        if (pendingInfo['pool-error'] && pendingInfo['pool-error'].length > 0) {
          throw new Error(`Transaction failed: ${pendingInfo['pool-error']}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error waiting for confirmation:', error);
        throw error;
      }
    }
    throw new Error('Transaction confirmation timeout');
  }
} 