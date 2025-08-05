import * as bolt11 from 'bolt11';
import * as fs from 'fs';
import { ethers } from 'ethers';
import { OrderEVM2BTC } from '../api/order';
import { getCarolAddress, getTransactionUrl, getAddressUrl, CAROL_PRIVATE_KEY, getRpcUrl, getEscrowContractAddress } from '../variables';
import { checkDepositEVM, claimETH } from '../utils/evm';
import { payLightningInvoice } from '../utils/lightning';

export interface PaymentReceipt {
  secret: string;
  paymentHash: string;
  amount: number;
  timestamp: Date;
}

export interface EscrowTransaction {
  txHash: string;
  blockNumber: number;
  gasUsed: number;
}

export interface DecodedInvoice {
  hashedSecret: string;
  amount: number;
  description: string;
  expiry: Date;
  paymentHash: string;
}

export interface ResolverResponse {
  ethAddress: string;
}

export class ResolverEVM2BTC {
  
  sendToResolver(order: OrderEVM2BTC): ResolverResponse {
    // here we simulate relay operations by 1inch of processing the order
    // the order will be import { CrossChainOrder } from '@1inch/cross-chain-sdk'
    // but now we use our stub order since bitcoin os not supported by 1inch yet

    console.log('----------------------');
    console.log('🤖 RESOLVER PROCESSING STARTED');
    console.log('🤖 RESOLVER: Order Type: Single Fill Order (100% Fill)');
    console.log('----------------------');
    console.log('🤖 RESOLVER: received Lightning Invoice:', order.btcLightningNetInvoice.substring(0, 25) + '...');
    const btcLightningNetInvoice = order.btcLightningNetInvoice;
    // Decode the Lightning invoice
    const decodedData = this.decodeBtcLightningNetInvoice(btcLightningNetInvoice);
    console.log('🤖 RESOLVER: Decoded Invoice Data:', decodedData); // print 
    
    // Extract hashed secret and amounts
    const { hashedSecret, amount } = decodedData;
    const eth_amount = order.amountEth;
    const btc_amount = amount;
    console.log('🤖 RESOLVER: Extracted Hashed Secret:', hashedSecret);
    console.log('🤖 RESOLVER: Extracted Amount (BTC):', btc_amount);
    console.log('🤖 RESOLVER: Amount in ETH (converted):', this.calculateRate(btc_amount, eth_amount)); // Dummy conversion rate
    
    // Start async process to wait for escrow deposit and process the swap
    // Note: This is intentionally not awaited to allow immediate response
    this.waitForEscrow(btcLightningNetInvoice, hashedSecret, eth_amount)
      .catch(error => {
        console.error('🤖 RESOLVER: ❌ Error in escrow monitoring:', error);
      });
    
    // Return resolver's ETH address immediately
    const resolverResponse: ResolverResponse = {
      ethAddress: getCarolAddress()
    };
    
    console.log('🤖 RESOLVER: Returning resolver ETH address:', resolverResponse.ethAddress);
    return resolverResponse;

  }
  
