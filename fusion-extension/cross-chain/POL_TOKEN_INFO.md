# POL Token Information

## 🟣 Polygon Amoy Testnet Native Token

### Current Token: POL
- **Token Name**: Polygon (POL)
- **Network**: Polygon Amoy testnet
- **Contract Address**: Native token (no contract address needed)
- **Decimals**: 18
- **Symbol**: POL

### Historical Context
- **MATIC** was the original token for Polygon
- **POL** replaced MATIC as the native token in 2023
- **Current Status**: POL is the active native token on Polygon Amoy testnet

## 🔧 Configuration Details

### Network Configuration
```bash
NETWORK=POLYGON_AMOY
POLYGON_AMOY_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/E-LLa6qeTOzgnGgIhe8q3
```

### Token Usage in Code
- **Native Token Address**: `0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee`
- **Balance Checks**: Uses `provider.getBalance(address)` for POL
- **Gas Fees**: Paid in POL
- **Escrow Deposits**: Made in POL

### Wallet Addresses
- **Alice**: `0xC3aA518408938854DA4fb75feE44926304901865`
- **Carol**: `0xD704Df5404EF372259d5B563179099abE34b7341`

## 💰 Funding Requirements

### For Cross-Chain Demo
- **Minimum POL needed**: 0.02 POL per wallet
- **Purpose**: Gas fees for escrow transactions
- **Recommended**: 0.05 POL per wallet for testing

### Funding Sources
1. **Polygon Amoy Faucet**: https://faucet.polygon.technology/ (select Amoy network)
2. **Your existing POL wallet**: Transfer small amounts
3. **Testnet**: Use Amoy testnet for development

## 🚀 Cross-Chain Swap Flow

### BTC → POL Flow
1. **Lightning Network**: User pays BTC invoice
2. **Secret Extraction**: Secret revealed from Lightning payment
3. **EVM Escrow**: POL deposited in escrow contract
4. **Claim**: User claims POL using secret

### POL → BTC Flow
1. **EVM Escrow**: User deposits POL in escrow
2. **Lightning Invoice**: Resolver creates BTC invoice
3. **Payment**: Resolver pays Lightning invoice
4. **Completion**: User receives BTC

## 📊 Balance Check

Run the balance check to see current POL balances:
```bash
npx ts-node check-balances.ts
```

Expected output:
```
💰 Alice POL Balance: 0.0 POL
💰 Carol POL Balance: 0.0 POL
```

## 🔗 Useful Links

- **Polygon Amoy Explorer**: https://www.oklink.com/amoy
- **Polygon Amoy Faucet**: https://faucet.polygon.technology/ (select Amoy)
- **Polygon Documentation**: https://docs.polygon.technology/

## ⚠️ Important Notes

1. **Testnet vs Mainnet**: This demo uses Polygon Amoy testnet
2. **Test Tokens**: POL on Amoy testnet has no real value
3. **Gas Fees**: All transactions require POL for gas
4. **Security**: Never share private keys or send real funds to test addresses

---

**Status**: ✅ Configured for POL tokens on Polygon Amoy testnet 