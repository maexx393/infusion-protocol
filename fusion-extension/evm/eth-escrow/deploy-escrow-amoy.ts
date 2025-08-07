import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
require('dotenv').config();

async function main() {
  console.log('🚀 Deploying Escrow Contract to Polygon Amoy...');
  
  // Check if private key is available
  const privateKey = process.env.ALICE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('ALICE_PRIVATE_KEY not found in environment variables');
  }
  
  // Create provider and signer
  const provider = new ethers.JsonRpcProvider('https://polygon-amoy.g.alchemy.com/v2/E-LLa6qeTOzgnGgIhe8q3');
  const signer = new ethers.Wallet(privateKey, provider);
  
  console.log(`👤 Deployer address: ${signer.address}`);
  
  // Check balance
  const balance = await provider.getBalance(signer.address);
  console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} POL`);
  
  if (balance < ethers.parseEther('0.01')) {
    throw new Error('Insufficient balance for deployment');
  }
  
  // Load the compiled contract
  const contractPath = path.join(__dirname, 'artifacts/contracts/escrow.sol/Escrow.json');
  if (!fs.existsSync(contractPath)) {
    throw new Error('Contract artifacts not found. Please run "npx hardhat compile" first.');
  }
  
  const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  const contractFactory = new ethers.ContractFactory(
    contractArtifact.abi,
    contractArtifact.bytecode,
    signer
  );
  
  console.log('📝 Deploying contract...');
  
  // Deploy the contract
  const contract = await contractFactory.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log(`✅ Contract deployed successfully!`);
  console.log(`📍 Contract address: ${contractAddress}`);
  console.log(`🔗 Explorer: https://www.oklink.com/amoy/address/${contractAddress}`);
  
  // Save deployment info
  const deploymentInfo = {
    contract: 'Escrow',
    address: contractAddress,
    network: 'Polygon Amoy',
    chainId: 80002,
    deployer: signer.address,
    timestamp: new Date().toISOString(),
    rpcUrl: 'https://polygon-amoy.g.alchemy.com/v2/E-LLa6qeTOzgnGgIhe8q3'
  };
  
  const deploymentPath = path.join(__dirname, 'deployment-info.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 Deployment info saved to: ${deploymentPath}`);
  
  // Update the cross-chain configuration
  const crossChainConfigPath = path.join(__dirname, '../../cross-chain/src/variables.ts');
  if (fs.existsSync(crossChainConfigPath)) {
    let configContent = fs.readFileSync(crossChainConfigPath, 'utf8');
    configContent = configContent.replace(
      /export const getEscrowContractAddress = \(\): string => \{[\s\S]*?return '.*?';[\s\S]*?\};/,
      `export const getEscrowContractAddress = (): string => {
  return '${contractAddress}';
};`
    );
    fs.writeFileSync(crossChainConfigPath, configContent);
    console.log(`🔄 Updated cross-chain configuration with new contract address`);
  }
  
  console.log('\n🎉 Deployment completed successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }); 