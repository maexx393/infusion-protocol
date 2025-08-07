import { OrderBTC2EVM, OrderEVM2BTC, OrderBTC2EVMResponse, OrderEVM2BTCResponse } from '../api/order';
import { OrderNEAR2EVM, OrderEVM2NEAR, OrderNEAR2EVMResponse, OrderEVM2NEARResponse } from '../api/order';
import { OrderAlgorand2EVM, OrderEVM2Algorand, OrderAlgorand2EVMResponse, OrderEVM2AlgorandResponse } from '../api/order';
import { OrderSolana2EVM, OrderEVM2Solana, OrderSolana2EVMResponse, OrderEVM2SolanaResponse } from '../api/order';
import { ResolverBTC2EVM, OrderBTC2EVMResult } from './resolver_btc2evm';
import { ResolverEVM2BTC } from './resolver_evm2btc';
import { ResolverNEAR2EVM } from './resolver_near2evm';
import { ResolverEVM2NEAR, OrderEVM2NEARResult } from './resolver_evm2near';
import { ResolverAlgorand2EVM } from './resolver_algorand2evm';
import { ResolverEVM2Algorand, OrderEVM2AlgorandResult } from './resolver_evm2algorand';
import { ResolverSolana2EVM } from './resolver_solana2evm';
import { ResolverEVM2Solana, OrderEVM2SolanaResult } from './resolver_evm2solana';

const resolverBTC2EVM = new ResolverBTC2EVM();
const resolverEVM2BTC = new ResolverEVM2BTC();
const resolverNEAR2EVM = new ResolverNEAR2EVM();
const resolverEVM2NEAR = new ResolverEVM2NEAR();
const resolverAlgorand2EVM = new ResolverAlgorand2EVM();
const resolverEVM2Algorand = new ResolverEVM2Algorand();
const resolverSolana2EVM = new ResolverSolana2EVM();
const resolverEVM2Solana = new ResolverEVM2Solana();

export class Relay {
  private invoiceStartTime: number = 0;

  processOrderEVM2BTC(order: OrderEVM2BTC): OrderEVM2BTCResponse {
    console.log('🔄 Processing EVM to BTC order...');
    console.log('📋 Order Type: Single Fill Order (100% Fill)');
    console.log('Order Details:', {
      amountBtc: order.amountBtc,
      btcLightningNetInvoice: order.btcLightningNetInvoice,
      amountEth: order.amountEth
    });

    const resolverResponse = resolverEVM2BTC.sendToResolver(order);
    return new OrderEVM2BTCResponse(resolverResponse.ethAddress);
  }

  async processOrderBTC2EVM(order: OrderBTC2EVM): Promise<OrderBTC2EVMResponse> {
    console.log('🔄 Processing BTC to EVM order...');
    console.log('📋 Order Type: Single Fill Order (100% Fill)');
    console.log('Order Details:', {
      amountBtc: order.amountBtc,
      amountEth: order.amountEth,
      ethAddress: order.ethAddress
    });

    const result: OrderBTC2EVMResult = await resolverBTC2EVM.sendToResolver(order);
    
    // Start monitoring for invoice payment
    this.startInvoicePaymentCheck(result, order);
    
    return new OrderBTC2EVMResponse(result.lightningInvoice);
  }

  processOrderNEAR2EVM(order: OrderNEAR2EVM): OrderNEAR2EVMResponse {
    console.log('🔄 Processing NEAR to EVM order...');
    console.log('📋 Order Type: Single Fill Order (100% Fill)');
    console.log('Order Details:', {
      amountNear: order.amountNear,
      amountEth: order.amountEth,
      ethAddress: order.ethAddress
    });

    const resolverResponse = resolverNEAR2EVM.sendToResolver(order);
    return new OrderNEAR2EVMResponse(resolverResponse.ethAddress);
  }

  async processOrderEVM2NEAR(order: OrderEVM2NEAR): Promise<OrderEVM2NEARResponse> {
    console.log('🔄 Processing EVM to NEAR order...');
    console.log('📋 Order Type: Single Fill Order (100% Fill)');
    console.log('Order Details:', {
      amountNear: order.amountNear,
      nearInvoice: order.nearInvoice,
      amountEth: order.amountEth
    });

    const result: OrderEVM2NEARResult = await resolverEVM2NEAR.sendToResolver(order);
    return new OrderEVM2NEARResponse(result.nearInvoice);
  }

  processOrderAlgorand2EVM(order: OrderAlgorand2EVM): OrderAlgorand2EVMResponse {
    console.log('🔄 Processing Algorand to EVM order...');
    console.log('📋 Order Type: Single Fill Order (100% Fill)');
    console.log('Order Details:', {
      amountAlgo: order.amountAlgo,
      amountEth: order.amountEth,
      ethAddress: order.ethAddress
    });

    const resolverResponse = resolverAlgorand2EVM.sendToResolver(order);
    return new OrderAlgorand2EVMResponse(resolverResponse.ethAddress);
  }

