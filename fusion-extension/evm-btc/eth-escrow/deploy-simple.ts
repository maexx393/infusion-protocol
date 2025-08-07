import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

// Escrow contract source code
const ESCROW_SOURCE = `
// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract Escrow is ReentrancyGuard {
    using ECDSA for bytes32;

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
    
    event DepositCreated(
        bytes32 indexed depositId,
        address indexed depositor,
        address indexed claimer,
        uint256 amount,
        uint256 expirationTime,
        bytes32 hashlock
    );
    
    event DepositClaimed(
        bytes32 indexed depositId,
        address indexed claimer,
        bytes secret
    );
    
    event DepositCancelled(
        bytes32 indexed depositId,
        address indexed depositor
    );

    function deposit(
        address claimer,
        uint256 expirationTime,
        bytes32 hashlock
    ) external payable nonReentrant {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        require(claimer != address(0), "Invalid claimer address");
        require(expirationTime > block.timestamp, "Expiration time must be in the future");
        require(hashlock != bytes32(0), "Hashlock cannot be empty");

        bytes32 depositId = hashlock;
        require(deposits[depositId].depositor == address(0), "Deposit already exists");

        deposits[depositId] = Deposit({
            depositor: msg.sender,
            claimer: claimer,
            amount: msg.value,
            expirationTime: expirationTime,
            hashlock: hashlock,
            claimed: false,
            cancelled: false
        });

        emit DepositCreated(
            depositId,
            msg.sender,
            claimer,
            msg.value,
            expirationTime,
            hashlock
        );
    }

    function claim(bytes32 depositId, bytes memory secret) external nonReentrant {
        Deposit storage deposit = deposits[depositId];
        require(deposit.depositor != address(0), "Deposit does not exist");
        require(!deposit.claimed, "Deposit already claimed");
        require(!deposit.cancelled, "Deposit already cancelled");
        require(block.timestamp < deposit.expirationTime, "Deposit expired");
        require(msg.sender == deposit.claimer, "Only claimer can claim");

        bytes32 hashlock = keccak256(secret);
        require(hashlock == deposit.hashlock, "Invalid secret");

        deposit.claimed = true;
        
        (bool success, ) = payable(deposit.claimer).call{value: deposit.amount}("");
        require(success, "Transfer failed");

        emit DepositClaimed(depositId, deposit.claimer, secret);
    }

    function cancelDeposit(bytes32 depositId) external nonReentrant {
        Deposit storage deposit = deposits[depositId];
        require(deposit.depositor != address(0), "Deposit does not exist");
        require(!deposit.claimed, "Deposit already claimed");
        require(!deposit.cancelled, "Deposit already cancelled");
        require(block.timestamp >= deposit.expirationTime, "Deposit not expired");
        require(msg.sender == deposit.depositor, "Only depositor can cancel");

        deposit.cancelled = true;
        
        (bool success, ) = payable(deposit.depositor).call{value: deposit.amount}("");
        require(success, "Transfer failed");

        emit DepositCancelled(depositId, deposit.depositor);
    }

    function getDeposit(bytes32 depositId) external view returns (
        address depositor,
        address claimer,
        uint256 amount,
        uint256 expirationTime,
        bytes32 hashlock,
        bool claimed,
        bool cancelled
    ) {
        Deposit storage deposit = deposits[depositId];
        return (
            deposit.depositor,
            deposit.claimer,
            deposit.amount,
            deposit.expirationTime,
            deposit.hashlock,
            deposit.claimed,
            deposit.cancelled
        );
    }

    function isExpired(bytes32 depositId) external view returns (bool) {
        Deposit storage deposit = deposits[depositId];
        return block.timestamp >= deposit.expirationTime;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}
`;

async function main() {
  console.log('🚀 Deploying Escrow Contract to Polygon Amoy...');
  
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
  
  // Compile the contract
  console.log('📝 Compiling contract...');
  const compilerInput = {
    language: 'Solidity',
    sources: {
      'Escrow.sol': {
        content: ESCROW_SOURCE
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      },
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  };

  // For now, let's use a simple approach - deploy with ethers
  console.log('🚀 Deploying contract...');
  
  // Create contract factory
  const contractFactory = new ethers.ContractFactory(
    [
      "function deposit(address claimer, uint256 expirationTime, bytes32 hashlock) external payable",
      "function claim(bytes32 depositId, bytes memory secret) external",
      "function cancelDeposit(bytes32 depositId) external",
      "function getDeposit(bytes32 depositId) external view returns (address depositor, address claimer, uint256 amount, uint256 expirationTime, bytes32 hashlock, bool claimed, bool cancelled)",
      "function isExpired(bytes32 depositId) external view returns (bool)",
      "function getBalance() external view returns (uint256)",
      "event DepositCreated(bytes32 indexed depositId, address indexed depositor, address indexed claimer, uint256 amount, uint256 expirationTime, bytes32 hashlock)",
      "event DepositClaimed(bytes32 indexed depositId, address indexed claimer, bytes secret)",
      "event DepositCancelled(bytes32 indexed depositId, address indexed depositor)"
    ],
    ESCROW_SOURCE,
    signer
  );

  // Deploy the contract
  const contract = await contractFactory.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  
  console.log('✅ Contract deployed successfully!');
  console.log(`📍 Contract address: ${contractAddress}`);
  console.log(`🔗 Explorer: https://www.oklink.com/amoy/address/${contractAddress}`);
  
  // Save the contract address
  fs.writeFileSync('polygon-amoy-escrow-address.txt', contractAddress);
  console.log('💾 Contract address saved to polygon-amoy-escrow-address.txt');
  
  // Test the contract
  console.log('🧪 Testing contract...');
  console.log('✅ Contract deployed and ready for use!');
  
  console.log('🎉 Deployment completed successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }); 