#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const NETWORK = 'testnet';
const OWNER_ACCOUNT = 'defiunite.testnet';
const ESCROW_CONTRACT = 'escrow.defiunite.testnet';
const SOLVER_CONTRACT = 'solver.defiunite.testnet';
const POOL_CONTRACT = 'pool.defiunite.testnet';
const RPC_URL = 'https://rpc.testnet.near.org';

// Function to make RPC calls
function makeRpcCall(method, params = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      jsonrpc: '2.0',
      id: 'dontcare',
      method: method,
      params: params
    });

    const options = {
      hostname: 'rpc.testnet.near.org',
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Function to check if account exists
async function checkAccount(accountId) {
  try {
    const result = await makeRpcCall('query', {
      request_type: 'view_account',
      account_id: accountId,
      finality: 'optimistic'
    });
    return result.result && !result.error;
  } catch (error) {
    return false;
  }
}

// Function to create subaccount
async function createSubaccount(subaccountId, initialBalance = '10') {
  console.log(`Creating subaccount: ${subaccountId}`);
  
  // Check if account already exists
  const exists = await checkAccount(subaccountId);
  if (exists) {
    console.log(`✅ Subaccount ${subaccountId} already exists`);
    return true;
  }

  // For now, we'll just check the status since we can't create accounts via RPC
  // In a real scenario, you'd need to use the NEAR CLI or wallet
  console.log(`⚠️  Subaccount ${subaccountId} does not exist`);
  console.log(`   To create it, run: near create-account ${subaccountId} --masterAccount ${OWNER_ACCOUNT} --initialBalance ${initialBalance}`);
  return false;
}

// Function to deploy contract
async function deployContract(accountId, wasmPath) {
  console.log(`Deploying contract to: ${accountId}`);
  
  if (!fs.existsSync(wasmPath)) {
    console.log(`❌ WASM file not found: ${wasmPath}`);
    return false;
  }

  console.log(`✅ WASM file found: ${wasmPath}`);
  console.log(`   To deploy, run: near deploy ${accountId} ${wasmPath} --networkId ${NETWORK}`);
  return true;
}

// Main deployment function
async function main() {
  console.log('🚀 Manual NEAR Contract Deployment');
  console.log('==================================');
  console.log(`Network: ${NETWORK}`);
  console.log(`Owner Account: ${OWNER_ACCOUNT}`);
  console.log('');

  // Check owner account
  console.log('📋 Checking owner account...');
  const ownerExists = await checkAccount(OWNER_ACCOUNT);
  if (ownerExists) {
    console.log(`✅ Owner account ${OWNER_ACCOUNT} exists`);
  } else {
    console.log(`❌ Owner account ${OWNER_ACCOUNT} does not exist`);
    return;
  }

  // Check subaccounts
  console.log('\n📋 Checking subaccounts...');
  const subaccounts = [
    { id: ESCROW_CONTRACT, wasm: 'target/near/fusion_escrow/fusion_escrow.wasm' },
    { id: SOLVER_CONTRACT, wasm: 'target/near/fusion_solver/fusion_solver.wasm' },
    { id: POOL_CONTRACT, wasm: 'target/near/fusion_pool/fusion_pool.wasm' }
  ];

  for (const subaccount of subaccounts) {
    await createSubaccount(subaccount.id);
    await deployContract(subaccount.id, subaccount.wasm);
    console.log('');
  }

  // Generate deployment commands
  console.log('🔧 Manual Deployment Commands:');
  console.log('================================');
  console.log('');
  console.log('# Create subaccounts:');
  console.log(`near create-account ${ESCROW_CONTRACT} --masterAccount ${OWNER_ACCOUNT} --initialBalance 10`);
  console.log(`near create-account ${SOLVER_CONTRACT} --masterAccount ${OWNER_ACCOUNT} --initialBalance 10`);
  console.log(`near create-account ${POOL_CONTRACT} --masterAccount ${OWNER_ACCOUNT} --initialBalance 10`);
  console.log('');
  console.log('# Deploy contracts:');
  console.log(`near deploy ${ESCROW_CONTRACT} target/near/fusion_escrow/fusion_escrow.wasm --initFunction new --initArgs '{"owner": "${OWNER_ACCOUNT}"}' --networkId ${NETWORK}`);
  console.log(`near deploy ${SOLVER_CONTRACT} target/near/fusion_solver/fusion_solver.wasm --initFunction new --initArgs '{"owner": "${OWNER_ACCOUNT}", "escrow_contract": "${ESCROW_CONTRACT}"}' --networkId ${NETWORK}`);
  console.log(`near deploy ${POOL_CONTRACT} target/near/fusion_pool/fusion_pool.wasm --initFunction new --initArgs '{"owner": "${OWNER_ACCOUNT}", "solver_contract": "${SOLVER_CONTRACT}"}' --networkId ${NETWORK}`);
  console.log('');
  console.log('# Test contracts:');
  console.log(`near view ${ESCROW_CONTRACT} get_statistics`);
  console.log(`near view ${SOLVER_CONTRACT} get_statistics`);
  console.log(`near view ${POOL_CONTRACT} get_statistics`);
}

// Run the deployment
main().catch(console.error); 