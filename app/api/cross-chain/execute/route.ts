import { NextRequest, NextResponse } from 'next/server';
import { createFusionPlusL1Extension, CrossChainSwapRequest } from '../../../../src/services/fusion-plus-l1-extension';
import { executeRealCrossChainSwap } from '../../../../src/services/real-cross-chain-executor';

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

    // Execute real cross-chain swap using production scripts
    const swapResult = await executeRealCrossChainSwap({
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
      swap: swapResult,
      swapId: swapResult.swapId,
      status: swapResult.status,
      transactions: swapResult.transactions
    });

  } catch (error) {
    console.error('Error executing cross-chain swap:', error);
    return NextResponse.json(
      { 
        error: 'Failed to execute swap',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 