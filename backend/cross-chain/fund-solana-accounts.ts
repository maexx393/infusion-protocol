#!/usr/bin/env ts-node

/**
 * Fund Solana Accounts for Cross-Chain Integration
 * 
 * This script funds the configured Solana accounts with SOL from the faucet
 * so they can perform real transactions.
 */

import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { getAccountAddress } from './src/config/solana-addresses';

const SOLANA_FAUCET_URL = 'https://faucet.solana.com';
const SOLANA_RPC_URL = 'https://api.testnet.solana.com';

interface AccountInfo {
  name: string;
  address: string;
  balance: number;
  needsFunding: boolean;
}

async function checkAccountBalance(connection: Connection, address: string): Promise<number> {
  try {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL; // Convert lamports to SOL
  } catch (error) {
    console.error(`Error checking balance for ${address}:`, error);
    return 0;
  }
}

async function fundAccount(address: string, amount: number = 1): Promise<boolean> {
  try {
    console.log(`💰 Funding account ${address} with ${amount} SOL...`);
    
    // Use Solana CLI or web faucet
    const response = await fetch(SOLANA_FAUCET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: address,
        amount: amount * LAMPORTS_PER_SOL // Convert SOL to lamports
      })
    });

    if (response.ok) {
      console.log(`✅ Successfully funded ${address} with ${amount} SOL`);
      return true;
    } else {
      console.error(`❌ Failed to fund ${address}: ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error funding ${address}:`, error);
    return false;
  }
}

async function main(): Promise<void> {
  console.log('🔑 Funding Solana Accounts for Cross-Chain Integration');
  console.log('='.repeat(80));
  
  // Setup Solana connection
  const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  
  // Get account addresses
  const accounts: AccountInfo[] = [
    { name: 'resolver', address: getAccountAddress('resolver'), balance: 0, needsFunding: false },
    { name: 'silvio', address: getAccountAddress('silvio'), balance: 0, needsFunding: false },
    { name: 'stacy', address: getAccountAddress('stacy'), balance: 0, needsFunding: false }
  ];

  console.log('📋 Checking current balances...\n');

  // Check current balances
  for (const account of accounts) {
    account.balance = await checkAccountBalance(connection, account.address);
    account.needsFunding = account.balance < 0.1; // Need at least 0.1 SOL
    
    console.log(`👤 ${account.name.toUpperCase()}:`);
    console.log(`   🌐 Address: ${account.address}`);
    console.log(`   💰 Balance: ${account.balance.toFixed(6)} SOL`);
    console.log(`   🔄 Needs Funding: ${account.needsFunding ? 'Yes' : 'No'}`);
    console.log('');
  }

  // Fund accounts that need it
  const accountsToFund = accounts.filter(account => account.needsFunding);
  
  if (accountsToFund.length === 0) {
    console.log('✅ All accounts are already funded!');
    return;
  }

  console.log(`🚀 Funding ${accountsToFund.length} accounts...\n`);

  for (const account of accountsToFund) {
    const success = await fundAccount(account.address, 1); // Fund with 1 SOL
    if (success) {
      // Wait a bit for the transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check new balance
      const newBalance = await checkAccountBalance(connection, account.address);
      console.log(`   ✅ New balance: ${newBalance.toFixed(6)} SOL\n`);
    } else {
      console.log(`   ❌ Failed to fund ${account.name}\n`);
    }
  }

  console.log('='.repeat(80));
  console.log('🎯 Manual Funding Instructions:');
  console.log('If automatic funding failed, manually fund these accounts:');
  console.log('');
  
  for (const account of accountsToFund) {
    console.log(`👤 ${account.name.toUpperCase()}:`);
    console.log(`   🌐 Address: ${account.address}`);
    console.log(`   💰 Fund with: 1 SOL minimum`);
    console.log(`   🔗 Faucet: ${SOLANA_FAUCET_URL}`);
    console.log('');
  }

  console.log('💡 After funding, run the cross-chain swap script again.');
  console.log('='.repeat(80));
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
} 