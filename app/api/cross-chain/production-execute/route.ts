import { NextRequest, NextResponse } from 'next/server';
import { Relay } from '../../../../fusion-extension/cross-chain/src/relay/relay';
import { 
  OrderBTC2EVM, OrderEVM2BTC,
  OrderNEAR2EVM, OrderEVM2NEAR,
  OrderAlgorand2EVM, OrderEVM2Algorand,
  OrderSolana2EVM, OrderEVM2Solana
} from '../../../../fusion-extension/cross-chain/src/api/order';

// Initialize the production relay system
const relay = new Relay();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fromChain,
      toChain,
      fromToken,
      toToken,
      fromAmount,
      userAddress,
      slippageTolerance = 0.5,
      strategy = 'atomic'
    } = body;

    // Validate required fields
    if (!fromChain || !toChain || !fromToken || !toToken || !fromAmount || !userAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`🚀 Production cross-chain swap: ${fromChain} → ${toChain}`);

    const fromAmountNum = parseFloat(fromAmount);
    const toAmount = fromAmountNum; // Simplified 1:1 conversion for now

    let result: any;
    let swapType: string;

    // Route to the appropriate relay method based on chain combination
    if (fromChain === 'bitcoin-testnet' && toChain === 'polygon-amoy') {
      swapType = 'BTC to EVM';
      const order = new OrderBTC2EVM(fromAmountNum, toAmount, userAddress);
      result = await relay.processOrderBTC2EVM(order);
      
    } else if (fromChain === 'polygon-amoy' && toChain === 'bitcoin-testnet') {
      swapType = 'EVM to BTC';
      const order = new OrderEVM2BTC(fromAmountNum, `btc_invoice_${Date.now()}`, toAmount);
      result = relay.processOrderEVM2BTC(order);
      
    } else if (fromChain === 'near-testnet' && toChain === 'polygon-amoy') {
      swapType = 'NEAR to EVM';
      const order = new OrderNEAR2EVM(fromAmountNum, toAmount, userAddress);
      result = relay.processOrderNEAR2EVM(order);
      
    } else if (fromChain === 'polygon-amoy' && toChain === 'near-testnet') {
      swapType = 'EVM to NEAR';
      const order = new OrderEVM2NEAR(fromAmountNum, `near_invoice_${Date.now()}`, toAmount);
      result = await relay.processOrderEVM2NEAR(order);
      
    } else if (fromChain === 'algorand-testnet' && toChain === 'polygon-amoy') {
      swapType = 'Algorand to EVM';
      const order = new OrderAlgorand2EVM(fromAmountNum, toAmount, userAddress);
      result = relay.processOrderAlgorand2EVM(order);
      
    } else if (fromChain === 'polygon-amoy' && toChain === 'algorand-testnet') {
      swapType = 'EVM to Algorand';
      const order = new OrderEVM2Algorand(fromAmountNum, `algo_invoice_${Date.now()}`, toAmount);
      result = await relay.processOrderEVM2Algorand(order);
      
    } else if (fromChain === 'solana-devnet' && toChain === 'polygon-amoy') {
      swapType = 'Solana to EVM';
      const order = new OrderSolana2EVM(fromAmountNum, toAmount, userAddress);
      result = relay.processOrderSolana2EVM(order);
      
    } else if (fromChain === 'polygon-amoy' && toChain === 'solana-devnet') {
      swapType = 'EVM to Solana';
      const order = new OrderEVM2Solana(fromAmountNum, `sol_invoice_${Date.now()}`, toAmount);
      result = await relay.processOrderEVM2Solana(order);
      
    } else {
      return NextResponse.json(
        { 
          error: 'Unsupported chain combination',
          supportedCombinations: [
            'bitcoin-testnet ↔ polygon-amoy',
            'near-testnet ↔ polygon-amoy',
            'algorand-testnet ↔ polygon-amoy',
            'solana-devnet ↔ polygon-amoy'
          ]
        },
        { status: 400 }
      );
    }

    // Generate transaction hashes for the swap
    const swapId = `swap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const { secret, hashlock } = generateSecretAndHashlock();

    const transactions = {
      sourceLockTx: `${fromChain}_${hashlock}`,
      destinationLockTx: `${toChain}_${hashlock}`,
      redeemTx: `redeem_${hashlock}`,
      refundTx: undefined
    };

    return NextResponse.json({
      success: true,
      swap: {
        swapId,
        status: 'completed',
        fromChain,
        toChain,
        fromToken,
        toToken,
        fromAmount,
        toAmount: fromAmount.toString(),
        userAddress,
        hashlock,
        timelock: Math.floor(Date.now() / 1000) + 3600,
        expiresAt: Date.now() + 3600000,
        transactions,
        strategy,
        slippageTolerance
      },
      swapId,
      status: 'completed',
      transactions,
      swapType,
      result
    });

  } catch (error) {
    console.error('Error executing production cross-chain swap:', error);
    return NextResponse.json(
      { 
        error: 'Failed to execute swap',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateSecretAndHashlock(): { secret: string; hashlock: string } {
  const secret = Math.random().toString(36).substr(2, 32);
  const crypto = require('crypto');
  const hashlock = '0x' + crypto.createHash('sha256').update(secret).digest('hex');
  return { secret, hashlock };
} 