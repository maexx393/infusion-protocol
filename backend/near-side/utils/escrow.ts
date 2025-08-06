import { Account, Contract } from 'near-api-js';
import { NEARAccountManager, NEARConfig, NEARTokenUtils, NEARContractUtils } from '../config/network-config';

export interface NEAREscrowOrder {
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

export interface NEARCrossChainSwap {
  evm_order_hash: string;
  near_order_id: string;
  evm_address: string;
  near_account: string;
  from_chain: string;
  to_chain: string;
  from_token: string;
  to_token: string;
  from_amount: string;
  to_amount: string;
  hashlock: string;
  secret?: string;
  timelock: string;
  status: 'Initiated' | 'EVMOrderFilled' | 'NEAROrderFunded' | 'Completed' | 'Failed' | 'Expired';
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

export class NEAREscrowManager {
  private accountManager: NEARAccountManager;
  private config: NEARConfig;
  private contract: Contract | null = null;

  constructor(config: NEARConfig) {
    this.config = config;
    this.accountManager = new NEARAccountManager(config);
  }

  // Initialize contract connection
  async initialize(accountId: string, privateKey: string): Promise<void> {
    await this.accountManager.addAccount(accountId, privateKey);
    const account = await this.accountManager.getAccount(accountId);
    
    // Initialize contract
    this.contract = new Contract(
      account,
      this.config.contractName,
      {
        viewMethods: ['get_order', 'get_swap', 'get_user_orders', 'get_statistics'],
        changeMethods: ['create_order', 'fund_order', 'claim_order', 'refund_order', 'create_cross_chain_swap', 'update_swap_status'],
        useLocalViewExecution: false
      }
    );
  }

  // Create escrow order
  async createOrder(params: CreateOrderParams): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }

    const orderId = NEARContractUtils.generateOrderId();
    const timelockMs = Date.now() + (params.timelock * 1000);

    try {
      await (this.contract as any).create_order({
        args: {
          taker: params.taker,
          from_token: params.fromToken,
          to_token: params.toToken,
          from_amount: NEARTokenUtils.nearToYocto(params.fromAmount),
          to_amount: NEARTokenUtils.nearToYocto(params.toAmount),
          hashlock: params.hashlock,
          timelock: timelockMs.toString()
        },
        gas: '300000000000000', // 300 TGas
        attachedDeposit: NEARTokenUtils.nearToYocto('0.001') // 1 mNEAR for storage
      });

      return orderId;
    } catch (error) {
      throw new Error(`Failed to create order: ${error}`);
    }
  }

