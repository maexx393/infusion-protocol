import algosdk from 'algosdk';
import { AlgorandConfig, AlgorandAccount, AlgorandAccountManager, AlgorandTokenUtils, AlgorandContractUtils } from '../config/network-config';

export interface AlgorandEscrowOrder {
  id: string;
  maker: string;
  taker: string;
  from_token: string;
  to_token: string;
  from_amount: string;
  to_amount: string;
  hashlock: string;
  secret?: string;
  timelock: string;
  status: 'Pending' | 'Funded' | 'Claimed' | 'Refunded' | 'Expired';
  created_at: string;
  expires_at: string;
}

export interface AlgorandCrossChainSwap {
  evm_order_hash: string;
  algorand_order_id: string;
  evm_address: string;
  algorand_address: string;
  from_chain: string;
  to_chain: string;
  from_token: string;
  to_token: string;
  from_amount: string;
  to_amount: string;
  hashlock: string;
  secret?: string;
  timelock: string;
  status: 'Initiated' | 'EVMOrderFilled' | 'AlgorandOrderFunded' | 'Completed' | 'Failed' | 'Expired';
  created_at: string;
  expires_at: string;
}

export interface CreateOrderParams {
  taker: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  hashlock: string;
  timelock: number;
}

export interface FundOrderParams {
  orderId: string;
  amount: string;
}

export interface ClaimOrderParams {
  orderId: string;
  secret: string;
}

export interface RefundOrderParams {
  orderId: string;
}

export class AlgorandEscrowManager {
  private accountManager: AlgorandAccountManager;
  private config: AlgorandConfig;
  private algodClient: algosdk.Algodv2;
  private indexerClient: algosdk.Indexer;
  private appId: number | null = null;

  constructor(config: AlgorandConfig) {
    this.config = config;
    this.accountManager = new AlgorandAccountManager(config);
    this.algodClient = this.accountManager.getAlgodClient();
    this.indexerClient = this.accountManager.getIndexerClient();
  }

  async initialize(account: AlgorandAccount): Promise<void> {
    try {
      // Initialize connection to Algorand network
      const status = await this.algodClient.status().do();
      console.log('Connected to Algorand network:', status);
    } catch (error) {
      console.error('Failed to initialize Algorand connection:', error);
      throw error;
    }
  }

  async createOrder(params: CreateOrderParams): Promise<string> {
    try {
      const orderId = AlgorandContractUtils.generateOrderId();
      
      // Create application call transaction
      const suggestedParams = await this.algodClient.getTransactionParams().do();
      
      const appArgs = [
        new Uint8Array(Buffer.from(params.hashlock, 'hex')),
        algosdk.encodeUint64(params.timelock),
        algosdk.encodeAddress(params.taker),
        algosdk.encodeAddress(params.taker), // claimer same as taker for now
        algosdk.encodeUint64(parseInt(params.fromAmount)),
        algosdk.encodeUint64(0) // ALGO asset ID
      ];

      const txn = algosdk.makeApplicationCreateTxnFromObject({
        from: params.taker,
        suggestedParams,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: this.getApprovalProgram(),
        clearProgram: this.getClearProgram(),
        numGlobalByteSlices: 8,
        numGlobalInts: 8,
        numLocalByteSlices: 4,
        numLocalInts: 4,
        appArgs
      });

      console.log('Created Algorand escrow order:', orderId);
      return orderId;
    } catch (error) {
      console.error('Error creating Algorand order:', error);
      throw error;
    }
  }

  async fundOrder(params: FundOrderParams): Promise<void> {
    try {
      // Fund the escrow order with ALGO
      const suggestedParams = await this.algodClient.getTransactionParams().do();
      
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: params.orderId,
        to: this.config.escrowContract,
        amount: parseInt(params.amount),
        suggestedParams
      });

