import { getLNBalances } from './src/utils/lightning';
import { getAliceAddress, getCarolAddress } from './src/variables';
import { ethers } from 'ethers';

async function checkAllBalances() {
  console.log('💰 Checking All Wallet Balances...\n');

  // Check Lightning Network balances
  console.log('⚡ Lightning Network Balances:');
  console.log('================================');
  
  try {
    const aliceBalances = await getLNBalances('alice');
    console.log(`📊 Alice Node:`);
    console.log(`   On-chain: ${aliceBalances.onchainBalance} satoshis`);
    console.log(`   Local Channels: ${aliceBalances.totalLocalBalance} satoshis`);
    console.log(`   Remote Channels: ${aliceBalances.totalRemoteBalance} satoshis`);
    console.log(`   Total: ${aliceBalances.onchainBalance + aliceBalances.totalLocalBalance} satoshis`);
  } catch (error) {
    console.log(`❌ Alice Node: Error - ${error}`);
  }

  try {
    const carolBalances = await getLNBalances('carol');
    console.log(`📊 Carol Node:`);
    console.log(`   On-chain: ${carolBalances.onchainBalance} satoshis`);
    console.log(`   Local Channels: ${carolBalances.totalLocalBalance} satoshis`);
    console.log(`   Remote Channels: ${carolBalances.totalRemoteBalance} satoshis`);
    console.log(`   Total: ${carolBalances.onchainBalance + carolBalances.totalLocalBalance} satoshis`);
  } catch (error) {
    console.log(`❌ Carol Node: Error - ${error}`);
  }

  try {
    const daveBalances = await getLNBalances('dave');
    console.log(`📊 Dave Node:`);
    console.log(`   On-chain: ${daveBalances.onchainBalance} satoshis`);
    console.log(`   Local Channels: ${daveBalances.totalLocalBalance} satoshis`);
    console.log(`   Remote Channels: ${daveBalances.totalRemoteBalance} satoshis`);
    console.log(`   Total: ${daveBalances.onchainBalance + daveBalances.totalLocalBalance} satoshis`);
  } catch (error) {
    console.log(`❌ Dave Node: Error - ${error}`);
  }

  console.log('\n🔗 EVM Wallet Balances:');
  console.log('=======================');
  
  const aliceAddress = getAliceAddress();
  const carolAddress = getCarolAddress(); // Using Carol's key for Carol
  
  console.log(`📊 Alice Address: ${aliceAddress}`);
  console.log(`📊 Carol Address: ${carolAddress}`);
  
  // Check EVM balances
  try {
    const provider = new ethers.JsonRpcProvider('https://polygon-amoy.g.alchemy.com/v2/E-LLa6qeTOzgnGgIhe8q3');
    
    const aliceBalance = await provider.getBalance(aliceAddress);
    const carolBalance = await provider.getBalance(carolAddress);
    
    console.log(`💰 Alice POL Balance: ${ethers.formatEther(aliceBalance)} POL`);
    console.log(`💰 Carol POL Balance: ${ethers.formatEther(carolBalance)} POL`);
  } catch (error) {
    console.log(`❌ EVM Balance Check Error: ${error}`);
  }

  console.log('\n🎯 Funding Recommendations:');
  console.log('===========================');
  console.log('⚡ Lightning Network:');
  console.log('   - Fund Alice with at least 0.001 BTC (100,000 satoshis)');
  console.log('   - Fund Carol with at least 0.001 BTC (100,000 satoshis)');
  console.log('   - Fund Dave with at least 0.001 BTC (100,000 satoshis)');
  console.log('   - Create channels between nodes for Lightning Network functionality');
  console.log('');
  console.log('🔗 EVM Network (Polygon Amoy):');
  console.log('   - Fund Alice address with at least 0.02 POL for gas fees');
  console.log('   - Fund Carol address with at least 0.02 POL for gas fees');
  console.log('');
  console.log('💡 You can get test funds from:');
  console.log('   - Polygon Amoy Faucet: https://faucet.polygon.technology/ (select Amoy)');
  console.log('   - Bitcoin Regtest: Use Polar\'s built-in faucet');
}

checkAllBalances()
  .then(() => {
    console.log('\n✅ Balance check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }); 