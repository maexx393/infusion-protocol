# NEAR Integration for Cross-Chain Swaps

This document describes the NEAR integration for bi-directional cross-chain swaps between EVM chains (Polygon Amoy) and NEAR Protocol.

## 🚀 Overview

The NEAR integration enables atomic cross-chain swaps between:
- **EVM chains** (Polygon Amoy) ↔ **NEAR Protocol**
- Real escrow contract interactions on both chains
- HTLC (Hash Time-Locked Contract) atomic swaps
- Production-ready implementation with live balance verification

## 📁 Architecture

### Directory Structure
```
infusion/
├── near/                    # NEAR-specific utilities
│   ├── config/
│   │   └── network-config.ts     # NEAR network configuration
│   ├── utils/
│   │   └── escrow.ts            # NEAR escrow utilities
│   ├── scripts/
│   │   └── deploy-contracts.sh  # NEAR contract deployment
│   └── src/
│       └── index.ts             # Main NEAR exports
├── cross-chain/
│   ├── src/utils/
│   │   └── near.ts              # NEAR integration utilities
│   ├── production-evm2near.ts   # EVM → NEAR swap
│   ├── production-near2evm.ts   # NEAR → EVM swap
│   ├── run-production-evm2near.sh
│   └── run-production-near2evm.sh
└── near-contracts/              # NEAR smart contracts
    ├── fusion-escrow/           # NEAR escrow contract
    ├── fusion-pool/             # NEAR liquidity pool
    └── fusion-solver/           # NEAR solver contract
```

## 🔧 Prerequisites

### Environment Setup
1. **NEAR CLI**: Install NEAR CLI for contract deployment
   ```bash
   npm install -g near-cli
   ```

2. **Rust**: Install Rust for NEAR contract compilation
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

3. **Cargo NEAR**: Install cargo-near for contract building
   ```bash
   cargo install cargo-near
   ```

4. **Environment Variables**:
   ```bash
   export ALICE_PRIVATE_KEY="your_alice_private_key"
   export CAROL_PRIVATE_KEY="your_carol_private_key"
   export OWNER_ACCOUNT="defiunite.testnet"
   ```

### NEAR Account Setup
1. **Create NEAR Account**: Create a NEAR testnet account
   ```bash
   near create-account defiunite.testnet --masterAccount testnet
   ```

2. **Fund Account**: Fund the account with testnet NEAR
   ```bash
   near send testnet defiunite.testnet 10
   ```

## 🏗️ Contract Deployment

### Deploy NEAR Contracts
1. **Navigate to near directory**:
   ```bash
   cd infusion/near
   ```

2. **Deploy contracts**:
   ```bash
   ./scripts/deploy-contracts.sh
   ```

3. **Verify deployment**:
   ```bash
   cat deployment-info.json
   ```

### Contract Addresses
After deployment, you'll get:
- **Escrow Contract**: `escrow.defiunite.testnet`
- **Solver Contract**: `solver.defiunite.testnet`
- **Pool Contract**: `pool.defiunite.testnet`

## 🔄 Cross-Chain Swap Flows

### EVM → NEAR Swap Flow
1. **Order Creation**: User creates EVM to NEAR swap order
2. **EVM Deposit**: User deposits POL into EVM escrow contract
3. **NEAR Deposit**: Resolver deposits NEAR into NEAR escrow contract
4. **Secret Revelation**: Resolver reveals secret to unlock both deposits
5. **Claim**: User claims NEAR from NEAR escrow using revealed secret
6. **Balance Verification**: Verify final balances on both networks

### NEAR → EVM Swap Flow
1. **Order Creation**: User creates NEAR to EVM swap order
2. **NEAR Deposit**: User deposits NEAR into NEAR escrow contract
3. **EVM Deposit**: Resolver deposits POL into EVM escrow contract
4. **Secret Revelation**: Resolver reveals secret to unlock both deposits
5. **Claim**: User claims POL from EVM escrow using revealed secret
6. **Balance Verification**: Verify final balances on both networks

## 🚀 Running Production Scripts

### EVM to NEAR Swap
```bash
cd fusion-extension/cross-chain
./run-production-evm2near.sh
```

### NEAR to EVM Swap
```bash
cd fusion-extension/cross-chain
./run-production-near2evm.sh
```

