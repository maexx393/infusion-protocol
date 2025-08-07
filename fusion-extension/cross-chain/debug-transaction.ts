#!/usr/bin/env ts-node

import { ethers } from 'ethers';

// Test the exact values from the production run
const testSecret = 'NI4FTDtBPyUGLlxsG5Gwo+n7KWmmH0jLao5ZPERGI/c=';
const testHashlock = '0xf489aa70feacc3d8f03a71c082ecf012b70a75356e0242ac1736000671c50d0e';

console.log('🔍 Debugging Transaction Data...\n');

console.log('📋 Test Values:');
console.log(`   Secret (base64): ${testSecret}`);
console.log(`   Hashlock: ${testHashlock}`);

// Convert secret from base64 to bytes
const secretBytes = Buffer.from(testSecret, 'base64');
console.log(`\n🔧 Secret Conversion:`);
console.log(`   Secret as bytes: ${secretBytes.toString('hex')}`);
console.log(`   Secret length: ${secretBytes.length} bytes`);

// Verify the hashlock matches
const keccak256Hash = ethers.keccak256(secretBytes);
console.log(`\n🔍 Hashlock Verification:`);
console.log(`   Expected: ${testHashlock}`);
console.log(`   Computed: ${keccak256Hash}`);
console.log(`   Match: ${keccak256Hash === testHashlock ? '✅' : '❌'}`);

// Simulate the contract call
console.log(`\n🏗️ Contract Call Simulation:`);

// Create a mock contract interface
const ESCROW_ABI = [
  "function claim(bytes32 depositId, bytes memory secret) external"
];

// Create interface
const iface = new ethers.Interface(ESCROW_ABI);

// Encode the function call
const encodedData = iface.encodeFunctionData('claim', [testHashlock, secretBytes]);
console.log(`   Function: claim(${testHashlock}, ${secretBytes.toString('hex')})`);
console.log(`   Encoded data: ${encodedData}`);

// Decode to verify
const decoded = iface.parseTransaction({ data: encodedData });
console.log(`\n🔍 Decoded Transaction:`);
console.log(`   Function: ${decoded?.name}`);
console.log(`   Args:`, decoded?.args);

// Test with the exact transaction data from the error
const errorTxData = '0xf0331024f489aa70feacc3d8f03a71c082ecf012b70a75356e0242ac1736000671c50d0e000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020348e054c3b413f25062e5c6c1b91b0a3e9fb2969a61f48cb6a8e593c444623f7';

console.log(`\n🔍 Error Transaction Analysis:`);
console.log(`   Error tx data: ${errorTxData}`);

try {
  const decodedError = iface.parseTransaction({ data: errorTxData });
  console.log(`   Decoded function: ${decodedError?.name}`);
  console.log(`   Decoded args:`, decodedError?.args);
  
  if (decodedError?.args) {
    const [depositId, secret] = decodedError.args;
    console.log(`   Deposit ID: ${depositId}`);
    console.log(`   Secret (hex): ${secret}`);
    console.log(`   Secret (bytes): ${Buffer.from(secret.slice(2), 'hex').toString('base64')}`);
  }
} catch (error) {
  console.log(`   Failed to decode error transaction: ${error}`);
}

// Compare our encoded data with the error data
console.log(`\n🔍 Data Comparison:`);
console.log(`   Our encoded: ${encodedData}`);
console.log(`   Error data:  ${errorTxData}`);
console.log(`   Match: ${encodedData === errorTxData ? '✅' : '❌'}`);

if (encodedData !== errorTxData) {
  console.log(`\n❌ The transaction data doesn't match!`);
  console.log(`   This suggests the secret is being processed differently.`);
} else {
  console.log(`\n✅ The transaction data matches!`);
  console.log(`   The issue might be elsewhere.`);
} 