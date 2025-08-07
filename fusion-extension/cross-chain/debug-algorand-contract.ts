/**
 * Debug script to test Algorand contract calls
 */

import { RealAlgorandClient, AlgorandContract } from './src/utils/algorand';
import { getAccountAddress } from './src/config/algorand-addresses';
import { STACY_PRIVATE_KEY } from './src/variables';

function hexToUint8Array(hex: string): Uint8Array {
  if (!hex || hex.length < 2 || hex.substring(0, 2) !== '0x') {
    throw new Error('Invalid hex string format. Must start with 0x');
  }
  return new Uint8Array(Buffer.from(hex.slice(2), 'hex'));
}

async function debugAlgorandContract() {
  console.log('🔍 Debugging Algorand Contract Call');
  console.log('===================================');
  
  try {
    const algodClient = new RealAlgorandClient();
    const escrowContract = new AlgorandContract(743876974, algodClient);
    
    const depositorAddress = getAccountAddress('stacy');
    const claimerAddress = getAccountAddress('silvio');
    const depositorPrivateKey = hexToUint8Array(STACY_PRIVATE_KEY);
    
    console.log('📋 Contract Details:');
    console.log(`   App ID: 743876974`);
    console.log(`   Depositor: ${depositorAddress}`);
    console.log(`   Claimer: ${claimerAddress}`);
    console.log(`   Private Key Length: ${depositorPrivateKey.length} bytes`);
    
    // Test with minimal arguments
    const testArgs = [
      "test_order_123", // order_id
      claimerAddress,   // claimer_address
      "test_hashlock",  // hashlock
      "1735680000"      // timelock (future timestamp)
    ];
    
    console.log('\n📤 Testing contract call with arguments:');
    console.log(`   Args count: ${testArgs.length}`);
    testArgs.forEach((arg, index) => {
      console.log(`   Arg ${index}: ${arg} (length: ${arg.length})`);
    });
    
    console.log('\n🚀 Attempting contract call...');
    
    // Test with get_order_info method (expects 1 argument)
    const txId = await algodClient.callApp(
      743876974,
      depositorAddress,
      depositorPrivateKey,
      [
        new Uint8Array(Buffer.from("get_order_info")),
        new Uint8Array(Buffer.from("test_order_123"))
      ]
    );
    
    console.log(`✅ Contract call successful!`);
    console.log(`   Transaction ID: ${txId}`);
    
  } catch (error: any) {
    console.error('❌ Contract call failed:');
    console.error(`   Error: ${error}`);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Body: ${error.response.text}`);
    }
  }
}

// Run the debug
debugAlgorandContract(); 