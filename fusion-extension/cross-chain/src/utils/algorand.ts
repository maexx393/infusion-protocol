// Algorand utilities for cross-chain swaps
// Enhanced for production deployment

import algosdk from 'algosdk';
import { getTransactionUrl } from '../variables';

// Algorand configuration
const ALGORAND_RPC_URL = 'https://testnet-api.algonode.cloud';
const ALGORAND_INDEXER_URL = 'https://testnet-idx.algonode.cloud';
const ALGORAND_NETWORK = 'testnet';

// Contract addresses (UPDATED WITH REAL DEPLOYED CONTRACTS)
const ALGORAND_ESCROW_CONTRACT = '743876974';
const ALGORAND_SOLVER_CONTRACT = '743876975';
const ALGORAND_POOL_CONTRACT = '743876985';

// Production flag
const USE_PRODUCTION_CONTRACTS = true; // Now using real deployed contracts

// Utility functions
export class AlgorandTokenUtils {
  static microAlgosToAlgos(microAlgos: number): number {
    return microAlgos / 1000000;
  }

  static algosToMicroAlgos(algos: number): number {
    return algos * 1000000;
  }

  static formatAlgos(microAlgos: number, decimals: number = 6): string {
    return (microAlgos / 1000000).toFixed(decimals);
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
    const crypto = require('crypto'); // Node.js crypto module
    return crypto.createHash('sha256').update(secret).digest('hex');
  }

  static generateSecret(): string {
    const crypto = require('crypto'); // Node.js crypto module
    return crypto.randomBytes(32).toString('base64');
  }

  static generateOrderId(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static isValidAddress(address: string): boolean {
    try {
      algosdk.decodeAddress(address);
      return true;
    } catch (e) {
      return false;
    }
  }

  static isValidAmount(amount: string): boolean {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  }
}

export class RealAlgorandClient {
  public algodClient: algosdk.Algodv2;
  public indexerClient: algosdk.Indexer;

  constructor() {
    this.algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGORAND_RPC_URL, ALGOD_PORT);
    this.indexerClient = new algosdk.Indexer(ALGOD_TOKEN, ALGORAND_INDEXER_URL, ALGOD_PORT);
  }

  async getAccountInfo(address: string): Promise<any> {
    return await this.algodClient.accountInformation(address).do();
  }

  async getApplicationInfo(appId: number): Promise<any> {
    return await this.algodClient.getApplicationByID(appId).do();
  }

  async getTransactionParams(): Promise<algosdk.SuggestedParams> {
    return await this.algodClient.getTransactionParams().do();
  }

  async sendRawTransaction(signedTxn: Uint8Array): Promise<string> {
    const response = await this.algodClient.sendRawTransaction(signedTxn).do();
    return response.txid;
  }

  async waitForConfirmation(txId: string, timeout: number = 4): Promise<any> {
    const status = await this.algodClient.status().do();
    let lastRound = status.lastRound;
    while (true) {
      const pendingInfo = await this.algodClient.pendingTransactionInformation(txId).do();
      if (pendingInfo.confirmedRound !== null && pendingInfo.confirmedRound !== undefined && pendingInfo.confirmedRound > 0) {
        return pendingInfo;
      }
      if (pendingInfo.poolError) {
        throw new Error(`Transaction Pool Error: ${pendingInfo.poolError}`);
      }
      lastRound++;
      await this.algodClient.statusAfterBlock(lastRound).do();
    }
  }

  async callApp(
    appId: number,
    sender: string,
    senderPrivateKey: Uint8Array,
    appArgs: Uint8Array[],
    accounts?: string[],
    foreignApps?: number[],
    foreignAssets?: number[]
  ): Promise<string> {
    const params = await this.algodClient.getTransactionParams().do();
    const txn = algosdk.makeApplicationNoOpTxnFromObject({
      sender,
      suggestedParams: params,
      appIndex: appId,
      appArgs,
      accounts,
      foreignApps,
      foreignAssets
    });
    const signedTxn = txn.signTxn(senderPrivateKey);
    const response = await this.algodClient.sendRawTransaction(signedTxn).do();
    await this.waitForConfirmation(response.txid);
    return response.txid;
  }

