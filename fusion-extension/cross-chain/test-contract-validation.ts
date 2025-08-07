#!/usr/bin/env ts-node

import { ethers } from 'ethers';

// Test the exact values from the production run
const testSecret = 'NI4FTDtBPyUGLlxsG5Gwo+n7KWmmH0jLao5ZPERGI/c=';
const testHashlock = '0xf489aa70feacc3d8f03a71c082ecf012b70a75356e0242ac1736000671c50d0e';

console.log('🔍 Testing Contract Validation Logic...\n');

console.log('📋 Test Values:');
console.log(`   Secret (base64): ${testSecret}`);
console.log(`   Hashlock: ${testHashlock}`);

// Convert secret from base64 to bytes
const secretBytes = Buffer.from(testSecret, 'base64');
console.log(`\n🔧 Secret Conversion:`);
console.log(`   Secret as bytes: ${secretBytes.toString('hex')}`);
console.log(`   Secret length: ${secretBytes.length} bytes`);

// Test different ways the contract might be hashing the secret
console.log(`\n🔍 Contract Validation Methods:`);

// Method 1: keccak256 of the raw bytes (what we think it should be)
const keccak256OfBytes = ethers.keccak256(secretBytes);
console.log(`   1. keccak256(raw bytes): ${keccak256OfBytes}`);
console.log(`      Matches hashlock: ${keccak256OfBytes === testHashlock ? '✅' : '❌'}`);

// Method 2: keccak256 of the base64 string
const keccak256OfString = ethers.keccak256(ethers.toUtf8Bytes(testSecret));
console.log(`   2. keccak256(base64 string): ${keccak256OfString}`);
console.log(`      Matches hashlock: ${keccak256OfString === testHashlock ? '✅' : '❌'}`);

// Method 3: keccak256 of the hex string
const keccak256OfHex = ethers.keccak256(ethers.toUtf8Bytes(secretBytes.toString('hex')));
console.log(`   3. keccak256(hex string): ${keccak256OfHex}`);
console.log(`      Matches hashlock: ${keccak256OfHex === testHashlock ? '✅' : '❌'}`);

// Method 4: keccak256 of the bytes as a string (what the contract might be doing)
const secretAsString = secretBytes.toString();
const keccak256OfBytesAsString = ethers.keccak256(ethers.toUtf8Bytes(secretAsString));
console.log(`   4. keccak256(bytes as string): ${keccak256OfBytesAsString}`);
console.log(`      Matches hashlock: ${keccak256OfBytesAsString === testHashlock ? '✅' : '❌'}`);

// Method 5: Let's check if the contract is using a different hash function
const crypto = require('crypto');
const sha256OfBytes = crypto.createHash('sha256').update(secretBytes).digest('hex');
const sha256OfBytesWith0x = '0x' + sha256OfBytes;
console.log(`   5. sha256(raw bytes): ${sha256OfBytesWith0x}`);
console.log(`      Matches hashlock: ${sha256OfBytesWith0x === testHashlock ? '✅' : '❌'}`);

// Method 6: Check if the contract is hashing the bytes array differently
// In Solidity, when you pass bytes to keccak256, it might include padding
const paddedBytes = ethers.zeroPadValue(secretBytes, 32);
const keccak256OfPaddedBytes = ethers.keccak256(paddedBytes);
console.log(`   6. keccak256(padded bytes): ${keccak256OfPaddedBytes}`);
console.log(`      Matches hashlock: ${keccak256OfPaddedBytes === testHashlock ? '✅' : '❌'}`);

console.log(`\n🎯 Analysis:`);
if (keccak256OfBytes === testHashlock) {
  console.log(`✅ Method 1 (keccak256 of raw bytes) matches!`);
  console.log(`   This suggests the contract should work with our current approach.`);
} else {
  console.log(`❌ None of the standard methods match the hashlock.`);
  console.log(`   The contract might be using a different validation method.`);
}

// Let's also check what the actual contract code says
console.log(`\n📋 Contract Code Analysis:`);
console.log(`   The contract uses: keccak256(secret)`);
console.log(`   Where 'secret' is of type 'bytes memory'`);
console.log(`   This should hash the entire bytes array as-is.`);
console.log(`   Our secret bytes: ${secretBytes.toString('hex')}`);
console.log(`   Expected hash: ${testHashlock}`);
console.log(`   Actual hash: ${keccak256OfBytes}`);
console.log(`   Match: ${keccak256OfBytes === testHashlock ? '✅' : '❌'}`); 