/**
 * Utility script to convert Algorand mnemonics to private keys
 * Run this script to get the private keys for your .env file
 */

import algosdk from 'algosdk';
import { getAccountMnemonic } from './src/config/algorand-addresses';

function mnemonicToPrivateKey(mnemonic: string): string {
  const account = algosdk.mnemonicToSecretKey(mnemonic);
  return '0x' + Buffer.from(account.sk).toString('hex');
}

function main() {
  console.log('🔑 Converting Algorand Mnemonics to Private Keys');
  console.log('================================================');
  console.log();

  try {
    // Get mnemonics from the config
    const stacyMnemonic = getAccountMnemonic('stacy');
    const silvioMnemonic = getAccountMnemonic('silvio');
    const resolverMnemonic = getAccountMnemonic('resolver');

    // Convert to private keys
    const stacyPrivateKey = mnemonicToPrivateKey(stacyMnemonic);
    const silvioPrivateKey = mnemonicToPrivateKey(silvioMnemonic);
    const resolverPrivateKey = mnemonicToPrivateKey(resolverMnemonic);

    console.log('✅ Successfully converted mnemonics to private keys!');
    console.log();

    console.log('📋 Add these to your .env file:');
    console.log('================================');
    console.log();

    // EVM private keys (unchanged)
    console.log('# EVM private keys (unchanged)');
    console.log('ALICE_PRIVATE_KEY=0x1234567890123456789012345678901234567890123456789012345678901234');
    console.log('CAROL_PRIVATE_KEY=0x1234567890123456789012345678901234567890123456789012345678901234');
    console.log();

    // Algorand private keys (new)
    console.log('# Algorand private keys (new)');
    console.log(`STACY_PRIVATE_KEY=${stacyPrivateKey}`);
    console.log(`SILVIO_PRIVATE_KEY=${silvioPrivateKey}`);
    console.log();

    console.log('📝 Note: The resolver private key is:');
    console.log(`RESOLVER_PRIVATE_KEY=${resolverPrivateKey}`);
    console.log();

    console.log('🔧 Next steps:');
    console.log('1. Copy the STACY_PRIVATE_KEY and SILVIO_PRIVATE_KEY values above');
    console.log('2. Paste them into your .env file');
    console.log('3. Replace the placeholder EVM private keys with your real ones');
    console.log('4. Test the configuration with: npx ts-node test-algorand-only.ts');

  } catch (error) {
    console.error('❌ Error converting mnemonics:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
} 