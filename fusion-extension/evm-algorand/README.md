# Algorand Fusion Contracts for Cross-Chain Swaps

## 🎉 **UPDATED FOR ALGOKIT v2.0.0+**

This project has been completely updated to work with the latest AlgoKit version and follows the official Algorand development patterns.

## 📋 **Overview**

The Algorand Fusion Contracts provide the evm-algorand infrastructure for cross-chain swaps between EVM chains (Polygon) and Algorand. This implementation includes:

- **Fusion Escrow Contract**: Handles HTLC-based atomic swaps
- **Fusion Solver Contract**: Manages solver registration and swap execution
- **Fusion Pool Contract**: Provides liquidity management and fee distribution

## 🏗️ **Architecture**

```
EVM (Polygon) ←→ Algorand Fusion Contracts ←→ Algorand Network
     ↑                    ↑                        ↑
  User Orders        HTLC Escrows            Native ALGO/ASA
```

## 🚀 **Quick Start**

### Prerequisites

1. **Python 3.8+**
2. **Node.js 16+**
3. **AlgoKit CLI v2.0.0+**

### Installation

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
npm install

# Install AlgoKit CLI (if not already installed)
pip install algokit
```

### Account Setup

```bash
# Create Algorand testnet accounts
npm run create-accounts

# Check account balances
npm run check-balances
```

### Contract Deployment

```bash
# Option 1: Use the automated deployment script
./scripts/deploy-contracts-new.sh

# Option 2: Manual deployment
python -m contracts build
python -m contracts deploy

# Option 3: Using AlgoKit commands
algokit project run build
algokit project deploy
```

## 📁 **Project Structure**

```
evm-algorand/
├── contracts/                 # Smart contracts (algopy format)
│   ├── __init__.py
│   ├── __main__.py           # Build and deploy entry point
│   ├── escrow.py             # Fusion Escrow Contract
│   ├── solver.py             # Fusion Solver Contract
│   └── pool.py               # Fusion Pool Contract
├── config/                   # Configuration files
│   ├── network-config.ts     # Network configuration
│   └── real-addresses.ts     # Account addresses
├── scripts/                  # Utility scripts
│   ├── check-balances.js     # Check account balances
│   ├── create-accounts.js    # Generate test accounts
│   └── deploy-contracts-new.sh # Deployment script
├── utils/                    # Utility functions
│   └── escrow.ts            # Escrow management utilities
├── algokit.toml             # AlgoKit configuration
├── package.json             # Node.js dependencies
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## 🔧 **Configuration**

### Environment Variables

Set the following environment variables for deployment:

```bash
export DEPLOYER_MNEMONIC="your deployer mnemonic"
export DISPENSER_MNEMONIC="your dispenser mnemonic"
```

### Network Configuration

The project is configured for Algorand testnet by default. Update `config/network-config.ts` for different networks.

## 📊 **Contract Details**

### Fusion Escrow Contract

**Purpose**: Handles HTLC-based atomic swaps between EVM and Algorand

**Key Methods**:
- `create_order()`: Create a new escrow order
- `claim_order()`: Claim funds using the secret
- `cancel_order()`: Cancel order after timelock expires
- `get_order_info()`: Get order information

### Fusion Solver Contract

**Purpose**: Manages solver registration and swap execution

**Key Methods**:
- `register_solver()`: Register a new solver
- `execute_swap()`: Execute a cross-chain swap
- `get_solver_stats()`: Get solver statistics
- `get_global_stats()`: Get global statistics

### Fusion Pool Contract

**Purpose**: Provides liquidity management and fee distribution

**Key Methods**:
- `add_liquidity()`: Add liquidity to the pool
- `remove_liquidity()`: Remove liquidity from the pool
- `distribute_fees()`: Distribute fees to liquidity providers
- `get_pool_stats()`: Get pool statistics

## 🔄 **Cross-Chain Integration**

This project integrates with the main cross-chain module:

- **EVM → Algorand**: User deposits POL to EVM escrow, resolver deposits ALGO to Algorand escrow
- **Algorand → EVM**: User deposits ALGO to Algorand escrow, resolver deposits POL to EVM escrow

### Integration Points

1. **Contract Addresses**: Update `config/real-addresses.ts` with deployed contract IDs
2. **Account Management**: Use generated accounts from `config/real-addresses.ts`
3. **Network Configuration**: Configure RPC endpoints in `config/network-config.ts`

## 🧪 **Testing**

### Unit Tests

```bash
# Run Python tests
python -m pytest

# Run TypeScript tests
npm test
```

### Integration Tests

```bash
# Test cross-chain swaps
cd ../cross-chain
npm run test:algorand
```

## 📈 **Monitoring**

### Contract Statistics

```bash
# Check contract statistics
python -m contracts stats
```

### Account Balances

```bash
# Check all account balances
npm run check-balances
```

## 🚨 **Troubleshooting**

### Common Issues

1. **AlgoKit Version Mismatch**
   ```bash
   pip install --upgrade algokit
   ```

2. **Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Account Funding**
   ```bash
   # Use Algorand testnet dispenser
   # Or transfer from another funded account
   ```

4. **Contract Deployment Failures**
   ```bash
   # Check account balances
   npm run check-balances
   
   # Verify environment variables
   echo $DEPLOYER_MNEMONIC
   ```

### Debug Mode

```bash
# Enable debug logging
export ALGOKIT_LOG_LEVEL=DEBUG
python -m contracts deploy
```

## 🔗 **Related Projects**

- **Cross-Chain Module**: `../cross-chain/` - Main cross-chain integration
- **EVM Side**: `../evm-btc/` - Polygon/Ethereum contracts
- **NEAR Side**: `../evm-near/` - NEAR Protocol integration

## 📄 **License**

MIT License - see LICENSE file for details.

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 **Support**

For issues and questions:
1. Check the troubleshooting section
2. Review the AlgoKit documentation
3. Open an issue on GitHub

---

**🎉 Ready for Production Deployment!** 