  // Fund escrow order
  async fundOrder(params: FundOrderParams): Promise<void> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }

    try {
      await (this.contract as any).fund_order({
        args: { order_id: params.orderId },
        gas: '300000000000000', // 300 TGas
        attachedDeposit: NEARTokenUtils.nearToYocto(params.amount)
      });
    } catch (error) {
      throw new Error(`Failed to fund order: ${error}`);
    }
  }

  // Claim escrow order
  async claimOrder(params: ClaimOrderParams): Promise<void> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }

    try {
      await (this.contract as any).claim_order({
        args: {
          order_id: params.orderId,
          secret: params.secret
        },
        gas: '300000000000000' // 300 TGas
      });
    } catch (error) {
      throw new Error(`Failed to claim order: ${error}`);
    }
  }

  // Refund escrow order
  async refundOrder(params: RefundOrderParams): Promise<void> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }

    try {
      await (this.contract as any).refund_order({
        args: { order_id: params.orderId },
        gas: '300000000000000' // 300 TGas
      });
    } catch (error) {
      throw new Error(`Failed to refund order: ${error}`);
    }
  }

  // Get order details
  async getOrder(orderId: string): Promise<NEAREscrowOrder | null> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }

    try {
      const result = await (this.contract as any).get_order({
        args: { order_id: orderId }
      });
      
      if (result && result !== 'null') {
        return JSON.parse(result) as NEAREscrowOrder;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get order: ${error}`);
      return null;
    }
  }

  // Create cross-chain swap
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
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }

    const swapId = NEARContractUtils.generateOrderId();
    const timelockMs = Date.now() + (params.timelock * 1000);

    try {
      await (this.contract as any).create_cross_chain_swap({
        args: {
          evm_order_hash: params.evmOrderHash,
          evm_address: params.evmAddress,
          from_chain: params.fromChain,
          to_chain: params.toChain,
          from_token: params.fromToken,
          to_token: params.toToken,
          from_amount: NEARTokenUtils.nearToYocto(params.fromAmount),
          to_amount: NEARTokenUtils.nearToYocto(params.toAmount),
          hashlock: params.hashlock,
          timelock: timelockMs.toString()
        },
        gas: '300000000000000', // 300 TGas
        attachedDeposit: NEARTokenUtils.nearToYocto('0.001') // 1 mNEAR for storage
      });

      return swapId;
    } catch (error) {
      throw new Error(`Failed to create cross-chain swap: ${error}`);
    }
  }

  // Get cross-chain swap details
  async getCrossChainSwap(swapId: string): Promise<NEARCrossChainSwap | null> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }

    try {
      const result = await (this.contract as any).get_swap({
        args: { swap_id: swapId }
      });
      
      if (result && result !== 'null') {
        return JSON.parse(result) as NEARCrossChainSwap;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get cross-chain swap: ${error}`);
      return null;
    }
  }

  // Update swap status
  async updateSwapStatus(swapId: string, status: NEARCrossChainSwap['status']): Promise<void> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }

    try {
      await (this.contract as any).update_swap_status({
        args: {
          swap_id: swapId,
          status: status
        },
        gas: '300000000000000' // 300 TGas
      });
    } catch (error) {
      throw new Error(`Failed to update swap status: ${error}`);
    }
  }

  // Get user orders
  async getUserOrders(accountId: string): Promise<string[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }

    try {
      const result = await (this.contract as any).get_user_orders({
        args: { account_id: accountId }
      });
      
      if (result && result !== 'null') {
        return JSON.parse(result) as string[];
      }
      return [];
    } catch (error) {
      console.error(`Failed to get user orders: ${error}`);
      return [];
    }
  }

  // Get contract statistics
  async getStatistics(): Promise<{ totalSwaps: number; totalVolume: string; totalFees: string }> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }

    try {
      const result = await (this.contract as any).get_statistics({
        args: {}
      });
      
      if (result && result !== 'null') {
        const [totalSwaps, totalVolume, totalFees] = JSON.parse(result);
        return {
          totalSwaps: parseInt(totalSwaps),
          totalVolume: NEARTokenUtils.formatNEAR(totalVolume),
          totalFees: NEARTokenUtils.formatNEAR(totalFees)
        };
      }
      return { totalSwaps: 0, totalVolume: '0', totalFees: '0' };
    } catch (error) {
      console.error(`Failed to get statistics: ${error}`);
      return { totalSwaps: 0, totalVolume: '0', totalFees: '0' };
    }
  }

  // Check if order exists and is claimable
  async isOrderClaimable(orderId: string): Promise<boolean> {
    const order = await this.getOrder(orderId);
    if (!order) return false;
    
    return order.status === 'Funded' && 
           parseInt(order.expires_at) > Date.now();
  }

  // Check if order is expired
  async isOrderExpired(orderId: string): Promise<boolean> {
    const order = await this.getOrder(orderId);
    if (!order) return true;
    
    return parseInt(order.expires_at) <= Date.now();
  }

  // Get account balance
  async getAccountBalance(accountId: string): Promise<string> {
    try {
      const account = await this.accountManager.getAccount(accountId);
      const balance = await account.getAccountBalance();
      return NEARTokenUtils.formatNEAR(balance.total);
    } catch (error) {
      console.error(`Failed to get account balance: ${error}`);
      return '0';
    }
  }
} 