  async optInApp(
    appId: number,
    sender: string,
    senderPrivateKey: Uint8Array
  ): Promise<string> {
    const params = await this.algodClient.getTransactionParams().do();
    const txn = algosdk.makeApplicationOptInTxnFromObject({
      sender,
      suggestedParams: params,
      appIndex: appId
    });
    const signedTxn = txn.signTxn(senderPrivateKey);
    const response = await this.algodClient.sendRawTransaction(signedTxn).do();
    await this.waitForConfirmation(response.txid);
    return response.txid;
  }

  async payment(
    sender: string,
    senderPrivateKey: Uint8Array,
    receiver: string,
    amount: number,
    note?: string
  ): Promise<string> {
    const params = await this.algodClient.getTransactionParams().do();
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender,
      receiver,
      amount,
      note: note ? new Uint8Array(Buffer.from(note)) : undefined,
      suggestedParams: params
    });
    const signedTxn = txn.signTxn(senderPrivateKey);
    const response = await this.algodClient.sendRawTransaction(signedTxn).do();
    await this.waitForConfirmation(response.txid);
    return response.txid;
  }
}

export class AlgorandContract {
  private algodClient: RealAlgorandClient;
  private appId: number;

  constructor(appId: number, algodClient: RealAlgorandClient) {
    this.appId = appId;
    this.algodClient = algodClient;
  }

  async callApp(
    methodName: string,
    senderAddress: string,
    senderPrivateKey: Uint8Array,
    args: (string | number | Uint8Array)[] = [],
    accounts?: string[],
    foreignApps?: number[],
    foreignAssets?: number[]
  ): Promise<string> {
    const appArgs = args.map(arg => {
      if (typeof arg === 'string') {
        return new Uint8Array(Buffer.from(arg));
      } else if (typeof arg === 'number') {
        return algosdk.encodeUint64(arg);
      }
      return arg;
    });
    return await this.algodClient.callApp(
      this.appId,
      senderAddress,
      senderPrivateKey,
      [new Uint8Array(Buffer.from(methodName)), ...appArgs],
      accounts,
      foreignApps,
      foreignAssets
    );
  }

  async getGlobalState(): Promise<Record<string, any>> {
    const appInfo = await this.algodClient.getApplicationInfo(this.appId);
    const globalState = appInfo['params']['global-state'];
    const decodedState: Record<string, any> = {};
    globalState.forEach((item: any) => {
      const key = Buffer.from(item.key, 'base64').toString();
      if (item.value.type === 1) { // byte string
        decodedState[key] = Buffer.from(item.value.bytes, 'base64').toString();
      } else { // uint
        decodedState[key] = item.value.uint;
      }
    });
    return decodedState;
  }

  async getLocalState(address: string): Promise<Record<string, any>> {
    const accountInfo = await this.algodClient.getAccountInfo(address);
    const appsLocalState = accountInfo['apps-local-state'];
    if (!appsLocalState) {
      return {};
    }
    const localState = appsLocalState.find((app: any) => app.id === this.appId);
    if (!localState || !localState['key-value']) {
      return {};
    }
    const decodedState: Record<string, any> = {};
    localState['key-value'].forEach((item: any) => {
      const key = Buffer.from(item.key, 'base64').toString();
      if (item.value.type === 1) { // byte string
        decodedState[key] = Buffer.from(item.value.bytes, 'base64').toString();
      } else { // uint
        decodedState[key] = item.value.uint;
      }
    });
    return decodedState;
  }
}

export class RealAlgorandEscrowManager {
  private algodClient: RealAlgorandClient;
  private escrowContract: AlgorandContract;
  private solverContract: AlgorandContract;
  private poolContract: AlgorandContract;

  constructor(escrowAppId: number, solverAppId: number, poolAppId: number) {
    this.algodClient = new RealAlgorandClient();
    this.escrowContract = new AlgorandContract(escrowAppId, this.algodClient);
    this.solverContract = new AlgorandContract(solverAppId, this.algodClient);
    this.poolContract = new AlgorandContract(poolAppId, this.algodClient);
  }

