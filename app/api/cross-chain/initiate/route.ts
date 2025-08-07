import { NextRequest, NextResponse } from 'next/server';
import { initiateRealCrossChainSwap } from '../../../../src/services/real-cross-chain-executor';

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

    // Initiate real cross-chain swap
    const swap = await initiateRealCrossChainSwap({
      fromChain,
      toChain,
      fromToken,
      toToken,
      fromAmount,
      userAddress,
      slippageTolerance,
      strategy
    });

    return NextResponse.json({
      success: true,
      swap,
      swapId: swap.swapId,
      status: swap.status,
      hashlock: swap.hashlock,
      timelock: swap.timelock,
      expiresAt: swap.expiresAt
    });

  } catch (error) {
    console.error('Error initiating cross-chain swap:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate swap',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 