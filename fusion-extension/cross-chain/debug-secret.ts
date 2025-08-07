#!/usr/bin/env ts-node

import { ethers } from 'ethers';
import * as crypto from 'crypto';

// Test the exact values from the production run
const testSecret = 'NI4FTDtBPyUGLlxsG5Gwo+n7KWmmH0jLao5ZPERGI/c=';
const testHashlock = '0xf489aa70feacc3d8f03a71c082ecf012b70a75356e0242ac1736000671c50d0e';

console.log('🔍 Debugging Secret Validation...\n');

console.log('📋 Test Values:');
console.log(`   Secret (base64): ${testSecret}`);
console.log(`   Hashlock: ${testHashlock}`);

// Convert secret from base64 to bytes
const secretBytes = Buffer.from(testSecret, 'base64');
console.log(`\n🔧 Secret Conversion:`);
console.log(`   Secret as bytes: ${secretBytes.toString('hex')}`);
console.log(`   Secret length: ${secretBytes.length} bytes`);

// Test different hash methods
console.log(`\n🔍 Hash Methods Comparison:`);

// Method 1: Keccak256 (what the EVM contract uses)
const keccak256Hash = ethers.keccak256(secretBytes);
console.log(`   1. Keccak256: ${keccak256Hash}`);
console.log(`      Matches hashlock: ${keccak256Hash === testHashlock ? '✅' : '❌'}`);

// Method 2: SHA256
const sha256Hash = crypto.createHash('sha256').update(secretBytes).digest('hex');
const sha256HashWith0x = '0x' + sha256Hash;
console.log(`   2. SHA256: ${sha256HashWith0x}`);
console.log(`      Matches hashlock: ${sha256HashWith0x === testHashlock ? '✅' : '❌'}`);

// Method 3: Keccak256 of the base64 string
const keccak256OfString = ethers.keccak256(ethers.toUtf8Bytes(testSecret));
console.log(`   3. Keccak256 of base64 string: ${keccak256OfString}`);
console.log(`      Matches hashlock: ${keccak256OfString === testHashlock ? '✅' : '❌'}`);

// Method 4: SHA256 of the base64 string
const sha256OfString = crypto.createHash('sha256').update(testSecret).digest('hex');
const sha256OfStringWith0x = '0x' + sha256OfString;
console.log(`   4. SHA256 of base64 string: ${sha256OfStringWith0x}`);
console.log(`      Matches hashlock: ${sha256OfStringWith0x === testHashlock ? '✅' : '❌'}`);

console.log(`\n🎯 Conclusion:`);
if (keccak256Hash === testHashlock) {
  console.log(`✅ The secret should work with Keccak256!`);
} else if (sha256HashWith0x === testHashlock) {
  console.log(`✅ The secret should work with SHA256!`);
} else {
  console.log(`❌ No hash method matches the hashlock!`);
  console.log(`   This suggests the hashlock was generated differently.`);
}

// Test the exact contract validation
console.log(`\n🏗️ Contract Validation Test:`);
console.log(`   Contract expects: keccak256(secret) == hashlock`);
console.log(`   Our test: keccak256(${secretBytes.toString('hex')}) == ${testHashlock}`);
console.log(`   Result: ${keccak256Hash === testHashlock ? '✅ VALID' : '❌ INVALID'}`); 