  async getStatistics(): Promise<{ totalSwaps: number; totalVolume: string; totalFees: string }> {
    try {
      const solverGlobalState = await this.solverContract.getGlobalState();
      const poolGlobalState = await this.poolContract.getGlobalState();

      return {
        totalSwaps: solverGlobalState['total_swaps'] || 0,
        totalVolume: AlgorandTokenUtils.formatAlgos(solverGlobalState['total_volume'] || 0),
        totalFees: AlgorandTokenUtils.formatAlgos(poolGlobalState['total_fees'] || 0),
      };
    } catch (error) {
      console.warn('Unable to get Algorand contract statistics:', error);
      return {
        totalSwaps: 0,
        totalVolume: '0 ALGO',
        totalFees: '0 ALGO',
      };
    }
  }

  async getOrder(orderId: string, accountAddress: string): Promise<any> {
    const localState = await this.escrowContract.getLocalState(accountAddress);
    const orderPrefix = `order_${orderId}_`;
    return {
      depositor: localState[`${orderPrefix}depositor`],
      claimer: localState[`${orderPrefix}claimer`],
      amount: localState[`${orderPrefix}amount`],
      hashlock: localState[`${orderPrefix}hashlock`],
      timelock: localState[`${orderPrefix}timelock`],
      claimed: localState[`${orderPrefix}claimed`] === 1,
      cancelled: localState[`${orderPrefix}cancelled`] === 1,
    };
  }

  async getOrdersByHashlock(hashlock: string, accountAddress: string): Promise<any[]> {
    // This would require iterating through local state or using an indexer with custom logic
    // For simplicity, we'll just try to get a single order if it matches the hashlock
    const localState = await this.escrowContract.getLocalState(accountAddress);
    const orders: any[] = [];
    for (const key in localState) {
      if (key.endsWith('_hashlock') && localState[key] === hashlock) {
        const orderId = key.replace('order_', '').replace('_hashlock', '');
        orders.push(await this.getOrder(orderId, accountAddress));
      }
    }
    return orders;
  }

  async getAccountBalance(address: string): Promise<string> {
    const accountInfo = await this.algodClient.getAccountInfo(address);
    return AlgorandTokenUtils.formatAlgos(accountInfo.amount);
  }

  microAlgosToAlgos(microAlgos: string | number): string {
    return (Number(microAlgos) / 1_000_000).toString();
  }

  algosToMicroAlgos(algos: string | number): string {
    return (Number(algos) * 1_000_000).toString();
  }

  microAlgosToAlgo(microAlgos: string | number): string {
    return (Number(microAlgos) / 1_000_000).toString();
  }
}

export async function realDepositAlgorand(params: {
  amountAlgo: number;
  hashedSecret: string;
  expirationSeconds: number;
  depositorAddress: string;
  depositorPrivateKey: Uint8Array;
  claimerAddress: string;
  escrowAppId: number;
}): Promise<{
  depositId: string;
  txHash: string;
  explorerUrl: string;
  escrowAddress: string;
  amountMicroAlgos: string;
  expirationTime: number;
}> {
  console.log(`\n📥 Real Algorand Deposit: ${params.amountAlgo} ALGO`);
  const algodClient = new RealAlgorandClient();
  const escrowContract = new AlgorandContract(params.escrowAppId, algodClient);

  const amountMicroAlgos = AlgorandTokenUtils.algosToMicroAlgos(params.amountAlgo);
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expirationTime = currentTimestamp + params.expirationSeconds;

  // Ensure account is opted in to the application
  await ensureAccountOptedInToApp(params.depositorAddress, params.escrowAppId, params.depositorPrivateKey);

  // Create order - contract expects: [order_id, claimer_address, hashlock, timelock]
  // Call directly to avoid method name being prepended by AlgorandContract wrapper
  const txId = await algodClient.callApp(
    params.escrowAppId,
    params.depositorAddress,
    params.depositorPrivateKey,
    [
      new Uint8Array(Buffer.from("create_order")),
      new Uint8Array(Buffer.from(params.hashedSecret)), // order_id (using hashlock as order ID)
      new Uint8Array(Buffer.from(params.claimerAddress)), // claimer_address  
      new Uint8Array(Buffer.from(params.hashedSecret)), // hashlock
      algosdk.encodeUint64(expirationTime), // timelock - properly encoded as uint64
    ]
  );

  console.log(`✅ Real Algorand Deposit Transaction: ${txId}`);
  const explorerUrl = `https://lora.algokit.io/testnet/tx/${txId}`;

  return {
    depositId: params.hashedSecret, // Using hashlock as depositId
    txHash: txId,
    explorerUrl: explorerUrl,
    escrowAddress: algosdk.getApplicationAddress(params.escrowAppId).toString(),
    amountMicroAlgos: amountMicroAlgos.toString(),
    expirationTime: expirationTime,
  };
}