  decodeBtcLightningNetInvoice(invoice: string): DecodedInvoice {
    console.log('🤖 RESOLVER: 🔍 Decoding Lightning Network invoice...');
    console.log(`🤖 RESOLVER:    Invoice: ${invoice.substring(0, 25)}...`);
    
    try {
      // Decode the Lightning Network invoice using bolt11 library
      const decoded = bolt11.decode(invoice);
      
      // Extract the payment hash (this is the hashed secret)
      const paymentHash = decoded.tags.find(tag => tag.tagName === 'payment_hash')?.data;
      if (!paymentHash) {
        throw new Error('Payment hash not found in invoice');
      }
      
      // Extract the amount in satoshis
      let amountSatoshis = 0;
      if (decoded.satoshis) {
        amountSatoshis = decoded.satoshis;
      } else if (decoded.millisatoshis) {
        amountSatoshis = Math.floor(Number(decoded.millisatoshis) / 1000);
      }
      
      // Convert satoshis to BTC
      const amountBTC = amountSatoshis / 100000000;
      
      // Extract description
      const descriptionTag = decoded.tags.find(tag => tag.tagName === 'description');
      const description = typeof descriptionTag?.data === 'string' ? descriptionTag.data : 'Cross-chain swap payment';
      
      // Extract expiry time
      const expiryTag = decoded.tags.find(tag => tag.tagName === 'expiry');
      const expirySeconds = typeof expiryTag?.data === 'number' ? expiryTag.data : 3600; // Default 1 hour
      const expiry = new Date(Date.now() + (expirySeconds * 1000));
      
      // Create the decoded invoice object
      const decodedData: DecodedInvoice = {
        hashedSecret: '0x' + paymentHash,
        amount: amountBTC,
        description: description,
        expiry: expiry,
        paymentHash: '0x' + paymentHash
      };
      
      console.log('🤖 RESOLVER: ✅ Invoice decoded successfully');
      console.log(`🤖 RESOLVER:    Payment Hash: ${decodedData.paymentHash}`);
      console.log(`🤖 RESOLVER:    Amount: ${decodedData.amount} BTC (${amountSatoshis} satoshis)`);
      console.log(`🤖 RESOLVER:    Description: ${decodedData.description}`);
      console.log(`🤖 RESOLVER:    Expiry: ${decodedData.expiry.toISOString()}`);
      console.log(`🤖 RESOLVER:    Network: ${decoded.network || 'mainnet'}`);
      
      return decodedData;
      
    } catch (error) {
      console.error('🤖 RESOLVER: ❌ Error decoding Lightning invoice:', error);
      
      // Fallback to dummy data if decoding fails
      console.log('🤖 RESOLVER: ⚠️  Falling back to dummy data');
      const dummyData: DecodedInvoice = {
        hashedSecret: '0x' + Math.random().toString(16).substring(2, 66),
        amount: 0.001,
        description: 'Cross-chain swap payment (fallback)',
        expiry: new Date(Date.now() + 3600000), // 1 hour from now
        paymentHash: '0x' + Math.random().toString(16).substring(2, 66)
      };
      
      return dummyData;
    }
  }
  
  depositEscrowETH(hashedSecret: string, amountEth: number): EscrowTransaction {
    console.log('🤖 RESOLVER: 💰 Depositing native tokens to escrow contract...');
    console.log(`🤖 RESOLVER:    Hashed Secret: ${hashedSecret}`);
    console.log(`🤖 RESOLVER:    Amount: ${amountEth} ETH`);
    console.log('🤖 RESOLVER:    Contract Address: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6');
    
    // Dummy transaction data
    const tx: EscrowTransaction = {
      txHash: '0x' + Math.random().toString(16).substring(2, 66),
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
      gasUsed: Math.floor(Math.random() * 100000) + 50000
    };
    
    console.log('🤖 RESOLVER: ✅ Escrow deposit successful');
    console.log(`🤖 RESOLVER:    Transaction Hash: ${tx.txHash}`);
    console.log(`🤖 RESOLVER:    Block Number: ${tx.blockNumber}`);
    console.log(`🤖 RESOLVER:    Gas Used: ${tx.gasUsed}`);
    
    return tx;
  }
  
  async payLightningNetInvoice(invoice: string): Promise<PaymentReceipt> {
    console.log('🤖 RESOLVER: ⚡ Paying Lightning Network invoice...');
    console.log(`🤖 RESOLVER:    Invoice: ${invoice.substring(0, 25)}...`);
    
    try {
      // Use the implemented payLightningInvoice function
      // Use 'carol' as the node alias since Carol is the resolver who pays the invoice
      const receipt = await payLightningInvoice(invoice, 'carol');
      
      console.log('🤖 RESOLVER: ✅ Lightning payment successful');
      console.log(`🤖 RESOLVER:    Secret: ${receipt.secret}`);
      console.log(`🤖 RESOLVER:    Payment Hash: ${receipt.paymentHash}`);
      console.log(`🤖 RESOLVER:    Amount: ${receipt.amount} BTC`);
      console.log(`🤖 RESOLVER:    Timestamp: ${receipt.timestamp.toISOString()}`);
      
      return receipt;
      
    } catch (error) {
      throw error
    }
  }
  
