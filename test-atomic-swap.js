#!/usr/bin/env node

const fetch = require('node-fetch');

async function testAtomicSwapAPI() {
  console.log('🧪 Testing Atomic Swap API Integration...\n');

  const testPayload = {
    fromChain: 'polygon-amoy',
    toChain: 'algorand-testnet',
    fromToken: 'POL',
    toToken: 'ALGO',
    fromAmount: '0.01',
    userAddress: '0x1234567890123456789012345678901234567890',
    slippageTolerance: 0.5,
    strategy: 'atomic'
  };

  try {
    console.log('📤 Sending request to /api/cross-chain/production-execute...');
    console.log('Request payload:', JSON.stringify(testPayload, null, 2));

    const response = await fetch('http://localhost:3000/api/cross-chain/production-execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.log('❌ API Response Error:');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(responseData, null, 2));
      return;
    }

    console.log('\n✅ API Response Successful!');
    console.log('📊 Atomic Swap Result:');
    console.log('─'.repeat(50));
    console.log(`🆔 Swap ID: ${responseData.swapId}`);
    console.log(`🔄 Swap Type: ${responseData.swapType}`);
    console.log(`✅ Success: ${responseData.success}`);
    console.log(`🔐 Secret: ${responseData.secret?.substring(0, 20)}...`);
    console.log(`🔗 Hashlock: ${responseData.hashlock}`);

    if (responseData.steps) {
      console.log('\n📝 Atomic Swap Steps:');
      responseData.steps.forEach((step, index) => {
        const statusIcon = step.status === 'completed' ? '✅' : 
                          step.status === 'processing' ? '⏳' : 
                          step.status === 'failed' ? '❌' : '⏸️';
        console.log(`  ${index + 1}. ${statusIcon} ${step.description}`);
        if (step.txHash) {
          console.log(`     📋 TX: ${step.txHash}`);
        }
        if (step.explorerUrl) {
          console.log(`     🔗 Explorer: ${step.explorerUrl}`);
        }
      });
    }

    if (responseData.transactions) {
      console.log('\n🔗 Transaction Hashes:');
      console.log(`  Source Deposit: ${responseData.transactions.sourceDeposit || 'N/A'}`);
      console.log(`  Destination Deposit: ${responseData.transactions.destinationDeposit || 'N/A'}`);
      console.log(`  Source Claim: ${responseData.transactions.sourceClaim || 'N/A'}`);
      console.log(`  Destination Claim: ${responseData.transactions.destinationClaim || 'N/A'}`);
    }

    console.log('\n🎉 Atomic Swap Integration Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    console.error('Make sure the development server is running: npm run dev');
  }
}

// Run the test
testAtomicSwapAPI().then(() => {
  console.log('\n🏁 Test execution finished.');
}).catch(error => {
  console.error('💥 Unexpected error:', error);
}); 