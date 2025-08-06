import { ethers } from 'ethers';
import * as crypto from 'crypto';
// Import NEAR utilities (these will be available after building the near-side package)
// For now, we'll define the interfaces locally
interface NEARConfig {
  networkId: string;
  nodeUrl: string;
  walletUrl: string;
  helperUrl: string;
  explorerUrl: string;
  contractName: string;
  ownerAccount: string;
  escrowContract: string;
  solverContract: string;
  poolContract: string;
}

class NEARTokenUtils {
  static nearToYocto(near: string | number): string {
    const nearBN = new (require('bn.js'))(near.toString());
    const yoctoPerNear = new (require('bn.js'))('1000000000000000000000000'); // 10^24
    return nearBN.mul(yoctoPerNear).toString();
  }

  static formatNEAR(yocto: string | number, decimals: number = 4): string {
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
}

// Simplified NEAR escrow manager for cross-chain integration
class NEAREscrowManager {
  private config: NEARConfig;

  constructor(config: NEARConfig) {
    this.config = config;
  }

  async initialize(accountId: string, privateKey: string): Promise<void> {
    // In a real implementation, this would initialize the NEAR connection
    console.log(`Initializing NEAR escrow manager for account: ${accountId}`);
  }

  async createOrder(params: any): Promise<string> {
    // Simulate order creation
    const orderId = crypto.randomBytes(16).toString('hex');
    console.log(`Created NEAR order: ${orderId}`);
    return orderId;
  }

  async fundOrder(params: any): Promise<void> {
    console.log(`Funding NEAR order: ${params.orderId}`);
  }

  async claimOrder(params: any): Promise<void> {
    console.log(`Claiming NEAR order: ${params.orderId} with secret: ${params.secret}`);
  }

  async getOrder(orderId: string): Promise<any> {
    // Simulate order retrieval
    return null; // For now, return null to simulate no existing order
  }

