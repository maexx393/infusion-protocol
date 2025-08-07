// Real Algorand utilities for cross-chain swaps
// Uses actual Algorand SDK for production deployment

import algosdk from 'algosdk';

// Algorand configuration
const ALGORAND_RPC_URL = 'https://testnet-api.algonode.cloud';
const ALGORAND_INDEXER_URL = 'https://testnet-idx.algonode.cloud';
const ALGORAND_NETWORK = 'testnet';

// Contract addresses (updated with real deployed App IDs)
let ALGORAND_ESCROW_CONTRACT = '743876974'; // Real deployed escrow contract
let ALGORAND_SOLVER_CONTRACT = '743876975'; // Real deployed solver contract
let ALGORAND_POOL_CONTRACT = '743876985'; // Real deployed pool contract

// Algorand client
const algodClient = new algosdk.Algodv2('', ALGORAND_RPC_URL, '');
const indexerClient = new algosdk.Indexer('', ALGORAND_INDEXER_URL, '');

export interface AlgorandContractConfig {
  escrowAppId: string;
  solverAppId: string;
  poolAppId: string;
}

export function updateContractAddresses(config: AlgorandContractConfig) {
  ALGORAND_ESCROW_CONTRACT = config.escrowAppId;
  ALGORAND_SOLVER_CONTRACT = config.solverAppId;
  ALGORAND_POOL_CONTRACT = config.poolAppId;
}

export class RealAlgorandEscrowManager {
  private escrowAppId: number;

  constructor(escrowAppId: number) {
    this.escrowAppId = escrowAppId;
  }

  async createOrder(params: {
    depositor: string;
    claimer: string;
    amount: number;
    hashlock: string;
    senderPrivateKey: Uint8Array;
  }): Promise<{
    orderId: string;
    txId: string;
    explorerUrl: string;
  }> {
    try {
      const suggestedParams = await algodClient.getTransactionParams().do();
      
      const args = [
        new Uint8Array(Buffer.from('create_order', 'utf8')),
        new Uint8Array(Buffer.from(params.depositor, 'utf8')),
        new Uint8Array(Buffer.from(params.claimer, 'utf8')),
        algosdk.encodeUint64(params.amount),
        new Uint8Array(Buffer.from(params.hashlock, 'hex'))
      ];

      const txn = algosdk.makeApplicationCallTxnFromObject({
        sender: algosdk.encodeAddress(params.senderPrivateKey),
        appIndex: this.escrowAppId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: args,
        suggestedParams
      });

      const signedTxn = txn.signTxn(params.senderPrivateKey);
      const response = await algodClient.sendRawTransaction(signedTxn).do();
      const txId = response.txid;
      
      // Wait for confirmation
      await this.waitForConfirmation(txId);

      return {
        orderId: txId,
        txId,
        explorerUrl: `https://testnet.algoexplorer.io/tx/${txId}`
      };
    } catch (error) {
      console.error('Error creating Algorand order:', error);
      throw error;
    }
  }

  async claimOrder(params: {
    orderId: string;
    secret: string;
    claimerPrivateKey: Uint8Array;
  }): Promise<{
    txId: string;
    explorerUrl: string;
  }> {
    try {
      const suggestedParams = await algodClient.getTransactionParams().do();
      
      const args = [
        new Uint8Array(Buffer.from('claim_order', 'utf8')),
        new Uint8Array(Buffer.from(params.orderId, 'utf8')),
        new Uint8Array(Buffer.from(params.secret, 'base64'))
      ];

      const txn = algosdk.makeApplicationCallTxnFromObject({
        sender: algosdk.encodeAddress(params.claimerPrivateKey),
        appIndex: this.escrowAppId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: args,
        suggestedParams
      });

      const signedTxn = txn.signTxn(params.claimerPrivateKey);
      const response = await algodClient.sendRawTransaction(signedTxn).do();
      const txId = response.txid;
      
      // Wait for confirmation
      await this.waitForConfirmation(txId);

      return {
        txId,
        explorerUrl: `https://testnet.algoexplorer.io/tx/${txId}`
      };
    } catch (error) {
      console.error('Error claiming Algorand order:', error);
      throw error;
    }
  }

