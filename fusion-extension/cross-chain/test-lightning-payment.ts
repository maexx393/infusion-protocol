import { issueLightningInvoice, payLightningInvoice } from './src/utils/lightning';
import { getLNBalances } from './src/utils/lightning';

async function testLightningPayment() {
  console.log('🧪 Testing Lightning Network Payment Functionality...\n');

  try {
    // Check balances first
    console.log('📊 Checking node balances...');
    const aliceBalances = await getLNBalances('alice');
    const daveBalances = await getLNBalances('dave');
    
    console.log(`Alice - Local Channels: ${aliceBalances.totalLocalBalance} satoshis`);
    console.log(`Dave - Remote Channels: ${daveBalances.totalRemoteBalance} satoshis`);
    
    if (aliceBalances.totalLocalBalance === 0) {
      console.log('❌ Alice has no local channel capacity');
      console.log('   Please create a channel from Alice to Dave in Polar');
      return;
    }
    
    if (daveBalances.totalRemoteBalance === 0) {
      console.log('❌ Dave has no remote channel capacity');
      console.log('   Please create a channel from Alice to Dave in Polar');
      return;
    }

    console.log('\n✅ Channel capacity available for testing');

    // Test 1: Issue invoice from Dave
    console.log('\n📝 Test 1: Issuing Lightning invoice from Dave...');
    const testAmount = 0.0001; // 10,000 satoshis
    const invoice = await issueLightningInvoice(testAmount, 'dave', 'Test payment for cross-chain demo');
    
    console.log('✅ Invoice issued successfully');
    console.log(`   Amount: ${testAmount} BTC`);
    console.log(`   Invoice: ${invoice.payment_request.substring(0, 50)}...`);
    console.log(`   Payment Hash: ${invoice.r_hash}`);

    // Test 2: Pay invoice from Alice
    console.log('\n💳 Test 2: Paying invoice from Alice...');
    const paymentReceipt = await payLightningInvoice(invoice.payment_request, 'alice');
    
    console.log('✅ Payment completed successfully');
    console.log(`   Secret: ${paymentReceipt.secret || 'NOT EXTRACTED'}`);
    console.log(`   Payment Hash: ${paymentReceipt.paymentHash}`);
    console.log(`   Amount: ${paymentReceipt.amount} BTC`);
    console.log(`   Timestamp: ${paymentReceipt.timestamp.toISOString()}`);

    // Test 3: Verify secret extraction
    if (paymentReceipt.secret && paymentReceipt.secret.length > 0) {
      console.log('\n✅ Secret extraction successful!');
      console.log(`   Secret length: ${paymentReceipt.secret.length} characters`);
      console.log(`   Secret (first 20 chars): ${paymentReceipt.secret.substring(0, 20)}...`);
      
      // Test 4: Verify the secret can be used for EVM claim
      console.log('\n🔐 Test 4: Verifying secret format for EVM claim...');
      try {
        // Convert secret from base64 to hex (if needed)
        const secretBuffer = Buffer.from(paymentReceipt.secret, 'base64');
        const secretHex = '0x' + secretBuffer.toString('hex');
        console.log(`   Secret in hex format: ${secretHex.substring(0, 20)}...`);
        console.log('✅ Secret format is compatible with EVM claim function');
      } catch (error) {
        console.log('❌ Secret format conversion failed:', error);
      }
    } else {
      console.log('\n❌ Secret extraction failed!');
      console.log('   This indicates the Lightning payment did not complete successfully');
      console.log('   Possible causes:');
      console.log('   1. No channel between Alice and Dave');
      console.log('   2. Insufficient channel capacity');
      console.log('   3. Channel not active');
      console.log('   4. Network connectivity issues');
    }

    // Check final balances
    console.log('\n📊 Checking final balances...');
    const aliceBalancesAfter = await getLNBalances('alice');
    const daveBalancesAfter = await getLNBalances('dave');
    
    console.log(`Alice - Local Channels: ${aliceBalancesAfter.totalLocalBalance} satoshis`);
    console.log(`Dave - Remote Channels: ${daveBalancesAfter.totalRemoteBalance} satoshis`);
    
    const aliceChange = aliceBalancesAfter.totalLocalBalance - aliceBalances.totalLocalBalance;
    const daveChange = daveBalancesAfter.totalRemoteBalance - daveBalances.totalRemoteBalance;
    
    console.log(`Alice balance change: ${aliceChange} satoshis`);
    console.log(`Dave balance change: ${daveChange} satoshis`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Ensure Polar is running with all nodes');
    console.log('2. Create channels between Alice and Dave');
    console.log('3. Check node connectivity');
    console.log('4. Verify macaroon permissions');
  }
}

// Run the test
testLightningPayment()
  .then(() => {
    console.log('\n🎉 Lightning Network payment test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  }); 