#!/usr/bin/env ts-node

import { ethers } from 'ethers';
import {
  getRpcUrl,
  getEscrowContractAddress,
  getAliceAddress,
  getCarolAddress,
  hasValidPrivateKeys
} from './src/variables';

// Escrow contract ABI - simplified version
const ESCROW_ABI = [
  "function getBalance() external view returns (uint256)",
  "function getDeposit(bytes32 depositId) external view returns (address depositor, address claimer, uint256 amount, uint256 expirationTime, bytes32 hashlock, bool claimed, bool cancelled)"
];

async function testContractInteraction() {
  try {
    console.log('🧪 Testing Contract Interaction...\n');
    
    // Check environment
    if (!hasValidPrivateKeys()) {
      console.log('❌ Private keys not set. Please set ALICE_PRIVATE_KEY and CAROL_PRIVATE_KEY environment variables.');
      return;
    }
    
    console.log('✅ Environment variables validated');
    
    // Setup provider
    const provider = new ethers.JsonRpcProvider(getRpcUrl());
    const escrowAddress = getEscrowContractAddress();
    
    console.log(`🌐 Network: Polygon Amoy`);
    console.log(`🔗 Escrow Contract: ${escrowAddress}`);
    console.log(`👤 Alice Address: ${getAliceAddress()}`);
    console.log(`👤 Carol Address: ${getCarolAddress()}`);
    
    // Check if contract is deployed
    console.log('\n🔍 Checking contract deployment...');
    const contractCode = await provider.getCode(escrowAddress);
    
    if (contractCode === '0x') {
      console.log('❌ Contract not deployed at specified address');
      return;
    }
    
    console.log('✅ Contract is deployed');
    
    // Create contract instance
    const escrowContract = new ethers.Contract(escrowAddress, ESCROW_ABI, provider);
    
    // Check contract balance
    console.log('\n💰 Checking contract balance...');
    try {
      const balance = await escrowContract.getBalance();
      console.log(`✅ Contract balance: ${ethers.formatEther(balance)} POL`);
    } catch (error) {
      console.log('⚠️ Could not get contract balance (function may not exist)');
    }
    
    // Check wallet balances
    console.log('\n💳 Checking wallet balances...');
    const aliceBalance = await provider.getBalance(getAliceAddress());
    const carolBalance = await provider.getBalance(getCarolAddress());
    
    console.log(`👤 Alice balance: ${ethers.formatEther(aliceBalance)} POL`);
    console.log(`👤 Carol balance: ${ethers.formatEther(carolBalance)} POL`);
    
    // Check network connection
    console.log('\n🌐 Checking network connection...');
    const network = await provider.getNetwork();
    console.log(`✅ Connected to chain ID: ${network.chainId}`);
    
    // Test a simple deposit ID calculation
    console.log('\n🔐 Testing deposit ID calculation...');
    const testDepositId = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['address', 'address', 'uint256', 'uint256', 'bytes32'],
        [getAliceAddress(), getCarolAddress(), ethers.parseEther('0.015'), Math.floor(Date.now() / 1000) + 3600, '0x' + '0'.repeat(64)]
      )
    );
    console.log(`✅ Deposit ID calculated: ${testDepositId.substring(0, 20)}...`);
    
    console.log('\n🎉 Contract interaction test completed successfully!');
    console.log('✅ Ready to run production scripts');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testContractInteraction();
} 