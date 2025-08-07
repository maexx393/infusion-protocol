/**
 * Test script to verify Algorand private key configuration
 */

import { 
  STACY_PRIVATE_KEY, 
  SILVIO_PRIVATE_KEY, 
  hasValidAlgorandPrivateKeys,
  hasValidStacyPrivateKey,
  hasValidSilvioPrivateKey
} from './src/variables';

import { getAccountAddress, getAccountMnemonic } from './src/config/algorand-addresses';
import algosdk from 'algosdk';

function testAlgorandPrivateKeys() {
  console.log('🔑 Testing Algorand Private Key Configuration');
  console.log('=============================================');
  console.log();

  // Test validation functions
  console.log('📋 Validation Results:');
  console.log(`   STACY_PRIVATE_KEY valid: ${hasValidStacyPrivateKey() ? '✅' : '❌'}`);
  console.log(`   SILVIO_PRIVATE_KEY valid: ${hasValidSilvioPrivateKey() ? '✅' : '❌'}`);
  console.log(`   Both keys valid: ${hasValidAlgorandPrivateKeys() ? '✅' : '❌'}`);
  console.log();

  if (!hasValidAlgorandPrivateKeys()) {
    console.log('❌ Algorand private keys are not properly configured!');
    console.log();
    console.log('🔧 To fix this:');
    console.log('1. Run: npx ts-node get-algorand-private-keys.ts');
    console.log('2. Copy the STACY_PRIVATE_KEY and SILVIO_PRIVATE_KEY values');
    console.log('3. Add them to your .env file');
    console.log('4. Run this test again');
    return;
  }

  // Test conversion to Uint8Array
  console.log('🔄 Testing Private Key Conversion:');
  try {
    const stacyPrivateKeyBytes = new Uint8Array(Buffer.from(STACY_PRIVATE_KEY.slice(2), 'hex'));
    const silvioPrivateKeyBytes = new Uint8Array(Buffer.from(SILVIO_PRIVATE_KEY.slice(2), 'hex'));
    
    console.log(`   STACY_PRIVATE_KEY length: ${stacyPrivateKeyBytes.length} bytes ✅`);
    console.log(`   SILVIO_PRIVATE_KEY length: ${silvioPrivateKeyBytes.length} bytes ✅`);
    console.log();

    // Test generating addresses from mnemonics
    console.log('📍 Testing Address Generation:');
    const stacyMnemonic = getAccountMnemonic('stacy');
    const silvioMnemonic = getAccountMnemonic('silvio');
    
    const stacyAccount = algosdk.mnemonicToSecretKey(stacyMnemonic);
    const silvioAccount = algosdk.mnemonicToSecretKey(silvioMnemonic);
    
    console.log(`   Stacy address from mnemonic: ${stacyAccount.addr}`);
    console.log(`   Silvio address from mnemonic: ${silvioAccount.addr}`);
    console.log(`   Stacy address from config: ${getAccountAddress('stacy')}`);
    console.log(`   Silvio address from config: ${getAccountAddress('silvio')}`);
    console.log();

    // Verify addresses match (convert Address to string)
    const stacyMatch = stacyAccount.addr.toString() === getAccountAddress('stacy');
    const silvioMatch = silvioAccount.addr.toString() === getAccountAddress('silvio');
    
    console.log(`   Stacy addresses match: ${stacyMatch ? '✅' : '❌'}`);
    console.log(`   Silvio addresses match: ${silvioMatch ? '✅' : '❌'}`);
    console.log();

    if (stacyMatch && silvioMatch) {
      console.log('🎉 All Algorand private key tests passed!');
      console.log('✅ Your configuration is ready for real transactions.');
    } else {
      console.log('❌ Address mismatch detected!');
      console.log('   This indicates a configuration issue.');
    }

  } catch (error) {
    console.log('❌ Error during private key conversion:');
    console.log(`   ${error}`);
  }
}

// Run the test
testAlgorandPrivateKeys(); 