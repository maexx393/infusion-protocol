#!/usr/bin/env node

/**
 * Algorand Account Creation Script
 * Creates testnet accounts for cross-chain swap testing
 */

const algosdk = require('algosdk');
const fs = require('fs');
const path = require('path');

// Account names and descriptions
const ACCOUNTS = [
  { name: 'deployer', description: 'Account used for deploying contracts' },
  { name: 'alice', description: 'Alice account for testing swaps' },
  { name: 'carol', description: 'Carol account for testing swaps' },
  { name: 'resolver', description: 'Resolver account for cross-chain operations' }
];

function generateAccount(name, description) {
  const account = algosdk.generateAccount();
  const mnemonic = algosdk.secretKeyToMnemonic(account.sk);
  
  return {
    name,
    description,
    address: account.addr.toString(),
    privateKey: Buffer.from(account.sk).toString('base64'),
    publicKey: account.addr.toString(), // Use address as public key for display
    mnemonic
  };
}

function printAccountInfo(account) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔑 ${account.name.toUpperCase()} ACCOUNT`);
  console.log(`📝 ${account.description}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📍 Address: ${account.address}`);
  console.log(`🔐 Private Key: ${account.privateKey}`);
  console.log(`🔑 Public Key: ${account.publicKey}`);
  console.log(`📜 Mnemonic: ${account.mnemonic}`);
  console.log(`${'='.repeat(60)}`);
}

function saveAccountsToFile(accounts) {
  const outputPath = path.join(__dirname, '..', 'generated-accounts.json');
  const configPath = path.join(__dirname, '..', 'config', 'real-addresses.ts');
  
  // Create config directory if it doesn't exist
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  // Save full account details
  fs.writeFileSync(outputPath, JSON.stringify(accounts, null, 2));
  console.log(`\n💾 Full account details saved to: ${outputPath}`);
  
  // Generate TypeScript configuration
  const tsConfig = `// Auto-generated Algorand addresses configuration
// Generated on: ${new Date().toISOString()}
// WARNING: Keep this file secure and never commit to version control

export const ALGORAND_REAL_ADDRESSES = {
${accounts.map(acc => `  ${acc.name}: {
    address: '${acc.address}',
    mnemonic: '${acc.mnemonic}'
  }`).join(',\n')}
};

// Contract addresses (will be populated after deployment)
export const ALGORAND_CONTRACT_ADDRESSES = {
  escrow: 'REPLACE_WITH_ESCROW_CONTRACT_ID',
  solver: 'REPLACE_WITH_SOLVER_CONTRACT_ID', 
  pool: 'REPLACE_WITH_POOL_CONTRACT_ID'
};

// Network configuration
export const ALGORAND_NETWORK_CONFIG = {
  testnet: {
    algodUrl: 'https://testnet-api.algonode.cloud',
    indexerUrl: 'https://testnet-idx.algonode.cloud',
    explorerUrl: 'https://lora.algokit.io/testnet',
    dispenserUrl: 'https://bank.testnet.algorand.network/'
  },
  mainnet: {
    algodUrl: 'https://mainnet-api.algonode.cloud',
    indexerUrl: 'https://mainnet-idx.algonode.cloud',
    explorerUrl: 'https://algoexplorer.io',
    dispenserUrl: null
  }
};

// Utility functions
export function validateAlgorandAddress(address: string): boolean {
  return address.length === 58 && /^[A-Z2-7]+$/.test(address);
}

export function getAccountAddress(accountName: keyof typeof ALGORAND_REAL_ADDRESSES): string {
  const account = ALGORAND_REAL_ADDRESSES[accountName];
  if (!account) {
    throw new Error(\`Account \${accountName} not found in configuration\`);
  }
  return account.address;
}

export function getAccountMnemonic(accountName: keyof typeof ALGORAND_REAL_ADDRESSES): string {
  const account = ALGORAND_REAL_ADDRESSES[accountName];
  if (!account) {
    throw new Error(\`Account \${accountName} not found in configuration\`);
  }
  return account.mnemonic;
}
`;
  
  fs.writeFileSync(configPath, tsConfig);
  console.log(`💾 TypeScript config saved to: ${configPath}`);
}

function printFundingInstructions(accounts) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('💰 FUNDING INSTRUCTIONS');
  console.log(`${'='.repeat(60)}`);
  console.log('1. Copy the addresses below');
  console.log('2. Visit: https://bank.testnet.algorand.network/');
  console.log('3. Fund each account with testnet ALGO');
  console.log('4. Recommended amounts:');
  console.log('   - Deployer: 10 ALGO (for contract deployment)');
  console.log('   - Alice: 5 ALGO (for testing)');
  console.log('   - Carol: 5 ALGO (for testing)');
  console.log('   - Resolver: 10 ALGO (for cross-chain operations)');
  console.log('\n📋 Addresses to fund:');
  
  accounts.forEach(account => {
    console.log(`   ${account.name}: ${account.address}`);
  });
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('⚠️  SECURITY WARNING');
  console.log(`${'='.repeat(60)}`);
  console.log('• Keep private keys and mnemonics secure');
  console.log('• Never commit them to version control');
  console.log('• Use environment variables in production');
  console.log('• This is for TESTNET only');
  console.log(`${'='.repeat(60)}`);
}

function main() {
  console.log('🚀 Creating Algorand Testnet Accounts...\n');
  
  try {
    // Generate all accounts
    const accounts = ACCOUNTS.map(acc => generateAccount(acc.name, acc.description));
    
    // Print account information
    accounts.forEach(printAccountInfo);
    
    // Save to files
    saveAccountsToFile(accounts);
    
    // Print funding instructions
    printFundingInstructions(accounts);
    
    console.log('\n✅ Account creation completed successfully!');
    console.log('📁 Check the generated files for account details');
    console.log('🔗 Next step: Fund the accounts at the testnet dispenser');
  } catch (error) {
    console.error('❌ Error in main function:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ Error creating accounts:', error.message);
    process.exit(1);
  }
}

module.exports = { generateAccount, ACCOUNTS }; 