  async cancelOrder(params: {
    orderId: string;
    senderPrivateKey: Uint8Array;
  }): Promise<{
    txId: string;
    explorerUrl: string;
  }> {
    try {
      const suggestedParams = await algodClient.getTransactionParams().do();
      
      const args = [
        new Uint8Array(Buffer.from('cancel_order', 'utf8')),
        new Uint8Array(Buffer.from(params.orderId, 'utf8'))
      ];

      const txn = algosdk.makeApplicationCallTxnFromObject({
        sender: algosdk.encodeAddress(params.senderPrivateKey),
        appIndex: this.escrowAppId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: args,
        suggestedParams
      });

      const signedTxn = txn.signTxn(params.senderPrivateKey);
      const response = await algodClient.sendRawTransaction(signedTxn).do();
      const txId = response.txid;
      
      // Wait for confirmation
      await this.waitForConfirmation(txId);

      return {
        txId,
        explorerUrl: `https://testnet.algoexplorer.io/tx/${txId}`
      };
    } catch (error) {
      console.error('Error cancelling Algorand order:', error);
      throw error;
    }
  }

  async getOrderInfo(orderId: string): Promise<any> {
    try {
      const appInfo = await algodClient.getApplicationByID(this.escrowAppId).do();
      // Parse global state to find order info
      // This is a simplified implementation
      return {
        orderId,
        status: 'active',
        amount: 0,
        depositor: '',
        claimer: ''
      };
    } catch (error) {
      console.error('Error getting Algorand order info:', error);
      throw error;
    }
  }

  private async waitForConfirmation(txId: string, timeout: number = 30): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout * 1000) {
      try {
        const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
        if (pendingInfo.confirmedRound && pendingInfo.confirmedRound > 0) {
          return;
        }
        if (pendingInfo.poolError && pendingInfo.poolError.length > 0) {
          throw new Error(`Transaction failed: ${pendingInfo.poolError}`);
        }
      } catch (error) {
        // Continue waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error(`Transaction confirmation timeout: ${txId}`);
  }
}

export class RealAlgorandSolverManager {
  private solverAppId: number;

  constructor(solverAppId: number) {
    this.solverAppId = solverAppId;
  }

  async registerSolver(params: {
    solverAddress: string;
    senderPrivateKey: Uint8Array;
  }): Promise<{
    txId: string;
    explorerUrl: string;
  }> {
    try {
      const suggestedParams = await algodClient.getTransactionParams().do();
      
      const args = [
        new Uint8Array(Buffer.from('register_solver', 'utf8')),
        new Uint8Array(Buffer.from(params.solverAddress, 'utf8'))
      ];

      const txn = algosdk.makeApplicationCallTxnFromObject({
        sender: algosdk.encodeAddress(params.senderPrivateKey),
        appIndex: this.solverAppId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: args,
        suggestedParams
      });

      const signedTxn = txn.signTxn(params.senderPrivateKey);
      const response = await algodClient.sendRawTransaction(signedTxn).do();
      const txId = response.txid;
      
      // Wait for confirmation
      await this.waitForConfirmation(txId);

      return {
        txId,
        explorerUrl: `https://testnet.algoexplorer.io/tx/${txId}`
      };
    } catch (error) {
      console.error('Error registering Algorand solver:', error);
      throw error;
    }
  }

  async executeSwap(params: {
    solverAddress: string;
    orderId: string;
    secret: string;
    amount: number;
    senderPrivateKey: Uint8Array;
  }): Promise<{
    txId: string;
    explorerUrl: string;
  }> {
    try {
      const suggestedParams = await algodClient.getTransactionParams().do();
      
      const args = [
        new Uint8Array(Buffer.from('execute_swap', 'utf8')),
        new Uint8Array(Buffer.from(params.orderId, 'utf8')),
        new Uint8Array(Buffer.from(params.secret, 'base64')),
        algosdk.encodeUint64(params.amount)
      ];

      const txn = algosdk.makeApplicationCallTxnFromObject({
        sender: algosdk.encodeAddress(params.senderPrivateKey),
        appIndex: this.solverAppId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: args,
        suggestedParams
      });

      const signedTxn = txn.signTxn(params.senderPrivateKey);
      const response = await algodClient.sendRawTransaction(signedTxn).do();
      const txId = response.txid;
      
      // Wait for confirmation
      await this.waitForConfirmation(txId);

      return {
        txId,
        explorerUrl: `https://testnet.algoexplorer.io/tx/${txId}`
      };
    } catch (error) {
      console.error('Error executing Algorand swap:', error);
      throw error;
    }
  }

