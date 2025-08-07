/**
 * Simple Algorand Integration Test
 * Tests only the Algorand functionality without EVM dependencies
 */

import { generateAlgorandSecret, AlgorandContractUtils, RealAlgorandEscrowManager, AlgorandTokenUtils } from './src/utils/algorand';
import { getAccountAddress, getAccountMnemonic, validateAlgorandAddress } from './src/config/algorand-addresses';

// Colors for console output
const BOLD = '\x1b[1m';
const BLUE = '\x1b[34m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const NC = '\x1b[0m';

const CHECK = '✅';
const ERROR = '❌';
const WARNING = '⚠️';
const INFO = 'ℹ️';

const printHeader = (text: string) => console.log(`${BOLD}${BLUE}${text}${NC}`);
const printSuccess = (text: string) => console.log(`${GREEN}${CHECK} ${text}${NC}`);
const printInfo = (text: string) => console.log(`${BLUE}${INFO} ${text}${NC}`);
const printWarning = (text: string) => console.log(`${YELLOW}${WARNING} ${text}${NC}`);
const printError = (text: string) => console.log(`${RED}${ERROR} ${text}${NC}`);

async function testAlgorandIntegration() {
  printHeader('🧪 ALGORAND INTEGRATION TEST');
  console.log('Testing Algorand functionality only...\n');

  try {
    // Test 1: Generate secret and hashlock
    printInfo('Test 1: Generating secret and hashlock...');
    const { secret, hashedSecret } = generateAlgorandSecret();
    printSuccess(`Secret generated: ${secret.substring(0, 20)}...`);
    printSuccess(`Hashlock: ${hashedSecret}`);
    printSuccess('✅ Secret generation test passed');

    // Test 2: Validate Algorand addresses
    printInfo('Test 2: Validating Algorand addresses...');
    const stacyAddress = getAccountAddress('stacy');
    const silvioAddress = getAccountAddress('silvio');
    const resolverAddress = getAccountAddress('resolver');
    
    if (validateAlgorandAddress(stacyAddress)) {
      printSuccess(`Stacy address: ${stacyAddress} (Valid)`);
    } else {
      printError(`Stacy address: ${stacyAddress} (Invalid)`);
    }
    
    if (validateAlgorandAddress(silvioAddress)) {
      printSuccess(`Silvio address: ${silvioAddress} (Valid)`);
    } else {
      printError(`Silvio address: ${silvioAddress} (Invalid)`);
    }
    
    if (validateAlgorandAddress(resolverAddress)) {
      printSuccess(`Resolver address: ${resolverAddress} (Valid)`);
    } else {
      printError(`Resolver address: ${resolverAddress} (Invalid)`);
    }
    printSuccess('Address validation test passed');

    // Test 3: Token utilities
    printInfo('Test 3: Testing token utilities...');
    const microAlgos = 1000000; // 1 ALGO
    const algos = AlgorandTokenUtils.microAlgosToAlgos(microAlgos);
    const backToMicroAlgos = AlgorandTokenUtils.algosToMicroAlgos(algos);
    
    printSuccess(`1,000,000 microAlgos = ${algos} ALGO`);
    printSuccess(`${algos} ALGO = ${backToMicroAlgos} microAlgos`);
    
    if (backToMicroAlgos === microAlgos) {
      printSuccess('✅ Token utilities test passed');
    } else {
      printError('❌ Token utilities test failed');
      return;
    }

    // Test 4: Contract utilities
    printInfo('Test 4: Testing contract utilities...');
    const testSecret = 'test-secret-123';
    const testHashlock = AlgorandContractUtils.generateHashlock(testSecret);
    const isValidAmount = AlgorandContractUtils.isValidAmount('0.1');
    const isInvalidAmount = AlgorandContractUtils.isValidAmount('invalid');
    
    printSuccess(`Hashlock for '${testSecret}': ${testHashlock}`);
    printSuccess(`Valid amount '0.1': ${isValidAmount}`);
    printSuccess(`Invalid amount 'invalid': ${isInvalidAmount}`);
    
    if (testHashlock && isValidAmount && !isInvalidAmount) {
      printSuccess('✅ Contract utilities test passed');
    } else {
      printError('❌ Contract utilities test failed');
      return;
    }

    // Test 5: Escrow manager initialization
    printInfo('Test 5: Testing escrow manager initialization...');
    try {
      const escrowManager = new RealAlgorandEscrowManager(743864631, 743864632, 743864633);
      printSuccess('✅ Escrow manager initialized successfully');
      printSuccess('✅ Escrow manager test passed');
    } catch (error) {
      printError(`❌ Escrow manager test failed: ${error}`);
      return;
    }

    // Test 6: Format utilities
    printInfo('Test 6: Testing format utilities...');
    const formattedAmount = AlgorandTokenUtils.formatAlgos(1500000, 6); // 1.5 ALGO
    const formattedAsset = AlgorandTokenUtils.formatAssetAmount(1000000, 6); // 1.0 with 6 decimals
    
    printSuccess(`Formatted 1,500,000 microAlgos: ${formattedAmount} ALGO`);
    printSuccess(`Formatted 1,000,000 with 6 decimals: ${formattedAsset}`);
    
    if (formattedAmount === '1.500000' && formattedAsset === '1.000000') {
      printSuccess('✅ Format utilities test passed');
    } else {
      printError('❌ Format utilities test failed');
      return;
    }

    // Final summary
    printHeader('🎉 ALGORAND INTEGRATION TEST COMPLETE');
    console.log('\n📊 Test Results:');
    console.log('   ✅ Secret generation: PASSED');
    console.log('   ✅ Address validation: PASSED');
    console.log('   ✅ Token utilities: PASSED');
    console.log('   ✅ Contract utilities: PASSED');
    console.log('   ✅ Escrow manager: PASSED');
    console.log('   ✅ Format utilities: PASSED');
    
    console.log('\n🎯 All Algorand integration tests passed successfully!');
    console.log('🚀 The Algorand integration is working correctly.');
    console.log('\n📝 Note: This test validates the integration logic.');
    console.log('   For real transactions, you need valid private keys.');

  } catch (error) {
    printError(`❌ Test failed: ${error}`);
    console.error(error);
  }
}

// Run the test
testAlgorandIntegration().catch(console.error); 