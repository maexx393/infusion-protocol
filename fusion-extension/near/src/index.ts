// Near utilities for cross-chain swaps
export * from '../config/network-config';
export * from '../utils/escrow';

// Re-export main classes for easy access
export { NEARAccountManager } from '../config/network-config';
export { NEAREscrowManager } from '../utils/escrow';
export { NEARTokenUtils, NEARContractUtils } from '../config/network-config';

// Export types
export type {
  NEAREscrowOrder,
  NEARCrossChainSwap,
  CreateOrderParams,
  FundOrderParams,
  ClaimOrderParams,
  RefundOrderParams
} from '../utils/escrow'; 