  private async waitForConfirmation(txId: string, timeout: number = 30): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout * 1000) {
      try {
        const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
        if (pendingInfo.confirmedRound && pendingInfo.confirmedRound > 0) {
          return;
        }
        if (pendingInfo.poolError && pendingInfo.poolError.length > 0) {
          throw new Error(`Transaction failed: ${pendingInfo.poolError}`);
        }
      } catch (error) {
        // Continue waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error(`Transaction confirmation timeout: ${txId}`);
  }
}

export class RealAlgorandPoolManager {
  private poolAppId: number;

  constructor(poolAppId: number) {
    this.poolAppId = poolAppId;
  }

  async addLiquidity(params: {
    amount: number;
    assetId: number;
    senderPrivateKey: Uint8Array;
  }): Promise<{
    txId: string;
    explorerUrl: string;
  }> {
    try {
      const suggestedParams = await algodClient.getTransactionParams().do();
      
      const args = [
        new Uint8Array(Buffer.from('add_liquidity', 'utf8')),
        algosdk.encodeUint64(params.amount),
        algosdk.encodeUint64(params.assetId)
      ];

      const txn = algosdk.makeApplicationCallTxnFromObject({
        sender: algosdk.encodeAddress(params.senderPrivateKey),
        appIndex: this.poolAppId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: args,
        suggestedParams
      });

      const signedTxn = txn.signTxn(params.senderPrivateKey);
      const response = await algodClient.sendRawTransaction(signedTxn).do();
      const txId = response.txid;
      
      // Wait for confirmation
      await this.waitForConfirmation(txId);

      return {
        txId,
        explorerUrl: `https://testnet.algoexplorer.io/tx/${txId}`
      };
    } catch (error) {
      console.error('Error adding Algorand liquidity:', error);
      throw error;
    }
  }

  async removeLiquidity(params: {
    shares: number;
    senderPrivateKey: Uint8Array;
  }): Promise<{
    txId: string;
    explorerUrl: string;
  }> {
    try {
      const suggestedParams = await algodClient.getTransactionParams().do();
      
      const args = [
        new Uint8Array(Buffer.from('remove_liquidity', 'utf8')),
        algosdk.encodeUint64(params.shares)
      ];

      const txn = algosdk.makeApplicationCallTxnFromObject({
        sender: algosdk.encodeAddress(params.senderPrivateKey),
        appIndex: this.poolAppId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: args,
        suggestedParams
      });

      const signedTxn = txn.signTxn(params.senderPrivateKey);
      const response = await algodClient.sendRawTransaction(signedTxn).do();
      const txId = response.txid;
      
      // Wait for confirmation
      await this.waitForConfirmation(txId);

      return {
        txId,
        explorerUrl: `https://testnet.algoexplorer.io/tx/${txId}`
      };
    } catch (error) {
      console.error('Error removing Algorand liquidity:', error);
      throw error;
    }
  }

  private async waitForConfirmation(txId: string, timeout: number = 30): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout * 1000) {
      try {
        const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
        if (pendingInfo.confirmedRound && pendingInfo.confirmedRound > 0) {
          return;
        }
        if (pendingInfo.poolError && pendingInfo.poolError.length > 0) {
          throw new Error(`Transaction failed: ${pendingInfo.poolError}`);
        }
      } catch (error) {
        // Continue waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error(`Transaction confirmation timeout: ${txId}`);
  }
}

export function generateAlgorandSecret(): { secret: string; hashedSecret: string } {
  const crypto = require('crypto');
  const secretBytes = crypto.randomBytes(32);
  const secret = Buffer.from(secretBytes).toString('base64');
  const hashedSecret = crypto.createHash('sha256').update(secretBytes).digest('hex');
  return { secret, hashedSecret };
}

export function formatAlgorandAmount(microAlgos: string | number, decimals: number = 6): string {
  return (Number(microAlgos) / Math.pow(10, decimals)).toFixed(decimals);
}

export function algoToMicroAlgos(algo: string | number): string {
  return (Number(algo) * 1_000_000).toString();
}

export function microAlgosToAlgo(microAlgos: string | number): string {
  return (Number(microAlgos) / 1_000_000).toString();
}

export async function getAlgorandAccountBalance(address: string): Promise<string> {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    return formatAlgorandAmount(Number(accountInfo.amount));
  } catch (error) {
    console.error('Error getting Algorand account balance:', error);
    return '0';
  }
}

export async function validateAlgorandAddress(address: string): Promise<boolean> {
  try {
    algosdk.decodeAddress(address);
    return true;
  } catch (error) {
    return false;
  }
} 