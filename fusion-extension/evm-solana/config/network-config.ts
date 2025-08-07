import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

export interface SolanaConfig {
  networkId: string;
  rpcUrl: string;
  wsUrl: string;
  explorerUrl: string;
  programId: string;
  authorityAccount: string;
  escrowProgram: string;
  solverProgram: string;
  poolProgram: string;
}

export interface SolanaAccount {
  address: string;
  privateKey: string;
  publicKey: string;
  mnemonic?: string;
}

export interface SolanaToken {
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}

// Network configurations
export const SOLANA_NETWORKS = {
  devnet: {
    networkId: 'devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    wsUrl: 'wss://api.devnet.solana.com',
    explorerUrl: 'https://explorer.solana.com/?cluster=devnet',
    programId: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
    authorityAccount: '',
    escrowProgram: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
    solverProgram: '',
    poolProgram: ''
  },
  testnet: {
    networkId: 'testnet',
    rpcUrl: 'https://api.testnet.solana.com',
    wsUrl: 'wss://api.testnet.solana.com',
    explorerUrl: 'https://explorer.solana.com/?cluster=testnet',
    programId: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
    authorityAccount: '',
    escrowProgram: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
    solverProgram: '',
    poolProgram: ''
  },
  mainnet: {
    networkId: 'mainnet',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    wsUrl: 'wss://api.mainnet-beta.solana.com',
    explorerUrl: 'https://explorer.solana.com',
    programId: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
    authorityAccount: '',
    escrowProgram: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
    solverProgram: '',
    poolProgram: ''
  }
};

export const getSolanaConfig = (network: 'devnet' | 'testnet' | 'mainnet' = 'devnet'): SolanaConfig => {
  return SOLANA_NETWORKS[network];
};

export class SolanaAccountManager {
  private connection: Connection;
  private config: SolanaConfig;

  constructor(config: SolanaConfig) {
    this.config = config;
    this.connection = new Connection(config.rpcUrl, 'confirmed');
  }

  async createAccount(): Promise<SolanaAccount> {
    const keypair = Keypair.generate();
    
    return {
      address: keypair.publicKey.toString(),
      privateKey: Buffer.from(keypair.secretKey).toString('base64'),
      publicKey: keypair.publicKey.toString(),
      mnemonic: undefined // Solana doesn't use mnemonics like other chains
    };
  }

  async getAccountInfo(address: string): Promise<any> {
    const publicKey = new PublicKey(address);
    return await this.connection.getAccountInfo(publicKey);
  }

  async getAccountBalance(address: string): Promise<number> {
    const publicKey = new PublicKey(address);
    const balance = await this.connection.getBalance(publicKey);
    return balance / 1e9; // Convert lamports to SOL
  }

  getConnection(): Connection {
    return this.connection;
  }

  getConfig(): SolanaConfig {
    return this.config;
  }

  static generateKeyPair(): { privateKey: string; publicKey: string } {
    const keypair = Keypair.generate();
    return {
      privateKey: Buffer.from(keypair.secretKey).toString('base64'),
      publicKey: keypair.publicKey.toString()
    };
  }

  static createTestAccounts(): { alice: SolanaAccount; carol: SolanaAccount } {
    const aliceKeypair = Keypair.generate();
    const carolKeypair = Keypair.generate();

    return {
      alice: {
        address: aliceKeypair.publicKey.toString(),
        privateKey: Buffer.from(aliceKeypair.secretKey).toString('base64'),
        publicKey: aliceKeypair.publicKey.toString()
      },
      carol: {
        address: carolKeypair.publicKey.toString(),
        privateKey: Buffer.from(carolKeypair.secretKey).toString('base64'),
        publicKey: carolKeypair.publicKey.toString()
      }
    };
  }
}

export class SolanaTokenUtils {
  static lamportsToSol(lamports: number): number {
    return lamports / 1e9;
  }

  static solToLamports(sol: number): number {
    return Math.floor(sol * 1e9);
  }

  static formatSol(lamports: number, decimals: number = 9): string {
    return (lamports / Math.pow(10, decimals)).toFixed(decimals);
  }

  static formatTokenAmount(amount: number, decimals: number): string {
    return (amount / Math.pow(10, decimals)).toFixed(decimals);
  }

  static tokenAmountToRaw(amount: number, decimals: number): number {
    return Math.floor(amount * Math.pow(10, decimals));
  }
}

export class SolanaContractUtils {
  static generateHashlock(secret: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(secret).digest('hex');
  }

  static generateSecret(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  static generateOrderId(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('hex');
  }

  static isValidAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  static isValidAmount(amount: string): boolean {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  }

  static async waitForConfirmation(connection: Connection, signature: string, timeout: number = 30): Promise<any> {
    const start = Date.now();
    while (Date.now() - start < timeout * 1000) {
      try {
        const confirmation = await connection.getSignatureStatus(signature);
        if (confirmation?.value?.confirmationStatus === 'confirmed' || 
            confirmation?.value?.confirmationStatus === 'finalized') {
          return confirmation;
        }
      } catch (error) {
        console.log('Waiting for confirmation...');
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error('Transaction confirmation timeout');
  }
} 