### Environment Check
```bash
./run-production-evm2near.sh --check-only
./run-production-near2evm.sh --check-only
```

## 📊 Key Features

### HTLC Atomic Swaps
- **Atomic Execution**: Both sides must complete or both fail
- **Time Locks**: Automatic refund if not claimed within timeframe
- **Hash Locks**: Secret-based unlocking mechanism
- **No Counterparty Risk**: Trustless execution

### Real Blockchain Transactions
- **EVM Transactions**: Real transactions on Polygon Amoy
- **NEAR Transactions**: Real transactions on NEAR Protocol
- **Live Balance Verification**: Real-time balance checking
- **Transaction Confirmation**: Wait for blockchain confirmations

### Production-Grade Features
- **Comprehensive Error Handling**: Detailed error messages and recovery
- **Environment Validation**: Full validation of private keys and network connectivity
- **Transaction Monitoring**: Real transaction hashes and block explorer links
- **Gas Optimization**: Optimized gas usage for both chains

## 🔍 Monitoring & Verification

### Transaction Tracking
Each script provides:
- Real transaction hashes for both chains
- Block explorer links
- Balance change verification
- Gas usage statistics

### Block Explorers
- **Polygon Amoy**: https://www.oklink.com/amoy
- **NEAR Testnet**: https://explorer.testnet.near.org

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
- Currently using **Polygon Amoy testnet** and **NEAR testnet**
- Real transactions but test tokens
- No real value is at risk
- Perfect for development and testing

### Security Considerations
- Private keys stored in environment variables
- No hardcoded sensitive data
- Comprehensive error handling
- Transaction confirmation waiting

### Network Requirements
- **Polygon Amoy**: Fast block times (~2 seconds)
- **NEAR Protocol**: Sub-second finality
- **Gas Costs**: Minimal on testnets
- **Network Congestion**: May affect transaction times

## 🔧 Troubleshooting

### Common Issues

1. **NEAR CLI Not Found**:
   ```
   Error: near command not found
   ```
   **Solution**: Install NEAR CLI: `npm install -g near-cli`

2. **Rust Not Installed**:
   ```
   Error: cargo command not found
   ```
   **Solution**: Install Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

3. **Insufficient NEAR Balance**:
   ```
   Error: Insufficient balance
   ```
   **Solution**: Fund NEAR account with testnet tokens

4. **Contract Not Deployed**:
   ```
   Error: Contract not found
   ```
   **Solution**: Deploy contracts using `./scripts/deploy-contracts.sh`

5. **Private Key Not Set**:
   ```
   Error: ALICE_PRIVATE_KEY not set
   ```
   **Solution**: Set environment variables correctly

### Debug Mode
Enable verbose logging by setting:
```bash
export DEBUG=true
```

## 🎯 Next Steps

### Production Deployment
1. **Mainnet Contracts**: Deploy to Polygon mainnet and NEAR mainnet
2. **Real NEAR Integration**: Integrate with actual NEAR Protocol
3. **Security Audit**: Professional smart contract audit
4. **Gas Optimization**: Optimize for mainnet gas costs

### Feature Enhancements
1. **Partial Fills**: Support for partial order execution
2. **Multiple Networks**: Support for other EVM chains
3. **UI Integration**: Web interface for swap execution
4. **API Endpoints**: REST API for programmatic access

### Advanced Features
1. **Liquidity Pools**: NEAR-based liquidity pools
2. **Solver Network**: Decentralized solver network
3. **Cross-Chain Routing**: Optimal route finding
4. **MEV Protection**: Miner extractable value protection

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review transaction logs and error messages
3. Verify environment setup and prerequisites
4. Test with smaller amounts first
5. Check block explorer for transaction status

## 📚 Additional Resources

- [NEAR Protocol Documentation](https://docs.near.org/)
- [NEAR Smart Contracts](https://docs.near.org/develop/contracts/overview)
- [Polygon Documentation](https://docs.polygon.technology/)
- [HTLC Atomic Swaps](https://en.bitcoin.it/wiki/Atomic_swap)

---

**⚠️ Disclaimer**: These scripts are for educational and testing purposes. Use at your own risk and never use with real funds without proper security measures. 