export async function realClaimAlgorand(params: {
  depositId: string; // This is the hashed secret
  secret: string;
  claimerAddress: string;
  claimerPrivateKey: Uint8Array;
  escrowAppId: number;
}): Promise<{
  txHash: string;
  explorerUrl: string;
  secret: string;
}> {
  console.log(`\n📤 Real Algorand Claim: ${params.depositId}`);
  const algodClient = new RealAlgorandClient();
  const escrowContract = new AlgorandContract(params.escrowAppId, algodClient);

  // Ensure account is opted in to the application
  await ensureAccountOptedInToApp(params.claimerAddress, params.escrowAppId, params.claimerPrivateKey);

  const txId = await escrowContract.callApp(
    "claim_order",
    params.claimerAddress,
    params.claimerPrivateKey,
    [
      params.depositId, // Pass hashed secret as order ID
      params.secret,
    ]
  );

  console.log(`✅ Real Algorand Claim Transaction: ${txId}`);
  const explorerUrl = `https://lora.algokit.io/testnet/tx/${txId}`;

  return {
    txHash: txId,
    explorerUrl: explorerUrl,
    secret: params.secret,
  };
}

export async function realCheckDepositAlgorand(hashedSecret: string, escrowAppId: number, accountAddress: string): Promise<{
  exists: boolean;
  amount: string;
  depositor: string;
  claimer: string;
  claimed: boolean;
  cancelled: boolean;
  expired: boolean;
}> {
  console.log(`\n🔍 Real Algorand Check Deposit: ${hashedSecret}`);
  const algodClient = new RealAlgorandClient();
  const escrowContract = new AlgorandContract(escrowAppId, algodClient);

  try {
    const localState = await escrowContract.getLocalState(accountAddress);
    console.log('📊 Local state keys:', Object.keys(localState));
    
    // Try multiple patterns to find the order
    let orderIdFound: string | undefined;
    
    // Pattern 1: Look for hashlock in order_*_hashlock keys
    for (const key in localState) {
      if (key.startsWith('order_') && key.endsWith('_hashlock') && localState[key] === hashedSecret) {
        orderIdFound = key.substring(6, key.indexOf('_hashlock'));
        console.log(`✅ Found order with pattern 1: ${orderIdFound}`);
        break;
      }
    }
    
    // Pattern 2: Look for hashlock in any key containing the hashlock value
    if (!orderIdFound) {
      for (const key in localState) {
        if (localState[key] === hashedSecret) {
          console.log(`✅ Found hashlock in key: ${key}`);
          // Try to extract order ID from the key
          if (key.includes('order_')) {
            orderIdFound = key.split('_')[1]; // Extract order ID from order_X_* pattern
            console.log(`✅ Extracted order ID: ${orderIdFound}`);
            break;
          }
        }
      }
    }
    
    // Pattern 3: Use the hashlock itself as order ID (since we're using hashlock as order ID)
    if (!orderIdFound) {
      console.log('🔍 Trying hashlock as order ID...');
      // Check if there are any keys that contain the hashlock as order ID
      for (const key in localState) {
        if (key.includes(hashedSecret.substring(0, 8))) { // Check first 8 chars of hashlock
          console.log(`✅ Found potential order with hashlock prefix: ${key}`);
          orderIdFound = hashedSecret; // Use full hashlock as order ID
          break;
        }
      }
    }

    if (!orderIdFound) {
      console.log('❌ No order found with any pattern');
      return {
        exists: false,
        amount: '0',
        depositor: '',
        claimer: '',
        claimed: false,
        cancelled: false,
        expired: false,
      };
    }

    console.log(`✅ Order found: ${orderIdFound}`);
    
    // Try different patterns for accessing order data
    let orderPrefix = `order_${orderIdFound}_`;
    let amount = localState[`${orderPrefix}amount`];
    let depositor = localState[`${orderPrefix}depositor`];
    let claimer = localState[`${orderPrefix}claimer`];
    let claimed = localState[`${orderPrefix}claimed`] === 1;
    let cancelled = localState[`${orderPrefix}cancelled`] === 1;
    let timelock = localState[`${orderPrefix}timelock`];
    
    // If not found with order_ prefix, try without prefix
    if (!amount) {
      orderPrefix = `${orderIdFound}_`;
      amount = localState[`${orderPrefix}amount`];
      depositor = localState[`${orderPrefix}depositor`];
      claimer = localState[`${orderPrefix}claimer`];
      claimed = localState[`${orderPrefix}claimed`] === 1;
      cancelled = localState[`${orderPrefix}cancelled`] === 1;
      timelock = localState[`${orderPrefix}timelock`];
    }
    
    // If still not found, try direct keys
    if (!amount) {
      amount = localState['amount'];
      depositor = localState['depositor'];
      claimer = localState['claimer'];
      claimed = localState['claimed'] === 1;
      cancelled = localState['cancelled'] === 1;
      timelock = localState['timelock'];
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expired = timelock ? (currentTimestamp > (timelock + 3600)) : false; // 1 hour timelock for expiration

    console.log(`📊 Order data:`, {
      amount,
      depositor,
      claimer,
      claimed,
      cancelled,
      timelock,
      expired
    });

    return {
      exists: true,
      amount: amount ? AlgorandTokenUtils.formatAlgos(amount) : '0',
      depositor: depositor || '',
      claimer: claimer || '',
      claimed: claimed || false,
      cancelled: cancelled || false,
      expired: expired || false,
    };
  } catch (error) {
    console.error('Error checking Algorand deposit:', error);
    return {
      exists: false,
      amount: '0',
      depositor: '',
      claimer: '',
      claimed: false,
      cancelled: false,
      expired: false,
    };
  }
}

export async function isAccountOptedInToApp(accountAddress: string, appId: number): Promise<boolean> {
  try {
    const algodClient = new RealAlgorandClient();
    const accountInfo = await algodClient.getAccountInfo(accountAddress);
    return accountInfo['apps-local-state']?.some((app: any) => app.id === appId) || false;
  } catch (error) {
    console.error(`Error checking opt-in status for account ${accountAddress} to app ${appId}:`, error);
    return false;
  }
}

export async function ensureAccountOptedInToApp(
  accountAddress: string, 
  appId: number, 
  privateKey: Uint8Array
): Promise<void> {
  try {
    const isOptedIn = await isAccountOptedInToApp(accountAddress, appId);
    if (!isOptedIn) {
      console.log(`Opting in ${accountAddress} to App ${appId}...`);
      const algodClient = new RealAlgorandClient();
      await algodClient.optInApp(appId, accountAddress, privateKey);
      console.log('Opt-in successful.');
    } else {
      console.log(`Account ${accountAddress} already opted in to App ${appId}`);
    }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    // If the error indicates already opted in, continue with the transaction
    if (errorMessage.includes('already opted in')) {
      console.log(`Account ${accountAddress} already opted in to App ${appId} (confirmed by error)`);
    } else {
      console.error('Error during opt-in process:', e);
      throw e;
    }
  }
}

export function generateAlgorandSecret(): { secret: string; hashedSecret: string } {
  const crypto = require('crypto');
  const secretBytes = crypto.randomBytes(32);
  const secret = Buffer.from(secretBytes).toString('base64');
  
  // Hash the raw bytes (not the base64 string) to match EVM contract expectations
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

// Dummy values for ALGOD_TOKEN and ALGOD_PORT as they are not directly used in the client constructor
// In a real scenario, these would be loaded from environment variables or a config file.
const ALGOD_TOKEN = '';
const ALGOD_PORT = ''; 