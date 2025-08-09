import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chain = searchParams.get('chain') // 'algorand'
    const fromChain = searchParams.get('fromChain') || ''
    const toChain = searchParams.get('toChain') || ''
    const hashlock = searchParams.get('hashlock') || ''
    const depositorAddress = searchParams.get('depositorAddress') || ''
    const network = searchParams.get('network') || 'algorand-testnet'
    const depositTimestamp = Number(searchParams.get('depositTimestamp') || '0')
    const timelockSeconds = Number(searchParams.get('timelockSeconds') || '3600')

    if (!chain || !hashlock || !depositorAddress || !depositTimestamp) {
      return NextResponse.json({ error: 'Missing required params' }, { status: 400 })
    }

    // Basic time-based eligibility check
    const eligible = Date.now() > depositTimestamp + timelockSeconds * 1000

    if (!eligible) {
      return NextResponse.json({ eligible: false })
    }

    if (chain === 'algorand') {
      const escrowAppId = parseInt(process.env.ALGORAND_ESCROW_APP_ID || '743881611', 10)
      const clientActions = [
        {
          id: 'algorand-refund',
          kind: 'algorand_refund',
          targetStepId: fromChain.includes('algorand') ? 'source-deposit' : 'destination-deposit',
          params: {
            escrowAppId,
            depositorAddress,
            depositId: hashlock,
            network
          }
        }
      ]
      return NextResponse.json({ eligible: true, clientActions })
    }

    return NextResponse.json({ error: `Unsupported chain ${chain}` }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
} 