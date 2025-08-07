#!/usr/bin/env node

const algosdk = require('algosdk');

// Algorand testnet configuration
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const ALGOD_PORT = 443;
const ALGOD_TOKEN = '';

// Generated accounts from our script
const ACCOUNTS = {
  deployer: {
    address: '6XUCBPC3ERAJN63K67JVRC2ZVJV6HTXSI24HJWANPM5WOGB3PDEJJJIWIU',
    name: 'Deployer'
  },
  alice: {
    address: 'UGIZF2BAMX24PRVQEU2DW4UDG6P5R7UKTFHSE5J75Q6XESHP4WQIBGH6QU',
    name: 'Alice'
  },
  carol: {
    address: '4VZTY6CVXP2GGTICCNU5E4AMQRKNVDHHDGAIKWPKACNM2RTSEM64OXIK4Y',
    name: 'Carol'
  },
  resolver: {
    address: '5KUWYUYVK64M6EW6LYBKO53WP7T4XMON5JJE7UUDUTAKBUAXDOQPURVCY4',
    name: 'Resolver'
  }
};

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function printColored(text, color = 'reset') {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

function printHeader(text) {
  printColored(`\n${'='.repeat(60)}`, 'bright');
  printColored(`  ${text}`, 'bright');
  printColored(`${'='.repeat(60)}`, 'bright');
}

function printAccountInfo(accountName, accountData, balance) {
  // Convert BigInt to number safely
  const balanceNum = typeof balance === 'bigint' ? Number(balance) : Number(balance);
  const algos = balanceNum / 1000000; // Convert microAlgos to ALGO
  const status = balanceNum > 0 ? 'FUNDED' : 'EMPTY';
  const statusColor = balanceNum > 0 ? 'green' : 'red';
  
  printColored(`\n📋 ${accountData.name} Account:`, 'cyan');
  printColored(`   Address: ${accountData.address}`, 'blue');
  printColored(`   Balance: ${algos.toFixed(6)} ALGO (${balanceNum} microAlgos)`, 'yellow');
  printColored(`   Status: ${status}`, statusColor);
}

async function checkAccountBalance(algodClient, address) {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    // Convert BigInt to number safely
    return typeof accountInfo.amount === 'bigint' ? Number(accountInfo.amount) : Number(accountInfo.amount);
  } catch (error) {
    if (error.message.includes('account does not exist')) {
      return 0; // Account exists but has no balance
    }
    throw error;
  }
}

async function checkAllBalances() {
  printHeader('ALGORAND ACCOUNT BALANCE CHECK');
  
  // Initialize Algorand client
  const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
  
  try {
    // Check network status
    printColored('\n🌐 Checking Algorand testnet connection...', 'blue');
    const status = await algodClient.status().do();
    const lastRound = typeof status['last-round'] === 'bigint' ? Number(status['last-round']) : Number(status['last-round']);
    printColored(`   Network: ${lastRound ? 'Connected' : 'Disconnected'}`, 'green');
    printColored(`   Last Round: ${lastRound}`, 'blue');
    
    let totalBalance = 0;
    let fundedAccounts = 0;
    
    // Check each account
    for (const [key, accountData] of Object.entries(ACCOUNTS)) {
      try {
        const balance = await checkAccountBalance(algodClient, accountData.address);
        printAccountInfo(key, accountData, balance);
        
        totalBalance += balance;
        if (balance > 0) {
          fundedAccounts++;
        }
      } catch (error) {
        printColored(`\n❌ Error checking ${accountData.name} account:`, 'red');
        printColored(`   ${error.message}`, 'red');
      }
    }
    
    // Summary
    printHeader('BALANCE SUMMARY');
    printColored(`\n💰 Total Balance: ${(totalBalance / 1000000).toFixed(6)} ALGO`, 'green');
    printColored(`📊 Funded Accounts: ${fundedAccounts}/${Object.keys(ACCOUNTS).length}`, 'cyan');
    
    if (fundedAccounts === 0) {
      printColored(`\n⚠️  NO ACCOUNTS FUNDED!`, 'red');
      printColored(`   Please fund your accounts at: https://bank.testnet.algorand.network/`, 'yellow');
      printColored(`   Recommended amounts:`, 'yellow');
      printColored(`   - Deployer: 10 ALGO (for contract deployment)`, 'yellow');
      printColored(`   - Alice: 5 ALGO (for testing)`, 'yellow');
      printColored(`   - Carol: 5 ALGO (for testing)`, 'yellow');
      printColored(`   - Resolver: 10 ALGO (for cross-chain operations)`, 'yellow');
    } else if (fundedAccounts < Object.keys(ACCOUNTS).length) {
      printColored(`\n⚠️  SOME ACCOUNTS NEED FUNDING!`, 'yellow');
      printColored(`   Fund remaining accounts at: https://bank.testnet.algorand.network/`, 'yellow');
    } else {
      printColored(`\n✅ ALL ACCOUNTS FUNDED!`, 'green');
      printColored(`   Ready for contract deployment and testing.`, 'green');
    }
    
    // Deployment readiness
    printHeader('DEPLOYMENT READINESS');
    const deployerBalance = await checkAccountBalance(algodClient, ACCOUNTS.deployer.address);
    const deployerAlgos = deployerBalance / 1000000;
    
    if (deployerAlgos >= 1) {
      printColored(`✅ Deployer account has sufficient balance (${deployerAlgos.toFixed(6)} ALGO)`, 'green');
      printColored(`   Ready to deploy contracts.`, 'green');
    } else {
      printColored(`❌ Deployer account needs funding (${deployerAlgos.toFixed(6)} ALGO)`, 'red');
      printColored(`   Need at least 1 ALGO for contract deployment.`, 'red');
    }
    
  } catch (error) {
    printColored(`\n❌ Error connecting to Algorand testnet:`, 'red');
    printColored(`   ${error.message}`, 'red');
    printColored(`\n🔧 Troubleshooting:`, 'yellow');
    printColored(`   1. Check your internet connection`, 'yellow');
    printColored(`   2. Verify Algorand testnet is accessible`, 'yellow');
    printColored(`   3. Try again in a few minutes`, 'yellow');
  }
}

// Run the balance check
checkAllBalances().catch(console.error); 