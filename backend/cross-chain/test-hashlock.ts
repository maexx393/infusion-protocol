#!/usr/bin/env ts-node

/**
 * Test script to verify hashlock calculation and debug secret validation
 */

import { ethers } from 'ethers';
import { generateSolanaSecret } from './src/utils/solana';

async function testHashlockCalculation() {
  console.log('🔍 Testing Hashlock Calculation...\n');

  // Generate secret using Solana method
  const { secret, hashedSecret } = generateSolanaSecret();
  
  console.log('📋 Generated Values:');
  console.log(`   Secret: ${secret}`);
  console.log(`   Hashlock: ${hashedSecret}`);
  console.log(`   Secret Length: ${secret.length} characters`);
  console.log(`   Hashlock Length: ${hashedSecret.length} characters`);

  // Test different hashlock calculation methods
  console.log('\n🔍 Testing Different Hashlock Methods:');
  
  // Method 1: Solana method (SHA256 of hex string)
  const crypto = require('crypto');
  const solanaHashlock = crypto.createHash('sha256').update(secret).digest('hex');
  console.log(`   1. Solana Method: ${solanaHashlock}`);
  console.log(`      Matches generated: ${solanaHashlock === hashedSecret ? '✅' : '❌'}`);

  // Method 2: EVM method (SHA256 of bytes)
  const secretBytes = Buffer.from(secret, 'hex');
  const evmHashlock = ethers.keccak256(secretBytes);
  console.log(`   2. EVM Keccak256: ${evmHashlock}`);
  console.log(`      Matches generated: ${evmHashlock === hashedSecret ? '✅' : '❌'}`);

  // Method 3: SHA256 of bytes
  const sha256Hashlock = crypto.createHash('sha256').update(secretBytes).digest('hex');
  console.log(`   3. SHA256 of bytes: ${sha256Hashlock}`);
  console.log(`      Matches generated: ${sha256Hashlock === hashedSecret ? '✅' : '❌'}`);

  // Method 4: Double SHA256
  const doubleSha256 = crypto.createHash('sha256').update(crypto.createHash('sha256').update(secret).digest()).digest('hex');
  console.log(`   4. Double SHA256: ${doubleSha256}`);
  console.log(`      Matches generated: ${doubleSha256 === hashedSecret ? '✅' : '❌'}`);

  // Test secret encoding
  console.log('\n🔍 Testing Secret Encoding:');
  console.log(`   Secret as hex: ${secret}`);
  console.log(`   Secret as bytes: ${secretBytes.toString('hex')}`);
  console.log(`   Secret length in bytes: ${secretBytes.length}`);

  // Test hashlock with 0x prefix
  const hashlockWithPrefix = `0x${hashedSecret}`;
  console.log(`\n🔍 Hashlock with 0x prefix: ${hashlockWithPrefix}`);

  // Test ethers.getBytes
  try {
    const hashlockBytes = ethers.getBytes(hashlockWithPrefix);
    console.log(`   Hashlock as bytes: ${Buffer.from(hashlockBytes).toString('hex')}`);
  } catch (error) {
    console.log(`   Error converting hashlock to bytes: ${error}`);
  }

  console.log('\n🎯 Conclusion:');
  console.log('   The hashlock calculation method needs to match between Solana and EVM contracts.');
  console.log('   If the EVM contract expects a different hashlock format, the deposit will fail.');
}

// Run the test
if (require.main === module) {
  testHashlockCalculation().catch(console.error);
} 