  async claimEscrow(secret: string, originalHashedSecret: string): Promise<EscrowTransaction> {
    console.log('🤖 RESOLVER: 🏦 Claiming funds from escrow contract...');
    console.log(`🤖 RESOLVER:    Secret: ${secret}`);
    console.log(`🤖 RESOLVER:    Original Hashed Secret: ${originalHashedSecret}`);
    
    try {
      // Use the original hashed secret from the deposit instead of generating a new one
      const hashedSecret = originalHashedSecret;
      
      console.log(`🤖 RESOLVER:    Using Deposit ID: ${hashedSecret}`);
      
      // Use the implemented claimETH function
      const claimResult = await claimETH({
        depositId: hashedSecret,
        secret: secret,
        claimerPrivateKey: CAROL_PRIVATE_KEY
      });
      
      // Convert the result to EscrowTransaction format
      const tx: EscrowTransaction = {
        txHash: claimResult.txHash,
        blockNumber: 0, // This would need to be extracted from the receipt if needed
        gasUsed: 0 // This would need to be extracted from the receipt if needed
      };
      
      console.log('🤖 RESOLVER: ✅ Escrow claim successful');
      console.log(`🤖 RESOLVER:    Transaction Hash: ${tx.txHash}`);
      console.log(`🤖 RESOLVER:    Explorer URL: ${claimResult.explorerUrl}`);
      
      return tx;
      
    } catch (error) {
      console.error('🤖 RESOLVER: ❌ Failed to claim escrow:', error);
      throw error;
    }
  }


  /**
   * Check if a deposit exists in the escrow contract with the correct amount
   * @param invoice Lightning Network invoice (for logging purposes)
   * @param hashedSecret The hashlock used as deposit ID
   * @param expectedAmount Expected ETH amount in the deposit
   * @returns true if deposit exists with correct amount, false otherwise
   */
   async checkDeposit(invoice: string, hashedSecret: string, expectedAmount: number): Promise<boolean> {
    try {
      // Make real API call to the escrow contract
      const depositResult = await checkDepositEVM(hashedSecret, expectedAmount);
      
      if (depositResult.exists && !depositResult.claimed && !depositResult.cancelled) {
        console.log('🤖 RESOLVER: ✅ Deposit found with correct amount!');
        console.log(`🤖 RESOLVER:    Actual amount: ${depositResult.amount} ETH`);
        console.log(`🤖 RESOLVER:    Deposit status: Active`);
        console.log(`🤖 RESOLVER:    Depositor: ${depositResult.depositor}`);
        console.log(`🤖 RESOLVER:    Claimer: ${depositResult.claimer}`);
        return true;
      } else {
        const escrowContractAddress = getEscrowContractAddress();
        const explorerUrl = getAddressUrl(escrowContractAddress);
        console.log(`🤖 RESOLVER: still waiting for escrow (${explorerUrl})`);
        return false;
      }
    } catch (error) {
      console.error('🤖 RESOLVER: ❌ Error checking deposit:', error);
      return false;
    }
  }
  