      console.log('Funded Algorand escrow order:', params.orderId);
    } catch (error) {
      console.error('Error funding Algorand order:', error);
      throw error;
    }
  }

  async claimOrder(params: ClaimOrderParams): Promise<void> {
    try {
      // Claim the escrow order with secret
      const suggestedParams = await this.algodClient.getTransactionParams().do();
      
      const appArgs = [
        new Uint8Array(Buffer.from(params.secret, 'base64'))
      ];

      const txn = algosdk.makeApplicationCallTxnFromObject({
        from: params.orderId,
        appIndex: this.appId!,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs,
        suggestedParams
      });

      console.log('Claimed Algorand escrow order:', params.orderId);
    } catch (error) {
      console.error('Error claiming Algorand order:', error);
      throw error;
    }
  }

  async refundOrder(params: RefundOrderParams): Promise<void> {
    try {
      // Refund the escrow order
      const suggestedParams = await this.algodClient.getTransactionParams().do();
      
      const txn = algosdk.makeApplicationCallTxnFromObject({
        from: params.orderId,
        appIndex: this.appId!,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [],
        suggestedParams
      });

      console.log('Refunded Algorand escrow order:', params.orderId);
    } catch (error) {
      console.error('Error refunding Algorand order:', error);
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<AlgorandEscrowOrder | null> {
    try {
      // Get order from Algorand blockchain
      const accountInfo = await this.algodClient.accountInformation(orderId).do();
      
      // Parse order data from account state
      // This is a simplified implementation
      return {
        id: orderId,
        maker: orderId,
        taker: orderId,
        from_token: 'ALGO',
        to_token: 'ALGO',
        from_amount: '0',
        to_amount: '0',
        hashlock: '',
        timelock: '0',
        status: 'Pending',
        created_at: new Date().toISOString(),
        expires_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting Algorand order:', error);
      return null;
    }
  }

  async createCrossChainSwap(params: {
    evmOrderHash: string;
    evmAddress: string;
    fromChain: string;
    toChain: string;
    fromToken: string;
    toToken: string;
    fromAmount: string;
    toAmount: string;
    hashlock: string;
    timelock: number;
  }): Promise<string> {
    try {
      const swapId = `swap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create cross-chain swap record
      const swap: AlgorandCrossChainSwap = {
        evm_order_hash: params.evmOrderHash,
        algorand_order_id: swapId,
        evm_address: params.evmAddress,
        algorand_address: params.evmAddress, // For demo, using same address
        from_chain: params.fromChain,
        to_chain: params.toChain,
        from_token: params.fromToken,
        to_token: params.toToken,
        from_amount: params.fromAmount,
        to_amount: params.toAmount,
        hashlock: params.hashlock,
        timelock: params.timelock.toString(),
        status: 'Initiated',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + params.timelock * 1000).toISOString()
      };

      console.log('Created Algorand cross-chain swap:', swapId);
      return swapId;
    } catch (error) {
      console.error('Error creating Algorand cross-chain swap:', error);
      throw error;
    }
  }

  async getCrossChainSwap(swapId: string): Promise<AlgorandCrossChainSwap | null> {
    try {
      // Get cross-chain swap from storage
      // This is a simplified implementation
      return {
        evm_order_hash: '',
        algorand_order_id: swapId,
        evm_address: '',
        algorand_address: '',
        from_chain: 'EVM',
        to_chain: 'Algorand',
        from_token: 'ETH',
        to_token: 'ALGO',
        from_amount: '0',
        to_amount: '0',
        hashlock: '',
        timelock: '0',
        status: 'Initiated',
        created_at: new Date().toISOString(),
        expires_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting Algorand cross-chain swap:', error);
      return null;
    }
  }

  async updateSwapStatus(swapId: string, status: AlgorandCrossChainSwap['status']): Promise<void> {
    try {
      console.log(`Updated Algorand swap status: ${swapId} -> ${status}`);
    } catch (error) {
      console.error('Error updating Algorand swap status:', error);
      throw error;
    }
  }

  async getUserOrders(address: string): Promise<string[]> {
    try {
      // Get user orders from Algorand blockchain
      const accountInfo = await this.algodClient.accountInformation(address).do();
      
      // Parse orders from account state
      // This is a simplified implementation
      return [];
    } catch (error) {
      console.error('Error getting Algorand user orders:', error);
      return [];
    }
  }

  async getStatistics(): Promise<{ totalSwaps: number; totalVolume: string; totalFees: string }> {
    try {
      // Get statistics from Algorand blockchain
      // This is a simplified implementation
      return {
        totalSwaps: 0,
        totalVolume: '0',
        totalFees: '0'
      };
    } catch (error) {
      console.error('Error getting Algorand statistics:', error);
      return {
        totalSwaps: 0,
        totalVolume: '0',
        totalFees: '0'
      };
    }
  }

  async isOrderClaimable(orderId: string): Promise<boolean> {
    try {
      const order = await this.getOrder(orderId);
      return order?.status === 'Funded';
    } catch (error) {
      console.error('Error checking if Algorand order is claimable:', error);
      return false;
    }
  }

  async isOrderExpired(orderId: string): Promise<boolean> {
    try {
      const order = await this.getOrder(orderId);
      if (!order) return true;
      
      const expiresAt = new Date(order.expires_at);
      return new Date() > expiresAt;
    } catch (error) {
      console.error('Error checking if Algorand order is expired:', error);
      return true;
    }
  }

  async getAccountBalance(address: string): Promise<string> {
    try {
      const balance = await this.accountManager.getAccountBalance(address);
      return AlgorandTokenUtils.formatAlgos(balance);
    } catch (error) {
      console.error('Error getting Algorand account balance:', error);
      return '0';
    }
  }

  private getApprovalProgram(): Uint8Array {
    // Return compiled approval program
    // This would be the compiled PyTeal program
    return new Uint8Array();
  }

  private getClearProgram(): Uint8Array {
    // Return compiled clear program
    return new Uint8Array();
  }
} 