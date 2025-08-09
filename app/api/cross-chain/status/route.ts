import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chain = searchParams.get('chain')
    const txid = searchParams.get('txid')
    const network = searchParams.get('network') || 'algorand-testnet'

    if (!chain || !txid) {
      return NextResponse.json({ error: 'Missing chain or txid' }, { status: 400 })
    }

    if (chain === 'algorand') {
      const rpcUrl = process.env.NEXT_PUBLIC_ALGORAND_TESTNET_RPC || 'https://testnet-api.algonode.cloud'
      const algosdk: any = await import('algosdk')
      const algod = new algosdk.Algodv2('', rpcUrl, '')

      try {
        const p = await algod.pendingTransactionInformation(txid).do()
        const confirmed = Boolean(p && p['confirmed-round'])
        return NextResponse.json({
          chain,
          txid,
          confirmed,
          round: p['confirmed-round'] || null,
          explorerUrl: `https://lora.algokit.io/testnet/tx/${txid}`
        })
      } catch (e) {
        return NextResponse.json({ chain, txid, confirmed: false, error: String(e) }, { status: 200 })
      }
    }

    return NextResponse.json({ error: `Unsupported chain ${chain}` }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
} 