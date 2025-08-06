import { Near, keyStores, KeyPair } from 'near-api-js';
import * as crypto from 'crypto';

export interface NEARConfig {
  networkId: string;
  nodeUrl: string;
  walletUrl: string;
  helperUrl: string;
  explorerUrl: string;
  contractName: string;
  ownerAccount: string;
}

export interface NEARAccount {
  accountId: string;
  privateKey: string;
  publicKey: string;
}

// NEAR Network Configurations
export const NEAR_NETWORKS = {
  testnet: {
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://explorer.testnet.near.org',
    contractName: 'escrow.defiunite.testnet',
    ownerAccount: 'defiunite.testnet'
  },
  mainnet: {
    networkId: 'mainnet',
    nodeUrl: 'https://rpc.mainnet.near.org',
    walletUrl: 'https://wallet.near.org',
    helperUrl: 'https://helper.mainnet.near.org',
    explorerUrl: 'https://explorer.near.org',
    contractName: 'escrow.defiunite.near',
    ownerAccount: 'defiunite.near'
  }
} as const;

// Default to testnet
export const getNEARConfig = (network: 'testnet' | 'mainnet' = 'testnet'): NEARConfig => {
  return NEAR_NETWORKS[network];
};

// NEAR Account Management
export class NEARAccountManager {
  private keyStore: any;
  private near: Near;

  constructor(config: NEARConfig) {
    this.keyStore = new keyStores.InMemoryKeyStore();
    this.near = new Near({
      keyStore: this.keyStore,
      networkId: config.networkId,
      nodeUrl: config.nodeUrl,
    });
  }

  // Add account with private key
  async addAccount(accountId: string, privateKey: string): Promise<void> {
    const keyPair = KeyPair.fromString(privateKey as any);
    await this.keyStore.setKey(this.near.config.networkId, accountId, keyPair);
  }

  // Get account
  async getAccount(accountId: string) {
    return await this.near.account(accountId);
  }

  // Get NEAR instance
  getNear(): Near {
    return this.near;
  }

  // Generate new key pair
  static generateKeyPair(): { privateKey: string; publicKey: string } {
    const keyPair = KeyPair.fromRandom('ed25519');
    return {
      privateKey: keyPair.toString(),
      publicKey: keyPair.getPublicKey().toString()
    };
  }

  // Create test accounts for development
  static createTestAccounts(): { alice: NEARAccount; carol: NEARAccount } {
    const aliceKeys = this.generateKeyPair();
    const carolKeys = this.generateKeyPair();

    return {
      alice: {
        accountId: 'alice.testnet',
        privateKey: aliceKeys.privateKey,
        publicKey: aliceKeys.publicKey
      },
      carol: {
        accountId: 'carol.testnet',
        privateKey: carolKeys.privateKey,
        publicKey: carolKeys.publicKey
      }
    };
  }
}

// NEAR Token Utilities
export class NEARTokenUtils {
  // Convert NEAR to yoctoNEAR (smallest unit)
  static nearToYocto(near: string | number): string {
    const nearBN = new (require('bn.js'))(near.toString());
    const yoctoPerNear = new (require('bn.js'))('1000000000000000000000000'); // 10^24
    return nearBN.mul(yoctoPerNear).toString();
  }

  // Convert yoctoNEAR to NEAR
  static yoctoToNear(yocto: string | number): string {
    const yoctoBN = new (require('bn.js'))(yocto.toString());
    const yoctoPerNear = new (require('bn.js'))('1000000000000000000000000'); // 10^24
    const nearBN = yoctoBN.div(yoctoPerNear);
    const remainder = yoctoBN.mod(yoctoPerNear);
    
    if (remainder.isZero()) {
      return nearBN.toString();
    } else {
      return `${nearBN.toString()}.${remainder.toString().padStart(24, '0').replace(/0+$/, '')}`;
    }
  }

  // Format NEAR amount for display
  static formatNEAR(yocto: string | number, decimals: number = 4): string {
    const near = this.yoctoToNear(yocto);
    const num = parseFloat(near);
    return num.toFixed(decimals);
  }
}

// NEAR Contract Utilities
export class NEARContractUtils {
  // Generate hashlock from secret
  static generateHashlock(secret: string): string {
    return crypto.createHash('sha256').update(secret).digest('hex');
  }

  // Generate secret
  static generateSecret(): string {
    return crypto.randomBytes(32).toString('base64');
  }

  // Generate order ID
  static generateOrderId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  // Validate NEAR account ID format
  static isValidAccountId(accountId: string): boolean {
    // NEAR account ID rules: 2-64 characters, lowercase letters, numbers, dots, hyphens, underscores
    const accountIdRegex = /^[a-z0-9._-]{2,64}$/;
    return accountIdRegex.test(accountId);
  }

  // Validate NEAR amount
  static isValidAmount(amount: string): boolean {
    try {
      const num = parseFloat(amount);
      return num > 0 && !isNaN(num);
    } catch {
      return false;
    }
  }
}

// Export default configuration
export const DEFAULT_NEAR_CONFIG = getNEARConfig('testnet'); 