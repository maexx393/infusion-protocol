import {
  NETWORK,
  RPC_URLS,
  CHAIN_IDS,
  BLOCK_EXPLORERS,
  ALICE_PRIVATE_KEY,
  CAROL_PRIVATE_KEY,
  DEV_PORTAL_API_TOKEN,
  getAliceAddress,
  getCarolAddress,
  getRpcUrl,
  getChainId,
  getBlockExplorerUrl,
  hasValidAlicePrivateKey,
  hasValidCarolPrivateKey,
  hasValidPrivateKeys,
  hasValidApiToken
} from './variables';

console.log('🔧 Environment Variables Check');
console.log('==============================');
console.log('');

console.log('🌐 Network Configuration:');
console.log('NETWORK:', NETWORK);
console.log('RPC_URLS.POLYGON_AMOY:', RPC_URLS.POLYGON_AMOY);
console.log('RPC_URLS.ETH_MAINNET:', RPC_URLS.ETH_MAINNET);
console.log('CHAIN_IDS.POLYGON_AMOY:', CHAIN_IDS.POLYGON_AMOY);
console.log('CHAIN_IDS.ETH_MAINNET:', CHAIN_IDS.ETH_MAINNET);
console.log('BLOCK_EXPLORERS.POLYGON_AMOY:', BLOCK_EXPLORERS.POLYGON_AMOY);
console.log('BLOCK_EXPLORERS.ETH_MAINNET:', BLOCK_EXPLORERS.ETH_MAINNET);
console.log('');

console.log('🔑 Private Keys:');
console.log('ALICE_PRIVATE_KEY:', ALICE_PRIVATE_KEY ? '✅ Set' : '❌ Not set');
console.log('CAROL_PRIVATE_KEY:', CAROL_PRIVATE_KEY ? '✅ Set' : '❌ Not set');
console.log('DEV_PORTAL_API_TOKEN:', DEV_PORTAL_API_TOKEN ? '✅ Set' : '❌ Not set');
console.log('');

console.log('👤 Wallet Addresses:');
try {
  console.log('Alice Address:', getAliceAddress());
} catch (error: any) {
  console.log('Alice Address: ❌ Error -', error.message);
}

try {
  console.log('Carol Address:', getCarolAddress());
} catch (error: any) {
  console.log('Carol Address: ❌ Error -', error.message);
}
console.log('');

console.log('🔧 Helper Functions:');
console.log('getRpcUrl():', getRpcUrl());
console.log('getChainId():', getChainId());
console.log('getBlockExplorerUrl():', getBlockExplorerUrl());
console.log('');

console.log('✅ Validation Results:');
console.log('hasValidAlicePrivateKey():', hasValidAlicePrivateKey());
console.log('hasValidCarolPrivateKey():', hasValidCarolPrivateKey());
console.log('hasValidPrivateKeys():', hasValidPrivateKeys());
console.log('hasValidApiToken():', hasValidApiToken());
console.log('');

console.log('🎯 Configuration Status:');
if (hasValidPrivateKeys() && hasValidApiToken()) {
  console.log('✅ All required variables are set correctly!');
} else {
  console.log('❌ Some required variables are missing or invalid.');
  console.log('   Please check your .env file and ensure all variables are set.');
}
