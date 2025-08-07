import { ethers } from 'ethers';
import { generateAlgorandSecret } from './src/utils/algorand';

async function testSecretValidation() {
  console.log('🧪 Testing Secret and Hashlock Validation');
  console.log('==========================================');

  // Generate a new secret and hashlock
  const { secret, hashedSecret } = generateAlgorandSecret();
  
  console.log('Generated Secret (base64):', secret);
  console.log('Generated Hashlock (hex):', hashedSecret);
  
  // Convert secret from base64 to bytes
  const secretBytes = Buffer.from(secret, 'base64');
  console.log('Secret as bytes:', secretBytes);
  console.log('Secret as hex:', '0x' + secretBytes.toString('hex'));
  
  // Hash the secret bytes using SHA256
  const computedHashlock = ethers.sha256(secretBytes);
  console.log('Computed Hashlock:', computedHashlock);
  
  // Compare with generated hashlock
  const hashlockHex = hashedSecret.startsWith('0x') ? hashedSecret : `0x${hashedSecret}`;
  console.log('Generated Hashlock (with 0x):', hashlockHex);
  
  const match = computedHashlock.toLowerCase() === hashlockHex.toLowerCase();
  console.log('Hashlock Match:', match ? '✅ YES' : '❌ NO');
  
  if (!match) {
    console.log('❌ The secret and hashlock do not match!');
    console.log('This explains why the EVM contract is rejecting the claim.');
  } else {
    console.log('✅ The secret and hashlock match correctly!');
  }
  
  // Test the exact format expected by the EVM contract
  console.log('\n📋 EVM Contract Format Test:');
  console.log('Deposit ID (hashlock):', hashlockHex);
  console.log('Secret (bytes):', secretBytes);
  console.log('Secret (hex):', '0x' + secretBytes.toString('hex'));
}

testSecretValidation().catch(console.error); 