  async processOrderEVM2Algorand(order: OrderEVM2Algorand): Promise<OrderEVM2AlgorandResponse> {
    console.log('🔄 Processing EVM to Algorand order...');
    console.log('📋 Order Type: Single Fill Order (100% Fill)');
    console.log('Order Details:', {
      amountAlgo: order.amountAlgo,
      algorandInvoice: order.algorandInvoice,
      amountEth: order.amountEth
    });

    const result: OrderEVM2AlgorandResult = await resolverEVM2Algorand.sendToResolver(order);
    return new OrderEVM2AlgorandResponse(result.algorandInvoice);
  }

  processOrderSolana2EVM(order: OrderSolana2EVM): OrderSolana2EVMResponse {
    console.log('🔄 Processing Solana to EVM order...');
    console.log('📋 Order Type: Single Fill Order (100% Fill)');
    console.log('Order Details:', {
      amountSol: order.amountSol,
      amountEth: order.amountEth,
      ethAddress: order.ethAddress
    });

    const resolverResponse = resolverSolana2EVM.sendToResolver(order);
    return new OrderSolana2EVMResponse(resolverResponse.ethAddress);
  }

  async processOrderEVM2Solana(order: OrderEVM2Solana): Promise<OrderEVM2SolanaResponse> {
    console.log('🔄 Processing EVM to Solana order...');
    console.log('📋 Order Type: Single Fill Order (100% Fill)');
    console.log('Order Details:', {
      amountSol: order.amountSol,
      solanaInvoice: order.solanaInvoice,
      amountEth: order.amountEth
    });

    const result: OrderEVM2SolanaResult = await resolverEVM2Solana.sendToResolver(order);
    return new OrderEVM2SolanaResponse(result.solanaInvoice);
  }
  
  private async startInvoicePaymentCheck(result: OrderBTC2EVMResult, order: OrderBTC2EVM): Promise<void> {
    console.log('🤖 RESOLVER: Starting invoice payment monitoring...');
    
    // Set start time for demo purposes
    this.invoiceStartTime = Date.now();
    
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;
    
    const checkInterval = setInterval(async () => {
      attempts++;
      console.log(`🤖 RESOLVER: Payment check attempt ${attempts}/${maxAttempts}`);
      
      const isPaid = await this.checkInvoiceIsPaid(result);
      
      if (isPaid) {
        console.log('🤖 RESOLVER: ✅ Invoice payment confirmed!');
        clearInterval(checkInterval);
        
        // Claim deposit on behalf of the user
        await this.claimDepositOnBehalfOfUser(order, result);
        
      } else if (attempts >= maxAttempts) {
        console.log('🤖 RESOLVER: ⏰ Payment check timeout - invoice not paid within expected time');
        clearInterval(checkInterval);
      } else {
        console.log('🤖 RESOLVER: ⏳ Invoice not yet paid, checking again in 5 seconds...');
      }
    }, 5000); // Check every 5 seconds
  }
  
  private async checkInvoiceIsPaid(result: OrderBTC2EVMResult): Promise<boolean> {
    console.log('🤖 RESOLVER: Checking if invoice is paid...');
    
    // Demo implementation - invoice is paid after 3 seconds (first check at 5s, so second check at 10s)
    // For demo purposes, return true on the second check (after ~10 seconds total)
    const currentTime = Date.now();
    const timeSinceStart = currentTime - this.invoiceStartTime;
    
    if (timeSinceStart >= 3000) { // 3 seconds
      console.log('🤖 RESOLVER: ✅ Invoice payment detected! (Demo: paid after 3 seconds)');
      return true;
    } else {
      console.log(`🤖 RESOLVER: ❌ Invoice not yet paid (Demo: ${Math.floor(timeSinceStart/1000)}s elapsed)`);
      return false;
    }
  }
  
  private async claimDepositOnBehalfOfUser(order: OrderBTC2EVM, result: OrderBTC2EVMResult): Promise<void> {
    console.log('🤖 RESOLVER: 🏦 Claiming deposit on behalf of user...');
    console.log('🤖 RESOLVER: Order Type: Single Fill Order (100% Fill)');
    console.log('🤖 RESOLVER: User Order Details:', {
      amountBtc: order.amountBtc,
      amountEth: order.amountEth,
      ethAddress: order.ethAddress
    });
    
    // Create resolver instance for claiming
    const resolver = new ResolverEVM2BTC();
    
    // Generate a dummy secret and hashed secret (in real implementation this would come from the payment)
    const secret = ""
    const hashedSecret = result.hashedSecret;

    throw new Error('Not implemented');
    
    console.log('🤖 RESOLVER: 🔑 Generated secret for claim:', secret);
    console.log('🤖 RESOLVER: 🔑 Generated hashed secret for claim:', hashedSecret);
    
    // Claim the escrow funds
    const claimTx = await resolver.claimEscrow(secret, hashedSecret);
    
    console.log('🤖 RESOLVER: ✅ Deposit pushed successfully to maker');
    console.log('🤖 RESOLVER: Transaction Details:', claimTx);
  }
}
