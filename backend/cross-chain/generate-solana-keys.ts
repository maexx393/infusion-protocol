#!/usr/bin/env ts-node

/**
 * Generate Solana Keypairs for Cross-Chain Integration
 * 
 * This script generates Solana keypairs and displays their private keys
 * so they can be funded with SOL for real transactions.
 */

import { Keypair } from '@solana/web3.js';

interface SolanaKeypairInfo {
  name: string;
  publicKey: string;
  privateKeyBase64: string;
  privateKeyHex: string;
}

function generateSolanaKeypairs(): SolanaKeypairInfo[] {
  const keypairs: SolanaKeypairInfo[] = [];
  
  // Generate keypairs for different roles
  const roles = ['resolver', 'silvio', 'stacy'];
  
  for (const role of roles) {
    const keypair = Keypair.generate();
    
    keypairs.push({
      name: role,
      publicKey: keypair.publicKey.toString(),
      privateKeyBase64: Buffer.from(keypair.secretKey).toString('base64'),
      privateKeyHex: Buffer.from(keypair.secretKey).toString('hex')
    });
  }
  
  return keypairs;
}

function displayKeypairInfo(keypairs: SolanaKeypairInfo[]): void {
  console.log('🔑 Generated Solana Keypairs for Cross-Chain Integration');
  console.log('='.repeat(80));
  console.log('📋 Use these addresses to fund with SOL for real transactions');
  console.log('🔐 Keep private keys secure - they control the accounts');
  console.log('='.repeat(80));
  
  for (const keypair of keypairs) {
    console.log(`\n👤 ${keypair.name.toUpperCase()}:`);
    console.log(`   🌐 Public Key: ${keypair.publicKey}`);
    console.log(`   🔐 Private Key (Base64): ${keypair.privateKeyBase64}`);
    console.log(`   🔐 Private Key (Hex): ${keypair.privateKeyHex}`);
    console.log(`   💰 Fund this address with SOL for real transactions`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('🚀 Next Steps:');
  console.log('   1. Copy the public keys above');
  console.log('   2. Use Solana faucet to fund them with SOL');
  console.log('   3. Update the solana-addresses.ts config with these keys');
  console.log('   4. Run the cross-chain swap with real transactions');
  console.log('='.repeat(80));
}

function generateConfigUpdate(keypairs: SolanaKeypairInfo[]): void {
  console.log('\n📝 Config Update for solana-addresses.ts:');
  console.log('```typescript');
  console.log('export const SOLANA_REAL_ADDRESSES = {');
  
  for (const keypair of keypairs) {
    console.log(`  ${keypair.name}: {`);
    console.log(`    address: '${keypair.publicKey}',`);
    console.log(`    privateKey: '${keypair.privateKeyBase64}'`);
    console.log(`  },`);
  }
  
  console.log('};');
  console.log('```');
}

function main(): void {
  try {
    // Generate keypairs
    const keypairs = generateSolanaKeypairs();
    
    // Display information
    displayKeypairInfo(keypairs);
    
    // Generate config update
    generateConfigUpdate(keypairs);
    
    console.log('\n✅ Solana keypairs generated successfully!');
    console.log('💡 Remember to fund these accounts before running real transactions.');
    
  } catch (error) {
    console.error('❌ Failed to generate Solana keypairs:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
} 