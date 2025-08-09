import { NextRequest, NextResponse } from 'next/server';
import { getRealCrossChainQuote } from '../../../../src/services/real-cross-chain-executor';

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

    // Get real cross-chain quote
    const quote = await getRealCrossChainQuote({
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
      quote: {
        fromChain,
        toChain,
        fromToken,
        toToken,
        fromAmount,
        toAmount: quote.toAmount,
        price: quote.price,
        gasEstimate: quote.gasEstimate,
        protocols: ['real-cross-chain'],
        validUntil: Date.now() + 300000 // 5 minutes
      },
      request: {
        fromChain,
        toChain,
        fromToken,
        toToken,
        fromAmount,
        userAddress,
        slippageTolerance,
        strategy
      }
    });

  } catch (error) {
    console.error('Error getting cross-chain quote:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get quote',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 