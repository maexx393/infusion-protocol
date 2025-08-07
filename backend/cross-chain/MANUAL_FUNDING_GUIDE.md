# 🔑 Manual Solana Account Funding Guide

## Overview
The cross-chain swap requires funded Solana accounts to perform real transactions. This guide shows you how to manually fund the accounts using the Solana faucet.

## 🔍 Current Account Status

All accounts currently have **0 SOL balance** and need funding:

### 👤 RESOLVER Account
- **Address**: `HPzKmJz7XZvrNxdLeti8RkdNgRDzKErPYLXFMZncZfTb`
- **Current Balance**: 0.000000 SOL
- **Required**: 1 SOL minimum

### 👤 SILVIO Account  
- **Address**: `8M3aUYmP5o4NSj6cTyDtoEsf5CdXD2sojEAceydgff7b`
- **Current Balance**: 0.000000 SOL
- **Required**: 1 SOL minimum

### 👤 STACY Account
- **Address**: `BQkYVpnw6Nk1v2EYYq5e7vBCKMmM7oXttWkMGro1HKbM`
- **Current Balance**: 0.000000 SOL
- **Required**: 1 SOL minimum

## 🚀 How to Fund Accounts

### Method 1: Solana Faucet Website
1. Go to [https://faucet.solana.com](https://faucet.solana.com)
2. Select **Testnet** network
3. Enter each address above
4. Request **1 SOL** for each account
5. Wait for confirmation (usually 1-2 minutes)

### Method 2: Solana CLI (if installed)
```bash
# Fund resolver account
solana airdrop 1 HPzKmJz7XZvrNxdLeti8RkdNgRDzKErPYLXFMZncZfTb --url testnet

# Fund silvio account  
solana airdrop 1 8M3aUYmP5o4NSj6cTyDtoEsf5CdXD2sojEAceydgff7b --url testnet

# Fund stacy account
solana airdrop 1 BQkYVpnw6Nk1v2EYYq5e7vBCKMmM7oXttWkMGro1HKbM --url testnet
```

### Method 3: Check Balances After Funding
```bash
# Check resolver balance
solana balance HPzKmJz7XZvrNxdLeti8RkdNgRDzKErPYLXFMZncZfTb --url testnet

# Check silvio balance
solana balance 8M3aUYmP5o4NSj6cTyDtoEsf5CdXD2sojEAceydgff7b --url testnet

# Check stacy balance  
solana balance BQkYVpnw6Nk1v2EYYq5e7vBCKMmM7oXttWkMGro1HKbM --url testnet
```

## ✅ Verification

After funding, run this command to verify balances:
```bash
npx ts-node fund-solana-accounts.ts
```

You should see balances > 0.1 SOL for all accounts.

## 🎯 Next Steps

Once all accounts are funded:
1. Run the cross-chain swap: `npx ts-node production-evm2solana-real.ts`
2. The script will now perform **real Solana transactions** instead of mock ones
3. You'll see actual transaction signatures on Solana Testnet

## 🔒 Security Note

These are **test accounts** for development only. Never use these private keys for mainnet or store real funds.

## 🆘 Troubleshooting

- **"Insufficient funds"**: Make sure you funded with at least 1 SOL per account
- **"Network error"**: Try the Solana CLI method instead of the web faucet
- **"Transaction failed"**: Wait a few minutes and try again (network congestion)

## 📞 Support

If you continue having issues:
1. Check Solana Devnet status: [https://status.solana.com](https://status.solana.com)
2. Try alternative faucets or wait for network stability
3. The demo will still work with mock transactions for demonstration purposes 