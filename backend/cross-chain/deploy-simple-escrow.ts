import { ethers } from 'ethers';
import * as fs from 'fs';

// Simple Escrow contract source code
const ESCROW_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleEscrow {
    struct Deposit {
        address depositor;
        address claimer;
        uint256 amount;
        uint256 expirationTime;
        bytes32 hashlock;
        bool claimed;
        bool cancelled;
    }
    
    mapping(bytes32 => Deposit) public deposits;
    
    event DepositCreated(bytes32 indexed depositId, address indexed depositor, address indexed claimer, uint256 amount, uint256 expirationTime, bytes32 hashlock);
    event DepositClaimed(bytes32 indexed depositId, address indexed claimer, bytes secret);
    
    function deposit(address claimer, uint256 expirationTime, bytes32 hashlock) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(claimer != address(0), "Invalid claimer address");
        require(expirationTime > block.timestamp, "Expiration time must be in the future");
        
        deposits[hashlock] = Deposit({
            depositor: msg.sender,
            claimer: claimer,
            amount: msg.value,
            expirationTime: expirationTime,
            hashlock: hashlock,
            claimed: false,
            cancelled: false
        });
        
        emit DepositCreated(hashlock, msg.sender, claimer, msg.value, expirationTime, hashlock);
    }
    
    function claim(bytes32 depositId, bytes memory secret) external {
        Deposit storage deposit = deposits[depositId];
        require(deposit.depositor != address(0), "Deposit does not exist");
        require(!deposit.claimed, "Deposit already claimed");
        require(!deposit.cancelled, "Deposit already cancelled");
        require(block.timestamp <= deposit.expirationTime, "Deposit expired");
        require(keccak256(secret) == depositId, "Invalid secret");
        
        deposit.claimed = true;
        
        (bool success, ) = deposit.claimer.call{value: deposit.amount}("");
        require(success, "Transfer failed");
        
        emit DepositClaimed(depositId, deposit.claimer, secret);
    }
    
    function getDeposit(bytes32 depositId) external view returns (address depositor, address claimer, uint256 amount, uint256 expirationTime, bytes32 hashlock, bool claimed, bool cancelled) {
        Deposit storage deposit = deposits[depositId];
        return (deposit.depositor, deposit.claimer, deposit.amount, deposit.expirationTime, deposit.hashlock, deposit.claimed, deposit.cancelled);
    }
    
    function isExpired(bytes32 depositId) external view returns (bool) {
        Deposit storage deposit = deposits[depositId];
        return block.timestamp > deposit.expirationTime;
    }
    
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    receive() external payable {}
}
`;

async function main() {
  console.log('🚀 Deploying Simple Escrow Contract to Polygon Amoy...');
  
  // Load environment variables
  require('dotenv').config();
  
  const ALICE_PRIVATE_KEY = process.env.ALICE_PRIVATE_KEY;
  const RPC_URL = 'https://polygon-amoy.g.alchemy.com/v2/E-LLa6qeTOzgnGgIhe8q3';
  
  if (!ALICE_PRIVATE_KEY) {
    throw new Error('ALICE_PRIVATE_KEY not found in environment variables');
  }

  // Setup provider and signer
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(ALICE_PRIVATE_KEY, provider);
  
  console.log(`👤 Deployer address: ${await signer.getAddress()}`);
  console.log(`🌐 Network: Polygon Amoy (Chain ID: ${await provider.getNetwork().then(n => n.chainId)})`);
  
  // Check balance
  const balance = await provider.getBalance(await signer.getAddress());
  console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} POL`);
  
  if (balance < ethers.parseEther('0.01')) {
    throw new Error('Insufficient balance for deployment. Need at least 0.01 POL');
  }
  
  // Create contract factory using the source code
  console.log('📝 Creating contract factory...');
  
  // For now, let's try a different approach - let's use a pre-compiled contract
  // or try to deploy using a simpler method
  
  console.log('⚠️  Note: Direct source code deployment is not supported in this environment.');
  console.log('💡 Alternative: Let\'s use the existing escrow contract from the evm-side directory.');
  
  // Try to copy the existing escrow contract
  const evmEscrowPath = '../evm-side/eth-escrow/contracts/escrow.sol';
  if (fs.existsSync(evmEscrowPath)) {
    console.log('✅ Found existing escrow contract, copying...');
    const escrowSource = fs.readFileSync(evmEscrowPath, 'utf8');
    fs.writeFileSync('./escrow.sol', escrowSource);
    console.log('✅ Escrow contract copied to current directory');
  } else {
    console.log('❌ Existing escrow contract not found');
    console.log('💡 Let\'s try a different approach...');
  }
  
  // For now, let's create a simple deployment using a different method
  console.log('🎯 Creating a simple deployment script...');
  
  // Create a simple deployment script that can be run manually
  const deployScript = `
// Simple Escrow Deployment Script
// Run this with: npx hardhat run deploy-simple.js --network polygonAmoy

const hre = require("hardhat");

async function main() {
  const SimpleEscrow = await hre.ethers.getContractFactory("SimpleEscrow");
  const escrow = await SimpleEscrow.deploy();
  await escrow.waitForDeployment();
  
  console.log("SimpleEscrow deployed to:", await escrow.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;
  
  fs.writeFileSync('./deploy-simple.js', deployScript);
  console.log('✅ Created deploy-simple.js script');
  
  // Create hardhat config for Polygon Amoy
  const hardhatConfig = `
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    polygonAmoy: {
      url: "https://polygon-amoy.g.alchemy.com/v2/E-LLa6qeTOzgnGgIhe8q3",
      accounts: [process.env.ALICE_PRIVATE_KEY],
      chainId: 80002
    }
  }
};
`;
  
  fs.writeFileSync('./hardhat.config.js', hardhatConfig);
  console.log('✅ Created hardhat.config.js for Polygon Amoy');
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Install hardhat: npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox');
  console.log('2. Run deployment: npx hardhat run deploy-simple.js --network polygonAmoy');
  console.log('3. Update the contract address in src/variables.ts');
  console.log('4. Test the cross-chain demo');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }); 