# Production Cross-Chain Swap Scripts

This directory contains production-ready cross-chain swap scripts that execute real blockchain transactions on Polygon Amoy testnet.

## 🚀 Overview

The production scripts implement actual HTLC (Hash Time-Locked Contract) atomic swaps between:
- **EVM chains** (Polygon Amoy) ↔ **Bitcoin** (Lightning Network)
- Real escrow contract interactions
- Live balance verification
- Actual transaction execution

## 📋 Prerequisites

### Environment Variables
Set the following environment variables:

```bash
export ALICE_PRIVATE_KEY="your_alice_private_key_here"
export CAROL_PRIVATE_KEY="your_carol_private_key_here"
```

### Network Requirements
- **Polygon Amoy Testnet**: For EVM transactions
- **Lightning Network**: For Bitcoin transactions (simulated in demo)
- **Internet Connection**: For RPC calls

### Balance Requirements
- **Alice's Wallet**: At least 0.02 POL for EVM→BTC swaps
- **Carol's Wallet**: At least 0.02 POL for BTC→EVM swaps (escrow deposits)

## 🔧 Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Verify Contract Deployment**:
   ```bash
   # Check if escrow contract is deployed
   node -e "
   const { ethers } = require('ethers');
   const provider = new ethers.JsonRpcProvider('https://polygon-amoy.g.alchemy.com/v2/E-LLa6qeTOzgnGgIhe8q3');
   provider.getCode('0x41d3151f0eC68aAB26302164F9E00268A99dB783').then(code => 
     console.log('Contract deployed:', code !== '0x' ? 'YES' : 'NO')
   );
   "
   ```

## 🎯 Available Scripts

### 1. EVM to BTC Swap (Production)
**File**: `production-evm2btc.ts`
**Shell Script**: `run-production-evm2btc.sh`

**Flow**:
1. Alice deposits 0.015 POL into escrow contract
2. Resolver pays Lightning invoice to reveal secret
3. Carol claims POL from escrow using revealed secret
4. Balance verification across networks

**Run**:
```bash
./run-production-evm2btc.sh
```

### 2. BTC to EVM Swap (Production)
**File**: `production-btc2evm.ts`
**Shell Script**: `run-production-btc2evm.sh`

**Flow**:
1. Alice pays Lightning Network invoice
2. Resolver deposits 0.015 POL into escrow
3. Alice claims POL from escrow using revealed secret
4. Balance verification across networks

**Run**:
```bash
./run-production-btc2evm.sh
```

## 🔍 Contract Details

### Escrow Contract
- **Address**: `0x41d3151f0eC68aAB26302164F9E00268A99dB783`
- **Network**: Polygon Amoy Testnet
- **Chain ID**: 80002
- **Explorer**: https://www.oklink.com/amoy/address/0x41d3151f0eC68aAB26302164F9E00268A99dB783

### Key Functions
- `deposit(address claimer, uint256 expirationTime, bytes32 hashlock)` - Create HTLC deposit
- `claim(bytes32 depositId, bytes memory secret)` - Claim deposit with secret
- `getDeposit(bytes32 depositId)` - Query deposit details
- `isExpired(bytes32 depositId)` - Check if deposit is expired

## 🛡️ Security Features

### HTLC (Hash Time-Locked Contract)
- **Atomic Execution**: Both sides must complete or both fail
- **Time Locks**: Automatic refund if not claimed within timeframe
- **Hash Locks**: Secret-based unlocking mechanism
- **No Counterparty Risk**: Trustless execution

### Transaction Safety
- **Balance Checks**: Verify sufficient funds before transactions
- **Gas Estimation**: Automatic gas calculation
- **Error Handling**: Comprehensive error catching and reporting
- **Transaction Confirmation**: Wait for blockchain confirmations

## 📊 Monitoring & Verification

### Transaction Tracking
Each script provides:
- Real transaction hashes
- Block explorer links
- Balance change verification
- Gas usage statistics

### Example Output
```
Transaction Details:
  📝 Hash: 0x7d178569ebc82e5eeceb81c8d5d66ded5fc65093a3acbe95daf6dd71cf838bd0
  💰 Amount: 0.015 POL
  🌐 Network: Polygon Amoy
  ⏰ Timestamp: 2025-08-06T05:26:27.000Z
  🌐 Explorer: https://www.oklink.com/amoy/tx/0x7d178569ebc82e5eeceb81c8d5d66ded5fc65093a3acbe95daf6dd71cf838bd0
```

## ⚠️ Important Notes

### Testnet Usage
- These scripts use **Polygon Amoy testnet**
- Transactions are real but use test tokens
- No real value is at risk
- Perfect for development and testing

### Private Key Security
- **Never commit private keys to version control**
- Use environment variables for sensitive data
- Consider using hardware wallets for mainnet

### Network Conditions
- Polygon Amoy has fast block times (~2 seconds)
- Gas fees are minimal on testnet
- Network congestion may affect transaction times

## 🔧 Troubleshooting

### Common Issues

1. **Insufficient Balance**:
   ```
   Error: Insufficient balance. Depositor has 0.01 POL but needs 0.015 POL
   ```
   **Solution**: Fund the wallet with more testnet POL

2. **Private Key Not Set**:
   ```
   Error: ALICE_PRIVATE_KEY is not set or invalid
   ```
   **Solution**: Set environment variables correctly

3. **Network Connection**:
   ```
   Error: Network connection failed
   ```
   **Solution**: Check internet connection and RPC endpoint

4. **Contract Not Deployed**:
   ```
   Error: Contract not found at address
   ```
   **Solution**: Verify contract deployment or redeploy

### Debug Mode
Enable verbose logging by setting:
```bash
export DEBUG=true
```

## 🚀 Next Steps

### Production Deployment
1. **Mainnet Contracts**: Deploy to Polygon mainnet
2. **Real Lightning Node**: Integrate with actual Lightning Network
3. **Security Audit**: Professional smart contract audit
4. **Gas Optimization**: Optimize for mainnet gas costs

### Feature Enhancements
1. **Partial Fills**: Support for partial order execution
2. **Multiple Networks**: Support for other EVM chains
3. **UI Integration**: Web interface for swap execution
4. **API Endpoints**: REST API for programmatic access

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review transaction logs and error messages
3. Verify environment setup and prerequisites
4. Test with smaller amounts first

---

**⚠️ Disclaimer**: These scripts are for educational and testing purposes. Use at your own risk and never use with real funds without proper security measures. 