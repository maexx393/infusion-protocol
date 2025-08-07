import { ethers } from 'ethers';
import { getRpcUrl, getEscrowContractAddress } from './src/variables';

// Escrow contract ABI - simplified version for deposit function
const ESCROW_ABI = [
  "function deposit(address claimer, uint256 expirationTime, bytes32 hashlock) external payable",
  "function claim(bytes32 depositId, bytes memory secret) external",
  "function getDeposit(bytes32 depositId) external view returns (address depositor, address claimer, uint256 amount, uint256 expirationTime, bytes32 hashlock, bool claimed, bool cancelled)",
  "function isExpired(bytes32 depositId) external view returns (bool)",
  "function getBalance() external view returns (uint256)",
  "event DepositCreated(bytes32 indexed depositId, address indexed depositor, address indexed claimer, uint256 amount, uint256 expirationTime, bytes32 hashlock)",
  "event DepositClaimed(bytes32 indexed depositId, address indexed claimer, bytes secret)"
];

async function debugEscrow() {
  console.log('🔍 Debugging Escrow Contract...\n');

  try {
    // Setup provider
    const provider = new ethers.JsonRpcProvider(getRpcUrl());
    const escrowAddress = getEscrowContractAddress();
    
    console.log(`📋 Contract Details:`);
    console.log(`   Address: ${escrowAddress}`);
    console.log(`   Network: ${getRpcUrl()}`);
    
    // Check if contract exists
    const code = await provider.getCode(escrowAddress);
    if (code === '0x') {
      console.log('❌ No contract deployed at this address');
      return;
    }
    console.log('✅ Contract deployed at address');
    
    // Create contract instance
    const escrowContract = new ethers.Contract(escrowAddress, ESCROW_ABI, provider);
    
    // Check contract balance
    const contractBalance = await escrowContract.getBalance();
    console.log(`💰 Contract Balance: ${ethers.formatEther(contractBalance)} ETH`);
    
    // Test the deposit ID from the last transaction
    const testHashlock = '0x48700bb225e606df3b3eb3f88b75140224d43955f14a9badd5e671a51254df4f';
    console.log(`\n🔍 Testing deposit ID: ${testHashlock}`);
    
    // Convert to bytes32
    const hashlockBytes32 = ethers.getBytes(testHashlock);
    console.log(`   Bytes32: ${hashlockBytes32}`);
    
    // Try to get deposit info
    try {
      console.log('\n📞 Calling getDeposit...');
      const result = await escrowContract.getDeposit(hashlockBytes32);
      console.log('✅ getDeposit call successful');
      console.log('   Raw result:', result);
      
      if (result && result.length >= 7) {
        const [depositor, claimer, amount, expirationTime, hashlock, claimed, cancelled] = result;
        console.log('\n📋 Deposit Details:');
        console.log(`   Depositor: ${depositor}`);
        console.log(`   Claimer: ${claimer}`);
        console.log(`   Amount: ${ethers.formatEther(amount)} ETH`);
        console.log(`   Expiration: ${new Date(Number(expirationTime) * 1000).toISOString()}`);
        console.log(`   Hashlock: ${hashlock}`);
        console.log(`   Claimed: ${claimed}`);
        console.log(`   Cancelled: ${cancelled}`);
        
        // Check if expired
        const isExpired = await escrowContract.isExpired(hashlockBytes32);
        console.log(`   Expired: ${isExpired}`);
      }
    } catch (error) {
      console.error('❌ getDeposit call failed:', error);
    }
    
    // Check recent events
    console.log('\n📋 Checking recent events...');
    try {
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = currentBlock - 100; // Last 100 blocks
      
      const depositEvents = await escrowContract.queryFilter(
        escrowContract.filters.DepositCreated(),
        fromBlock,
        currentBlock
      );
      
      console.log(`📊 Found ${depositEvents.length} deposit events in last 100 blocks`);
      
      depositEvents.forEach((event, index) => {
        console.log(`\n   Event ${index + 1}:`);
        console.log(`   Deposit ID: ${(event as any).args?.depositId}`);
        console.log(`   Depositor: ${(event as any).args?.depositor}`);
        console.log(`   Claimer: ${(event as any).args?.claimer}`);
        console.log(`   Amount: ${ethers.formatEther((event as any).args?.amount || 0)} ETH`);
        console.log(`   Block: ${event.blockNumber}`);
      });
    } catch (error) {
      console.error('❌ Error checking events:', error);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugEscrow()
  .then(() => {
    console.log('\n🎉 Debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Debug failed:', error);
    process.exit(1);
  }); 