  async waitForEscrow(invoice: string, hashedSecret: string, ethAmount: number): Promise<void> {
    console.log('🤖 RESOLVER: 🔄 Starting escrow monitoring process...');
    console.log(`🤖 RESOLVER:    Monitoring for deposit of ${ethAmount} ETH`);
    console.log(`🤖 RESOLVER:    Hashed Secret: ${hashedSecret}`);
    
    // Get the escrow contract address for the explorer link
    const escrowContractAddress = getEscrowContractAddress();
    const explorerUrl = getAddressUrl(escrowContractAddress);
    
    let checkInterval: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    
    // Handle process cleanup
    const cleanup = () => {
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
    
    // Cleanup on process exit
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);
    
    return new Promise((resolve, reject) => {
      // Simulate checking for escrow deposit in a loop
      checkInterval = setInterval(async () => {
        try {
          // In a real implementation, this would check the blockchain
          // For now, we simulate finding the deposit after a random delay
          const hasDeposit = await this.checkDeposit(invoice, hashedSecret, ethAmount)
          
          if (hasDeposit) {
            console.log('🤖 RESOLVER: ✅ Escrow deposit found!');
            cleanup();
            
            // Process the Lightning payment
            await this.processLightningPayment(invoice, hashedSecret);
            resolve();
          } else {
            console.log(`🤖 RESOLVER: still waiting for escrow (${explorerUrl})`);
          }
        } catch (error) {
          console.error('🤖 RESOLVER: ❌ Error in escrow monitoring:', error);
          cleanup();
          reject(error);
        }
      }, 10000); // Check every 10 seconds
      
      // Set a timeout to stop monitoring after 5 minutes
      timeoutId = setTimeout(() => {
        console.log('🤖 RESOLVER: ⏰ Escrow monitoring timeout - no deposit found');
        cleanup();
        reject(new Error('Escrow monitoring timeout - no deposit found'));
      }, 300000); // 5 minutes
    });
  }
  
  async processLightningPayment(invoice: string, hashedSecret: string): Promise<void> {
    console.log('🤖 RESOLVER: ⚡ Processing Lightning payment...');
    
    try {
      // Pay the Lightning invoice
      const paymentReceipt = await this.payLightningNetInvoice(invoice);
      console.log('🤖 RESOLVER: ✅ Lightning payment successful:', paymentReceipt);

      console.log("------------------------------------------");
      console.log("🤖 RESOLVER: ✅ Escrow claim...");

      
      // Claim the escrow with the secret and original hashed secret
      const claimTx = await this.claimEscrow(paymentReceipt.secret, hashedSecret);
      const claimExplorerUrl = getTransactionUrl(claimTx.txHash);
      console.log('🤖 RESOLVER: ✅ Escrow claim successful:', claimTx);
      console.log(`🤖 RESOLVER: 🔗 Claim Transaction: ${claimExplorerUrl}`);
      
      console.log('🤖 RESOLVER: 🎉 Cross-chain swap completed successfully!');
      console.log('🤖 RESOLVER:    ETH → BTC swap finished');

      
    } catch (error) {
      throw error
    }
  }
  
  calculateRate(btcAmount: number, ethAmount: number): number {
    // Dummy conversion rate - in a real implementation this would use an oracle
    return ethAmount;
  }
  
  async printBalance(): Promise<void> {
    console.log('🤖 RESOLVER: 💳 Current Balance Report:');
    
    try {
      const provider = new ethers.JsonRpcProvider(getRpcUrl());
      const carolAddress = getCarolAddress();
      const carolBalance = await provider.getBalance(carolAddress);
      const carolBalanceFormatted = ethers.formatEther(carolBalance);
      
      console.log(`🤖 RESOLVER:    Resolver Balance: ${carolBalanceFormatted} ETH`);
      console.log(`🤖 RESOLVER:    Resolver Address: ${carolAddress}`);
      console.log('🤖 RESOLVER:    Last Updated: ' + new Date().toISOString());
      
    } catch (error) {
      console.error('🤖 RESOLVER: ❌ Error checking balance:', error);
      console.log('🤖 RESOLVER:    Carol Balance: 0.985 ETH (fallback)');
      console.log('🤖 RESOLVER:    Last Updated: ' + new Date().toISOString());
    }
  }
} 