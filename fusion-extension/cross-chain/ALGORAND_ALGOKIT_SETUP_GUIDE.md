# 🚀 Algorand AlgoKit Setup Guide

Based on the [official AlgoKit introduction tutorial](https://bit.ly/algokit-intro-tutorial), this guide will help you set up real Algorand testnet wallets and integrate them with our cross-chain swap system.

## 📋 **Prerequisites**

### 1. **Install AlgoKit CLI**
```bash
npm install -g @algorandfoundation/algokit-cli
```

### 2. **Verify Installation**
```bash
algokit --version
```

### 3. **Install Python and PyTeal**
```bash
# macOS
brew install python3
pip3 install pyteal

# Ubuntu
sudo apt-get install python3 python3-pip
pip3 install pyteal
```

## 🏗️ **Step-by-Step Setup**

### **Step 1: Create Algorand Testnet Accounts**

Since AlgoKit doesn't have a direct `account create` command, we'll use the Algorand SDK to create accounts:

#### **Option A: Using Algorand SDK (Recommended)**
```bash
# Navigate to the algorand directory
cd /algorand

# Install dependencies if not already installed
npm install

# Create accounts using Node.js script
node -e "
const algosdk = require('algosdk');

// Create deployer account
const deployer = algosdk.generateAccount();
console.log('Deployer Account:');
console.log('Address:', deployer.addr);
console.log('Private Key:', Buffer.from(deployer.sk).toString('base64'));
console.log('Mnemonic:', algosdk.secretKeyToMnemonic(deployer.sk));
console.log('---');

// Create Alice account
const alice = algosdk.generateAccount();
console.log('Alice Account:');
console.log('Address:', alice.addr);
console.log('Private Key:', Buffer.from(alice.sk).toString('base64'));
console.log('Mnemonic:', algosdk.secretKeyToMnemonic(alice.sk));
console.log('---');

// Create Carol account
const carol = algosdk.generateAccount();
console.log('Carol Account:');
console.log('Address:', carol.addr);
console.log('Private Key:', Buffer.from(carol.sk).toString('base64'));
console.log('Mnemonic:', algosdk.secretKeyToMnemonic(carol.sk));
console.log('---');

// Create resolver account
const resolver = algosdk.generateAccount();
console.log('Resolver Account:');
console.log('Address:', resolver.addr);
console.log('Private Key:', Buffer.from(resolver.sk).toString('base64'));
console.log('Mnemonic:', algosdk.secretKeyToMnemonic(resolver.sk));
"
```

#### **Option B: Using Algorand Wallet**
1. **Download Algorand Wallet**: Visit [Algorand Wallet](https://algorandwallet.com/)
2. **Create New Wallet**: Follow the wallet setup process
3. **Export Account Details**: Copy the address and mnemonic phrase

#### **Option C: Using AlgoSigner (Browser Extension)**
1. **Install AlgoSigner**: Add the AlgoSigner browser extension
2. **Create Accounts**: Create multiple accounts within AlgoSigner
3. **Export Details**: Export account addresses and mnemonics

### **Step 2: Fund Your Accounts**

1. **Copy the addresses** from the account creation output

2. **Fund accounts** at the [Algorand Testnet Dispenser](https://bank.testnet.algorand.network/)

3. **Recommended funding amounts**:
   - Deployer: 10 ALGO (for contract deployment)
   - Alice: 5 ALGO (for testing)
   - Carol: 5 ALGO (for testing)
   - Resolver: 10 ALGO (for cross-chain operations)

### **Step 3: Update Configuration**

1. **Open the configuration file**:
   ```bash
   nano /cross-chain/src/config/algorand-addresses.ts
   ```

2. **Replace placeholder addresses** with your real addresses:
   ```typescript
   export const ALGORAND_REAL_ADDRESSES = {
     deployer: {
       address: 'YOUR_DEPLOYER_ADDRESS_HERE', // 58-character address
       mnemonic: 'YOUR_DEPLOYER_MNEMONIC_HERE' // 25-word phrase
     },
     alice: {
       address: 'YOUR_ALICE_ADDRESS_HERE',
       mnemonic: 'YOUR_ALICE_MNEMONIC_HERE'
     },
     carol: {
       address: 'YOUR_CAROL_ADDRESS_HERE',
       mnemonic: 'YOUR_CAROL_MNEMONIC_HERE'
     },
     resolver: {
       address: 'YOUR_RESOLVER_ADDRESS_HERE',
       mnemonic: 'YOUR_RESOLVER_MNEMONIC_HERE'
     }
   };
   ```

### **Step 4: Deploy Algorand Contracts**

1. **Navigate to algorand**:
   ```bash
   cd /algorand
   ```

2. **Initialize AlgoKit project** (if not already done):
   ```bash
   algokit init
   ```

3. **Deploy contracts**:
   ```bash
   ./scripts/deploy-contracts.sh
   ```

4. **Update contract addresses** in the configuration file with the deployed contract IDs.

### **Step 5: Test the Integration**

1. **Test EVM to Algorand swap**:
   ```bash
   cd /cross-chain
   ts-node src/relay/relay-evm2algorand-example.ts
   ```

2. **Test Algorand to EVM swap**:
   ```bash
   ts-node src/relay/relay-algorand2evm-example.ts
   ```

## 🔧 **AlgoKit Commands Reference**

### **Project Management**
```bash
# Initialize new project
algokit init

# Bootstrap project dependencies
algokit project bootstrap

# Deploy contracts
algokit project deploy

# List projects
algokit project list
```

### **Contract Compilation**
```bash
# Compile PyTeal contracts
algokit compile

# Generate client code
algokit generate client
```

### **Network Management**
```bash
# Start localnet
algokit localnet start

# Stop localnet
algokit localnet stop

# Explore network
algokit explore
```

### **Configuration**
```bash
# Configure AlgoKit
algokit config

# Check environment
algokit doctor
```

## 📊 **Address Format Validation**

### **Algorand Address Format**
- **Length**: 58 characters
- **Encoding**: Base32
- **Characters**: A-Z, 2-7
- **Example**: `ABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXYZ234567`

### **Validation Function**
```typescript
export function validateAlgorandAddress(address: string): boolean {
  return address.length === 58 && /^[A-Z2-7]+$/.test(address);
}
```

## 🚨 **Security Best Practices**

### **1. Environment Variables**
Store sensitive data in environment variables:
```bash
export ALGORAND_DEPLOYER_MNEMONIC="your deployer mnemonic"
export ALGORAND_ALICE_MNEMONIC="your alice mnemonic"
export ALGORAND_CAROL_MNEMONIC="your carol mnemonic"
export ALGORAND_RESOLVER_MNEMONIC="your resolver mnemonic"
```

### **2. Testnet Only**
- Use testnet for development and testing
- Never use real funds on testnet
- Keep mainnet addresses separate

### **3. Backup Mnemonics**
- Store mnemonics securely
- Use hardware wallets for mainnet
- Never commit mnemonics to version control

## 🔍 **Troubleshooting**

### **Common Issues**

1. **AlgoKit Not Found**:
   ```
   Error: algokit command not found
   ```
   **Solution**: Install AlgoKit: `npm install -g @algorandfoundation/algokit-cli`

2. **Python Not Installed**:
   ```
   Error: python3 command not found
   ```
   **Solution**: Install Python: `brew install python3` (macOS) or `sudo apt-get install python3` (Ubuntu)

3. **PyTeal Not Installed**:
   ```
   Error: No module named 'pyteal'
   ```
   **Solution**: Install PyTeal: `pip3 install pyteal`

4. **Insufficient ALGO Balance**:
   ```
   Error: Insufficient balance
   ```
   **Solution**: Fund Algorand account with testnet tokens

5. **Contract Not Deployed**:
   ```
   Error: Contract not found
   ```
   **Solution**: Deploy contracts using `./scripts/deploy-contracts.sh`

6. **Private Key Not Set**:
   ```
   Error: ALICE_PRIVATE_KEY not set
   ```
   **Solution**: Set environment variables correctly

### **Debug Mode**
Enable verbose logging by setting:
```bash
export DEBUG=true
export ALGOKIT_LOG_LEVEL=debug
```

## 📚 **Additional Resources**

- [AlgoKit Official Documentation](https://github.com/algorandfoundation/algokit-cli/blob/main/docs/algokit.md)
- [AlgoKit Introduction Tutorial](https://bit.ly/algokit-intro-tutorial)
- [Algorand Developer Portal](https://developer.algorand.org/)
- [PyTeal Documentation](https://pyteal.readthedocs.io/)
- [Algorand Testnet Dispenser](https://bank.testnet.algorand.network/)
- [Algorand SDK Documentation](https://developer.algorand.org/docs/sdks/javascript/)

## 🎯 **Next Steps**

1. **Complete the setup** using the steps above
2. **Test all cross-chain directions** with real Algorand addresses
3. **Deploy to mainnet** when ready for production
4. **Integrate with frontend** for user interface
5. **Add monitoring and analytics** for production use

---

**⚠️ Important**: This guide is for testnet setup only. For mainnet deployment, follow additional security measures and consider professional audits.

**🎉 Success**: Once completed, you'll have a fully functional cross-chain swap system with real Algorand integration! 