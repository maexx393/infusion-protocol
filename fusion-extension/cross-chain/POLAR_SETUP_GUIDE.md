# Polar Lightning Network Setup Guide

## Overview
This guide will help you set up Polar with both Alice and Carol Lightning Network nodes for cross-chain testing.

## Prerequisites
- [Polar](https://lightningpolar.com/download) installed
- Docker Desktop running
- Basic understanding of Lightning Network concepts

## Step 1: Install and Launch Polar

1. **Download Polar** from https://lightningpolar.com/download
2. **Install and launch** the application
3. **Ensure Docker Desktop** is running

## Step 2: Create a New Network

1. **Click "Create Network"** in Polar
2. **Name your network**: `Cross-Chain Test Network`
3. **Select Bitcoin**: Choose `Bitcoin Core` as the backend
4. **Choose network**: Select `Regtest` for testing
5. **Click "Create"**

## Step 3: Add Lightning Nodes

### Add Alice Node
1. **Click "Add Node"** in your network
2. **Select LND**: Choose `LND` as the implementation
3. **Name**: `alice`
4. **Click "Add"**

### Add Carol Node
1. **Click "Add Node"** again
2. **Select LND**: Choose `LND` as the implementation
3. **Name**: `carol`
4. **Click "Add"**

## Step 4: Start the Network

1. **Click "Start Network"** to launch all nodes
2. **Wait for all nodes** to show green status
3. **Verify both nodes** are running:
   - Alice should be on port 8081
   - Carol should be on port 8083

## Step 5: Fund the Nodes

### Fund Alice
1. **Click on Alice node**
2. **Go to "Wallet" tab**
3. **Click "Send"** to generate an address
4. **Copy the address** and send some test BTC to it
5. **Wait for confirmation**

### Fund Carol
1. **Click on Carol node**
2. **Go to "Wallet" tab**
3. **Click "Send"** to generate an address
4. **Copy the address** and send some test BTC to it
5. **Wait for confirmation**

## Step 6: Create Channel Between Nodes

1. **Click on Alice node**
2. **Go to "Channels" tab**
3. **Click "Open Channel"**
4. **Select Carol** as the peer
5. **Enter amount**: `1000000` satoshis (0.01 BTC)
6. **Click "Open Channel"**
7. **Wait for channel** to be active

## Step 7: Verify Configuration

Run the test script to verify everything is working:

```bash
cd fusion-extension/cross-chain
npx ts-node test-ln-config.ts
```

You should see:
```
✅ Found config at btc path
📋 Configuration loaded successfully!
   Number of nodes: 2
   Node 1: alice (port: 8081)
   Node 2: carol (port: 8083)
✅ Carol node found in configuration
```

## Step 8: Test Cross-Chain Functionality

Now you can test the cross-chain examples:

```bash
# Test BTC to EVM swap
./example-btc2evm.sh

# Test EVM to BTC swap
./example-evm2btc.sh
```

## Troubleshooting

### Node Not Found Error
- **Check Polar**: Ensure both nodes are running and green
- **Verify ports**: Alice should be on 8081, Carol on 8083
- **Check macaroon paths**: Ensure the paths in `ln.json` match your Polar setup

### Connection Issues
- **Docker**: Make sure Docker Desktop is running
- **Ports**: Check if ports 8081 and 8083 are available
- **Firewall**: Ensure no firewall is blocking the connections

### Macaroon Issues
- **File permissions**: Ensure macaroon files are readable
- **Paths**: Verify the paths in `ln.json` are correct for your system
- **Polar version**: Make sure you're using a compatible version

## Configuration Files

The following files are automatically configured:

- `fusion-extension/btc/LN/ln.json` - Main Lightning Network configuration
- `fusion-extension/cross-chain/src/ln.json` - Copy for cross-chain module
- `fusion-extension/cross-chain/.env` - Environment variables

## Next Steps

Once Polar is set up with both nodes:

1. **Test basic Lightning operations**:
   ```bash
   npx ts-node src/utils/lightning.ts
   ```

2. **Run cross-chain examples**:
   ```bash
   ./example-btc2evm.sh
   ./example-evm2btc.sh
   ```

3. **Monitor transactions** in Polar's interface

## Support

If you encounter issues:

1. **Check Polar logs** in the application
2. **Verify Docker containers** are running
3. **Test individual node connectivity**
4. **Review the configuration files**

---

**Note**: This setup is for development and testing purposes. For production, use mainnet nodes with proper security measures. 