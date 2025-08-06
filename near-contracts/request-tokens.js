#!/usr/bin/env node

const https = require('https');

// Configuration
const ACCOUNT_ID = 'defiunite.testnet';
const FAUCET_URL = 'https://helper.testnet.near.org/account';

async function requestTokens() {
  console.log('🪙 Requesting NEAR tokens from faucet...');
  console.log(`Account: ${ACCOUNT_ID}`);
  console.log(`Faucet URL: ${FAUCET_URL}`);
  console.log('');
  console.log('📋 Manual Steps:');
  console.log('1. Visit the NEAR testnet faucet:');
  console.log(`   ${FAUCET_URL}`);
  console.log('');
  console.log('2. Enter your account ID:');
  console.log(`   ${ACCOUNT_ID}`);
  console.log('');
  console.log('3. Click "Send" to receive testnet NEAR tokens');
  console.log('');
  console.log('4. Wait for the transaction to complete');
  console.log('');
  console.log('5. Check your balance with:');
  console.log(`   near state ${ACCOUNT_ID}`);
  console.log('');
  console.log('💡 Alternative: You can also use the NEAR CLI to send tokens from another account if you have one.');
}

requestTokens().catch(console.error); 