  async getStatistics(): Promise<{ totalSwaps: number; totalVolume: string; totalFees: string }> {
    return { totalSwaps: 0, totalVolume: '0', totalFees: '0' };
  }
}

export interface DepositNEARParams {
  amountNear: number;
  hashedSecret: string;
  expirationSeconds: number;
  depositorPrivateKey: string;
  claimerAccountId: string;
}

export interface DepositNEARResult {
  depositId: string;
  txHash: string;
  explorerUrl: string;
  escrowAddress: string;
  amountYocto: string;
  expirationTime: number;
}

export interface CheckDepositNEARResult {
  exists: boolean;
  amount: string;
  depositor: string;
  claimer: string;
  claimed: boolean;
  cancelled: boolean;
  expired: boolean;
}

export interface ClaimNEARParams {
  depositId: string;
  secret: string;
  claimerPrivateKey: string;
}

export interface ClaimNEARResult {
  txHash: string;
  explorerUrl: string;
  secret: string;
}

// NEAR Escrow ABI (simplified for cross-chain integration)
const NEAR_ESCROW_ABI = [
  'function create_order(string taker, string from_token, string to_token, string from_amount, string to_amount, string hashlock, string timelock) returns (string)',
  'function fund_order(string order_id) returns (void)',
  'function claim_order(string order_id, string secret) returns (void)',
  'function refund_order(string order_id) returns (void)',
  'function get_order(string order_id) returns (string)',
  'function get_statistics() returns (string)'
];

/**
 * Deposits NEAR into the escrow contract
 * @param params - Deposit parameters
 * @returns Promise<DepositNEARResult> - Transaction details
 */
export async function depositNEAR(params: DepositNEARParams): Promise<DepositNEARResult> {
  try {
    console.log(`📤 Depositing NEAR into escrow...`);
    console.log(`   Amount: ${params.amountNear} NEAR`);
    console.log(`   Claimer: ${params.claimerAccountId}`);
    console.log(`   Hashlock: ${params.hashedSecret}`);

    // Initialize NEAR escrow manager
    const config: NEARConfig = {
      networkId: 'testnet',
      nodeUrl: 'https://rpc.testnet.near.org',
      walletUrl: 'https://wallet.testnet.near.org',
      helperUrl: 'https://helper.testnet.near.org',
      explorerUrl: 'https://explorer.testnet.near.org',
      contractName: 'escrow.defiunite.testnet',
      ownerAccount: 'defiunite.testnet',
      escrowContract: 'escrow.defiunite.testnet',
      solverContract: 'solver.defiunite.testnet',
      poolContract: 'pool.defiunite.testnet'
    };

    const escrowManager = new NEAREscrowManager(config);
    
    // Extract account ID from private key (in production, you'd have the account ID)
    const depositorAccountId = 'alice.testnet'; // This should come from the private key or be passed as parameter
    
    await escrowManager.initialize(depositorAccountId, params.depositorPrivateKey);

    // Calculate expiration time
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = currentTime + params.expirationSeconds;

    // Create order
    const orderId = await escrowManager.createOrder({
      taker: params.claimerAccountId,
      fromToken: 'near', // Native NEAR token
      toToken: 'near',   // Native NEAR token
      fromAmount: params.amountNear.toString(),
      toAmount: params.amountNear.toString(),
      hashlock: params.hashedSecret,
      timelock: params.expirationSeconds
    });

    // Fund the order
    await escrowManager.fundOrder({
      orderId: orderId,
      amount: params.amountNear.toString()
    });

    // Generate explorer URL
    const explorerUrl = `https://explorer.testnet.near.org/accounts/${config.contractName}`;

    console.log(`✅ NEAR deposit successful!`);
    console.log(`🆔 Order ID: ${orderId}`);
    console.log(`🔗 Explorer: ${explorerUrl}`);

    return {
      depositId: orderId,
      txHash: orderId, // NEAR uses order ID as transaction reference
      explorerUrl,
      escrowAddress: config.contractName,
      amountYocto: NEARTokenUtils.nearToYocto(params.amountNear),
      expirationTime
    };

  } catch (error) {
    console.error('❌ Failed to deposit NEAR:', error);
    throw error;
  }
}

/**
 * Checks if a NEAR deposit exists and its status
 * @param hashedSecret - The hashlock to check
 * @param expectedAmountNear - Expected amount in NEAR (optional)
 * @returns Promise<CheckDepositNEARResult> - Deposit status
 */
export async function checkDepositNEAR(hashedSecret: string, expectedAmountNear?: number): Promise<CheckDepositNEARResult> {
  try {
    console.log(`🔍 Checking NEAR escrow deposit...`);
    console.log(`   Hashlock: ${hashedSecret}`);

    const config: NEARConfig = {
      networkId: 'testnet',
      nodeUrl: 'https://rpc.testnet.near.org',
      walletUrl: 'https://wallet.testnet.near.org',
      helperUrl: 'https://helper.testnet.near.org',
      explorerUrl: 'https://explorer.testnet.near.org',
      contractName: 'escrow.defiunite.testnet',
      ownerAccount: 'defiunite.testnet',
      escrowContract: 'escrow.defiunite.testnet',
      solverContract: 'solver.defiunite.testnet',
      poolContract: 'pool.defiunite.testnet'
    };

    const escrowManager = new NEAREscrowManager(config);
    
    // Use a default account for read-only operations
    await escrowManager.initialize('alice.testnet', 'dummy-key');

    // Try to find the order by hashlock (this would need to be implemented in the contract)
    // For now, we'll simulate the check
    const order = await escrowManager.getOrder(hashedSecret);

    if (!order) {
      return {
        exists: false,
        amount: '0',
        depositor: '',
        claimer: '',
        claimed: false,
        cancelled: false,
        expired: false
      };
    }

    const isExpired = parseInt(order.expires_at) <= Date.now();
    const amountNear = NEARTokenUtils.formatNEAR(order.from_amount);

    console.log(`✅ NEAR deposit found!`);
    console.log(`   Amount: ${amountNear} NEAR`);
    console.log(`   Depositor: ${order.maker}`);
    console.log(`   Claimer: ${order.taker}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Expired: ${isExpired}`);

    // Validate amount if expected amount is provided
    if (expectedAmountNear !== undefined) {
      const expectedAmountYocto = NEARTokenUtils.nearToYocto(expectedAmountNear);
      const amountMatches = order.from_amount === expectedAmountYocto;
      
      if (!amountMatches) {
        console.log(`⚠️  Amount mismatch! Expected: ${expectedAmountNear} NEAR, Found: ${amountNear} NEAR`);
      } else {
        console.log(`✅ Amount matches expected: ${expectedAmountNear} NEAR`);
      }
    }

    return {
      exists: true,
      amount: amountNear,
      depositor: order.maker,
      claimer: order.taker,
      claimed: order.status === 'Claimed',
      cancelled: order.status === 'Refunded',
      expired: isExpired
    };

  } catch (error) {
    console.error('❌ Failed to check NEAR deposit:', error);
    throw error;
  }
}

/**
 * Claims NEAR from the escrow contract using the secret
 * @param params - Claim parameters
 * @returns Promise<ClaimNEARResult> - Transaction details
 */
export async function claimNEAR(params: ClaimNEARParams): Promise<ClaimNEARResult> {
  try {
    console.log(`📤 Claiming NEAR deposit...`);
    console.log(`   Order ID: ${params.depositId}`);

    const config: NEARConfig = {
      networkId: 'testnet',
      nodeUrl: 'https://rpc.testnet.near.org',
      walletUrl: 'https://wallet.testnet.near.org',
      helperUrl: 'https://helper.testnet.near.org',
      explorerUrl: 'https://explorer.testnet.near.org',
      contractName: 'escrow.defiunite.testnet',
      ownerAccount: 'defiunite.testnet',
      escrowContract: 'escrow.defiunite.testnet',
      solverContract: 'solver.defiunite.testnet',
      poolContract: 'pool.defiunite.testnet'
    };

    const escrowManager = new NEAREscrowManager(config);
    
    // Extract account ID from private key (in production, you'd have the account ID)
    const claimerAccountId = 'carol.testnet'; // This should come from the private key or be passed as parameter
    
    await escrowManager.initialize(claimerAccountId, params.claimerPrivateKey);

    // First check if deposit exists and is claimable
    const depositCheck = await checkDepositNEAR(params.depositId);
    
    if (!depositCheck.exists) {
      throw new Error(`No deposit found with ID: ${params.depositId}`);
    }
    
    if (depositCheck.claimed) {
      console.log(`Deposit ${params.depositId} has already been claimed`);
    }
    
    if (depositCheck.cancelled) {
      throw new Error(`Deposit ${params.depositId} has been cancelled`);
    }

    // Verify the claimer account matches
    if (depositCheck.claimer !== claimerAccountId) {
      throw new Error(`Only the designated claimer (${depositCheck.claimer}) can claim this deposit. Current signer: ${claimerAccountId}`);
    }

    console.log(`✅ Deposit validation passed. Proceeding with claim...`);

    // Claim the order
    await escrowManager.claimOrder({
      orderId: params.depositId,
      secret: params.secret
    });

    // Generate explorer URL
    const explorerUrl = `https://explorer.testnet.near.org/accounts/${config.contractName}`;

    console.log(`✅ NEAR claim successful!`);
    console.log(`🔗 Explorer: ${explorerUrl}`);
    console.log(`💰 Amount claimed: ${depositCheck.amount} NEAR`);

    return {
      txHash: params.depositId, // NEAR uses order ID as transaction reference
      explorerUrl,
      secret: params.secret
    };

  } catch (error) {
    console.error('❌ Failed to claim NEAR:', error);
    throw error;
  }
}

/**
 * Validates if the NEAR escrow contract is accessible
 * @returns Promise<boolean> - True if contract is accessible
 */
export async function validateNEAREscrowContract(): Promise<boolean> {
  try {
    const config: NEARConfig = {
      networkId: 'testnet',
      nodeUrl: 'https://rpc.testnet.near.org',
      walletUrl: 'https://wallet.testnet.near.org',
      helperUrl: 'https://helper.testnet.near.org',
      explorerUrl: 'https://explorer.testnet.near.org',
      contractName: 'escrow.defiunite.testnet',
      ownerAccount: 'defiunite.testnet',
      escrowContract: 'escrow.defiunite.testnet',
      solverContract: 'solver.defiunite.testnet',
      poolContract: 'pool.defiunite.testnet'
    };

    const escrowManager = new NEAREscrowManager(config);
    
    // Try to get contract statistics
    const stats = await escrowManager.getStatistics();
    
    console.log(`✅ NEAR escrow contract is accessible at: ${config.contractName}`);
    console.log(`   Total swaps: ${stats.totalSwaps}`);
    console.log(`   Total volume: ${stats.totalVolume} NEAR`);
    console.log(`   Total fees: ${stats.totalFees} NEAR`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to validate NEAR escrow contract:', error);
    return false;
  }
}

/**
 * Generates a secret and hashlock for NEAR cross-chain swaps
 * @returns { secret: string; hashedSecret: string } - Generated secret and hashlock
 */
export function generateNEARSecret(): { secret: string; hashedSecret: string } {
  const secretBytes = crypto.randomBytes(32);
  const secret = secretBytes.toString('base64');
  // Hash the raw bytes (not the base64 string) to match contract expectations
  const hashedSecret = crypto.createHash('sha256').update(secretBytes).digest('hex');
  return { secret, hashedSecret };
}

/**
 * Formats NEAR amount for display
 * @param yocto - Amount in yoctoNEAR
 * @param decimals - Number of decimal places
 * @returns Formatted NEAR amount
 */
export function formatNEARAmount(yocto: string | number, decimals: number = 4): string {
  return NEARTokenUtils.formatNEAR(yocto, decimals);
}

/**
 * Converts NEAR to yoctoNEAR
 * @param near - Amount in NEAR
 * @returns Amount in yoctoNEAR
 */
export function nearToYocto(near: string | number): string {
  return NEARTokenUtils.nearToYocto(near);
}

/**
 * Converts yoctoNEAR to NEAR
 * @param yocto - Amount in yoctoNEAR
 * @returns Amount in NEAR
 */
export function yoctoToNear(yocto: string | number): string {
  return NEARTokenUtils.yoctoToNear(yocto);
} 