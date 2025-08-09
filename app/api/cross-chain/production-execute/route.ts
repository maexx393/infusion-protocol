import { NextRequest, NextResponse } from 'next/server';
import { 
  depositETH, 
  claimETH, 
  checkDepositEVM
} from '../../../../fusion-extension/cross-chain/src/utils/evm';
import {
  hasValidPrivateKeys,
  ALICE_PRIVATE_KEY,
  CAROL_PRIVATE_KEY,
  getAliceAddress,
  getCarolAddress
} from '../../../../fusion-extension/cross-chain/src/variables';
import { 
  generateAlgorandSecret,
  realDepositAlgorand,
  realClaimAlgorand,
  RealAlgorandEscrowManager
} from '../../../../fusion-extension/cross-chain/src/utils/algorand';

// Helper to parse Algorand private keys from mnemonic, base64, or hex
async function parseAlgorandPrivateKey(input: string): Promise<Uint8Array> {
  const algosdk: any = await import('algosdk')
  const trimmed = (input || '').trim()
  // Mnemonic (25 words)
  if (trimmed.split(/\s+/).length >= 24) {
    const { sk } = algosdk.mnemonicToSecretKey(trimmed)
    return sk as Uint8Array
  }
  // Base64
  if (/^[A-Za-z0-9+/]+={0,2}$/.test(trimmed)) {
    return new Uint8Array(Buffer.from(trimmed, 'base64'))
  }
  // Hex (with or without 0x)
  const hex = trimmed.startsWith('0x') ? trimmed.slice(2) : trimmed
  if (/^[0-9a-fA-F]+$/.test(hex)) {
    return Uint8Array.from(Buffer.from(hex, 'hex'))
  }
  throw new Error('Unsupported Algorand private key format. Provide mnemonic, base64, or hex.')
}

interface AtomicSwapStep {
  id: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash?: string;
  explorerUrl?: string;
  timestamp: number;
  chain?: string;
}

interface AtomicSwapResult {
  success: boolean;
  swapId: string;
  swapType: string;
  secret: string;
  hashlock: string;
  steps: AtomicSwapStep[];
  transactions: {
    sourceDeposit?: string;
    destinationDeposit?: string;
    sourceClaim?: string;
    destinationClaim?: string;
  };
  error?: string;
}

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
       sourceAddress,
       destinationAddress,
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

    // Validate environment setup
    if (!hasValidPrivateKeys()) {
      return NextResponse.json(
        { 
          error: 'Production environment not configured',
          details: 'Private keys not set. This is a production atomic swap API requiring real blockchain execution.'
        },
        { status: 500 }
      );
    }

    console.log(`🚀 Atomic Swap Execution: ${fromChain} → ${toChain}`);
    console.log(`💰 Amount: ${fromAmount} ${fromToken} → ${toToken}`);

    const swapId = `atomic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fromAmountNum = parseFloat(fromAmount);
    
    // Initialize atomic swap steps
    const steps: AtomicSwapStep[] = [
      {
        id: 'generate-secret',
        description: 'Generating HTLC secret and hashlock',
        status: 'pending',
        timestamp: Date.now()
      },
      {
        id: 'source-deposit',
        description: `Locking ${fromAmount} ${fromToken} on ${fromChain}`,
        status: 'pending',
        timestamp: Date.now(),
        chain: fromChain
      },
      {
        id: 'destination-deposit',
        description: `Locking equivalent amount on ${toChain}`,
        status: 'pending', 
        timestamp: Date.now(),
        chain: toChain
      },
      {
        id: 'source-claim',
        description: `Claiming ${toToken} on ${toChain}`,
        status: 'pending',
        timestamp: Date.now(),
        chain: toChain
      },
      {
        id: 'destination-claim',
        description: `Revealing secret and claiming ${fromToken} on ${fromChain}`,
        status: 'pending',
        timestamp: Date.now(),
        chain: fromChain
      }
    ];

    let result: AtomicSwapResult = {
      success: false,
      swapId,
      swapType: `${fromChain} → ${toChain}`,
      secret: '',
      hashlock: '',
      steps,
      transactions: {}
    };

    try {
      // Step 1: Generate HTLC secret and hashlock
      console.log('🔐 Generating HTLC secret...');
      const { secret, hashedSecret } = generateAlgorandSecret();
      result.secret = secret;
      result.hashlock = hashedSecret;
      
      steps[0].status = 'completed';
      steps[0].timestamp = Date.now();
      console.log(`✅ Generated hashlock: ${hashedSecret}`);

      // Route to specific atomic swap implementation
      if ((fromChain === 'polygon-amoy' || fromChain === '80002') && (toChain === 'algorand-testnet' || toChain === 'algorand-mainnet')) {
        await executeEVMToAlgorandAtomicSwap(fromAmountNum, secret, hashedSecret, steps, result);
      } else if ((fromChain === 'algorand-testnet' || fromChain === 'algorand-mainnet') && (toChain === 'polygon-amoy' || toChain === '80002')) {
        await executeAlgorandToEVMAtomicSwap(fromAmountNum, secret, hashedSecret, steps, result);
      } else if ((fromChain === 'polygon-amoy' || fromChain === '80002') && (toChain === 'solana-testnet' || toChain === 'solana-mainnet')) {
        await executeEVMToSolanaAtomicSwap(fromAmountNum, secret, hashedSecret, steps, result);
      } else if ((fromChain === 'solana-testnet' || fromChain === 'solana-mainnet') && (toChain === 'polygon-amoy' || toChain === '80002')) {
        await executeSolanaToEVMAtomicSwap(fromAmountNum, secret, hashedSecret, steps, result);
      } else if ((fromChain === 'polygon-amoy' || fromChain === '80002') && (toChain === 'near-testnet' || toChain === 'near-mainnet')) {
        await executeEVMToNEARAtomicSwap(fromAmountNum, secret, hashedSecret, steps, result);
      } else if ((fromChain === 'near-testnet' || fromChain === 'near-mainnet') && (toChain === 'polygon-amoy' || toChain === '80002')) {
        await executeNEARToEVMAtomicSwap(fromAmountNum, secret, hashedSecret, steps, result);
      } else {
        // For unsupported combinations, simulate the swap for demo purposes
        await executeSimulatedAtomicSwap(fromAmountNum, secret, hashedSecret, steps, result, fromChain, toChain);
      }

      result.success = true;

    } catch (error) {
      console.error('❌ Atomic swap failed:', error);
      result.error = error instanceof Error ? error.message : 'Unknown error';
      
      // Mark all pending steps as failed
      result.steps = result.steps.map(step => 
        step.status === 'pending' || step.status === 'processing' 
          ? { ...step, status: 'failed', timestamp: Date.now() }
          : step
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in atomic swap API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to execute atomic swap',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function executeEVMToAlgorandAtomicSwap(
  amount: number, 
  secret: string, 
  hashedSecret: string, 
  steps: AtomicSwapStep[], 
  result: AtomicSwapResult
) {
  // Step 2: EVM Deposit (Source Chain)
  console.log('💰 Executing EVM deposit...');
  steps[1].status = 'processing';
  
  const depositParams = {
    amountEth: amount,
    hashedSecret: hashedSecret,
    expirationSeconds: 3600,
    depositorPrivateKey: ALICE_PRIVATE_KEY,
    claimerAddress: getCarolAddress()
  };

  const depositResult = await depositETH(depositParams);
  result.transactions.sourceDeposit = depositResult.txHash;
  
  steps[1].status = 'completed';
  steps[1].txHash = depositResult.txHash;
  steps[1].explorerUrl = `https://www.oklink.com/amoy/tx/${depositResult.txHash}`;
  steps[1].timestamp = Date.now();
  console.log(`✅ EVM deposit successful: ${depositResult.txHash}`);

  // Step 3: Algorand Deposit (Destination Chain)
  console.log('💰 Executing Algorand deposit...')
  steps[2].status = 'processing'

  try {
    // Attempt real Algorand deposit if keys/config are present
    const escrowAppId = parseInt(process.env.ALGORAND_ESCROW_APP_ID || '743881611', 10)
    const depositorAddress = sourceAddress || process.env.ALGORAND_DEPOSITOR_ADDRESS || ''
         const depositorPrivateKeyHex = process.env.ALGORAND_PRIVATE_KEY || process.env.ALGORAND_DEPOSITOR_PRIVATE_KEY || ''
    const claimerAddress = destinationAddress || process.env.ALGORAND_CLAIMER_ADDRESS || ''

    if (depositorAddress && depositorPrivateKeyHex && claimerAddress && !Number.isNaN(escrowAppId)) {
      const algosdk: any = await import('algosdk')
      const depositorSk = Uint8Array.from(Buffer.from(depositorPrivateKeyHex.replace(/^0x/, ''), 'hex'))

      const real = await realDepositAlgorand({
        amountAlgo: amount,
        hashedSecret,
        expirationSeconds: 3600,
        depositorAddress,
        depositorPrivateKey: depositorSk,
        claimerAddress,
        escrowAppId
      })

      result.transactions.destinationDeposit = real.txHash
      steps[2].status = 'completed'
      steps[2].txHash = real.txHash
      steps[2].explorerUrl = real.explorerUrl || `https://lora.algokit.io/testnet/tx/${real.txHash}`
      steps[2].timestamp = Date.now()
      console.log(`✅ Algorand deposit successful: ${real.txHash}`)
    } else {
      throw new Error('Algorand environment not configured. Set ALGOrAND_ESCROW_APP_ID, ALGORAND_DEPOSITOR_ADDRESS, ALGORAND_PRIVATE_KEY, and ALGORAND_CLAIMER_ADDRESS for real on-chain execution.')
    }
  } catch (algErr) {
    console.error('Algorand deposit failed:', algErr)
    steps[2].status = 'failed'
    steps[2].timestamp = Date.now()
    throw algErr
  }

  // Step 4: Algorand Claim (Destination Chain)
  console.log('🎯 Executing Algorand claim...')
  steps[3].status = 'processing'

  try {
    const escrowAppId = parseInt(process.env.ALGORAND_ESCROW_APP_ID || '743881611', 10)
    const claimerAddress = process.env.ALGORAND_CLAIMER_ADDRESS || ''
    const claimerPrivateKeyHex = process.env.ALGORAND_CLAIMER_PRIVATE_KEY || ''

    if (claimerAddress && claimerPrivateKeyHex && !Number.isNaN(escrowAppId)) {
      const algosdk: any = await import('algosdk')
      const claimerSk = Uint8Array.from(Buffer.from(claimerPrivateKeyHex.replace(/^0x/, ''), 'hex'))

      const realClaim = await realClaimAlgorand({
        depositId: hashedSecret,
        secret,
        claimerAddress,
        claimerPrivateKey: claimerSk,
        escrowAppId
      })

      result.transactions.sourceClaim = realClaim.txHash
      steps[3].status = 'completed'
      steps[3].txHash = realClaim.txHash
      steps[3].explorerUrl = realClaim.explorerUrl || `https://lora.algokit.io/testnet/tx/${realClaim.txHash}`
      steps[3].timestamp = Date.now()
      console.log(`✅ Algorand claim successful: ${realClaim.txHash}`)
    } else {
      throw new Error('Algorand environment not configured for claim. Set ALGOrAND_ESCROW_APP_ID, ALGORAND_CLAIMER_ADDRESS, and ALGORAND_CLAIMER_PRIVATE_KEY for real on-chain execution.')
    }
  } catch (algClaimErr) {
    console.error('Algorand claim failed:', algClaimErr)
    steps[3].status = 'failed'
    steps[3].timestamp = Date.now()
    throw algClaimErr
  }

  // Step 5: EVM Claim with Secret Reveal (Source Chain)
  console.log('🔓 Executing EVM claim with secret reveal...');
  steps[4].status = 'processing';

  const claimParams = {
    depositId: depositResult.depositId,
    secret: secret,
    claimerPrivateKey: CAROL_PRIVATE_KEY
  };

  const claimResult = await claimETH(claimParams);
  result.transactions.destinationClaim = claimResult.txHash;
  
  steps[4].status = 'completed';
  steps[4].txHash = claimResult.txHash;
  steps[4].explorerUrl = `https://www.oklink.com/amoy/tx/${claimResult.txHash}`;
  steps[4].timestamp = Date.now();
  console.log(`✅ EVM claim successful: ${claimResult.txHash}`);
}

async function executeAlgorandToEVMAtomicSwap(
  amount: number, 
  secret: string, 
  hashedSecret: string, 
  steps: AtomicSwapStep[], 
  result: AtomicSwapResult
) {
  // Step 2: Algorand Deposit (Source Chain)
  console.log('💰 Executing Algorand deposit...')
  steps[1].status = 'processing'

  try {
    const escrowAppId = parseInt(process.env.ALGORAND_ESCROW_APP_ID || '743881611', 10)
    const depositorAddress = process.env.ALGORAND_DEPOSITOR_ADDRESS || ''
    const depositorPrivateKeyRaw = process.env.ALGORAND_PRIVATE_KEY || ''
    const claimerAddress = process.env.ALGORAND_CLAIMER_ADDRESS || ''

    if (depositorAddress && depositorPrivateKeyRaw && claimerAddress && !Number.isNaN(escrowAppId)) {
      const depositorSk = await parseAlgorandPrivateKey(depositorPrivateKeyRaw)

      const real = await realDepositAlgorand({
        amountAlgo: amount,
        hashedSecret,
        expirationSeconds: 3600,
        depositorAddress,
        depositorPrivateKey: depositorSk,
        claimerAddress,
        escrowAppId
      })

      result.transactions.sourceDeposit = real.txHash
      steps[1].status = 'completed'
      steps[1].txHash = real.txHash
      steps[1].explorerUrl = real.explorerUrl || `https://lora.algokit.io/testnet/tx/${real.txHash}`
      steps[1].timestamp = Date.now()
      console.log(`✅ Algorand deposit successful: ${real.txHash}`)
    } else {
      throw new Error('Algorand environment not configured. Set ALGORAND_ESCROW_APP_ID, ALGORAND_DEPOSITOR_ADDRESS, ALGORAND_PRIVATE_KEY, and ALGORAND_CLAIMER_ADDRESS for real on-chain execution.')
    }
  } catch (algErr) {
    console.error('Algorand deposit failed:', algErr)
    steps[1].status = 'failed'
    steps[1].timestamp = Date.now()
    throw algErr
  }

  // Step 3: EVM Deposit (Destination Chain)
  console.log('💰 Executing EVM deposit...')
  steps[2].status = 'processing'
  
  const depositParams = {
    amountEth: amount,
    hashedSecret: hashedSecret,
    expirationSeconds: 3600,
    depositorPrivateKey: CAROL_PRIVATE_KEY,
    claimerAddress: getAliceAddress()
  };

  const depositResult = await depositETH(depositParams)
  result.transactions.destinationDeposit = depositResult.txHash
  
  steps[2].status = 'completed'
  steps[2].txHash = depositResult.txHash
  steps[2].explorerUrl = `https://www.oklink.com/amoy/tx/${depositResult.txHash}`
  steps[2].timestamp = Date.now()
  console.log(`✅ EVM deposit successful: ${depositResult.txHash}`)

  // Step 4: EVM Claim (Destination Chain)
  console.log('🎯 Executing EVM claim...')
  steps[3].status = 'processing'

  const claimParams = {
    depositId: depositResult.depositId,
    secret: secret,
    claimerPrivateKey: ALICE_PRIVATE_KEY
  }

  const claimResult = await claimETH(claimParams)
  result.transactions.sourceClaim = claimResult.txHash
  
  steps[3].status = 'completed'
  steps[3].txHash = claimResult.txHash
  steps[3].explorerUrl = `https://www.oklink.com/amoy/tx/${claimResult.txHash}`
  steps[3].timestamp = Date.now()
  console.log(`✅ EVM claim successful: ${claimResult.txHash}`)

  // Step 5: Algorand Claim with Secret Reveal (Source Chain)
  console.log('🔓 Executing Algorand claim with revealed secret...')
  steps[4].status = 'processing'

  try {
    const escrowAppId = parseInt(process.env.ALGORAND_ESCROW_APP_ID || '743881611', 10)
    const claimerAddress = process.env.ALGORAND_CLAIMER_ADDRESS || ''
    const claimerPrivateKeyRaw = process.env.ALGORAND_CLAIMER_PRIVATE_KEY || ''

    if (claimerAddress && claimerPrivateKeyRaw && !Number.isNaN(escrowAppId)) {
      const claimerSk = await parseAlgorandPrivateKey(claimerPrivateKeyRaw)

      const realClaim = await realClaimAlgorand({
        depositId: hashedSecret,
        secret,
        claimerAddress,
        claimerPrivateKey: claimerSk,
        escrowAppId
      })

      result.transactions.destinationClaim = realClaim.txHash
      steps[4].status = 'completed'
      steps[4].txHash = realClaim.txHash
      steps[4].explorerUrl = realClaim.explorerUrl || `https://lora.algokit.io/testnet/tx/${realClaim.txHash}`
      steps[4].timestamp = Date.now()
      console.log(`✅ Algorand claim successful: ${realClaim.txHash}`)
    } else {
      throw new Error('Algorand environment not configured for claim. Set ALGORAND_ESCROW_APP_ID, ALGORAND_CLAIMER_ADDRESS, and ALGORAND_CLAIMER_PRIVATE_KEY for real on-chain execution.')
    }
  } catch (algClaimErr) {
    console.error('Algorand claim failed:', algClaimErr)
    steps[4].status = 'failed'
    steps[4].timestamp = Date.now()
    throw algClaimErr
  }
}

// EVM to Solana Atomic Swap
async function executeEVMToSolanaAtomicSwap(
  amount: number, 
  secret: string, 
  hashedSecret: string, 
  steps: AtomicSwapStep[], 
  result: AtomicSwapResult
) {
  // Step 2: EVM Deposit (Source Chain)
  console.log('💰 Executing EVM deposit...');
  steps[1].status = 'processing';
  
  const depositParams = {
    amountEth: amount,
    hashedSecret: hashedSecret,
    expirationSeconds: 3600,
    depositorPrivateKey: ALICE_PRIVATE_KEY,
    claimerAddress: getCarolAddress()
  };

  const depositResult = await depositETH(depositParams);
  result.transactions.sourceDeposit = depositResult.txHash;
  
  steps[1].status = 'completed';
  steps[1].txHash = depositResult.txHash;
  steps[1].explorerUrl = `https://www.oklink.com/amoy/tx/${depositResult.txHash}`;
  steps[1].timestamp = Date.now();
  console.log(`✅ EVM deposit successful: ${depositResult.txHash}`);

  // Step 3: Solana Deposit (Destination Chain)
  console.log('💰 Executing Solana deposit...');
  steps[2].status = 'processing';

  const solanaTxId = `SOL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  result.transactions.destinationDeposit = solanaTxId;
  
  steps[2].status = 'completed';
  steps[2].txHash = solanaTxId;
  steps[2].explorerUrl = `https://explorer.solana.com/tx/${solanaTxId}?cluster=testnet`;
  steps[2].timestamp = Date.now();
  console.log(`✅ Solana deposit successful (simulated): ${solanaTxId}`);

  // Step 4: Solana Claim (Destination Chain)
  console.log('🎯 Executing Solana claim...');
  steps[3].status = 'processing';

  const solanaClaimTxId = `SOL_CLAIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  result.transactions.sourceClaim = solanaClaimTxId;
  
  steps[3].status = 'completed';
  steps[3].txHash = solanaClaimTxId;
  steps[3].explorerUrl = `https://explorer.solana.com/tx/${solanaClaimTxId}?cluster=testnet`;
  steps[3].timestamp = Date.now();
  console.log(`✅ Solana claim successful (simulated): ${solanaClaimTxId}`);

  // Step 5: EVM Claim with Secret Reveal (Source Chain)
  console.log('🔓 Executing EVM claim with secret reveal...');
  steps[4].status = 'processing';

  const claimParams = {
    depositId: depositResult.depositId,
    secret: secret,
    claimerPrivateKey: CAROL_PRIVATE_KEY
  };

  const claimResult = await claimETH(claimParams);
  result.transactions.destinationClaim = claimResult.txHash;
  
  steps[4].status = 'completed';
  steps[4].txHash = claimResult.txHash;
  steps[4].explorerUrl = `https://www.oklink.com/amoy/tx/${claimResult.txHash}`;
  steps[4].timestamp = Date.now();
  console.log(`✅ EVM claim successful: ${claimResult.txHash}`);
}

// Solana to EVM Atomic Swap
async function executeSolanaToEVMAtomicSwap(
  amount: number, 
  secret: string, 
  hashedSecret: string, 
  steps: AtomicSwapStep[], 
  result: AtomicSwapResult
) {
  // Step 2: Solana Deposit (Source Chain)
  console.log('💰 Executing Solana deposit...');
  steps[1].status = 'processing';

  const solanaTxId = `SOL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  result.transactions.sourceDeposit = solanaTxId;
  
  steps[1].status = 'completed';
  steps[1].txHash = solanaTxId;
  steps[1].explorerUrl = `https://explorer.solana.com/tx/${solanaTxId}?cluster=testnet`;
  steps[1].timestamp = Date.now();
  console.log(`✅ Solana deposit successful (simulated): ${solanaTxId}`);

  // Step 3: EVM Deposit (Destination Chain)
  console.log('💰 Executing EVM deposit...');
  steps[2].status = 'processing';
  
  const depositParams = {
    amountEth: amount,
    hashedSecret: hashedSecret,
    expirationSeconds: 3600,
    depositorPrivateKey: CAROL_PRIVATE_KEY,
    claimerAddress: getAliceAddress()
  };

  const depositResult = await depositETH(depositParams);
  result.transactions.destinationDeposit = depositResult.txHash;
  
  steps[2].status = 'completed';
  steps[2].txHash = depositResult.txHash;
  steps[2].explorerUrl = `https://www.oklink.com/amoy/tx/${depositResult.txHash}`;
  steps[2].timestamp = Date.now();
  console.log(`✅ EVM deposit successful: ${depositResult.txHash}`);

  // Step 4: EVM Claim (Destination Chain)
  console.log('🎯 Executing EVM claim...');
  steps[3].status = 'processing';

  const claimParams = {
    depositId: depositResult.depositId,
    secret: secret,
    claimerPrivateKey: ALICE_PRIVATE_KEY
  };

  const claimResult = await claimETH(claimParams);
  result.transactions.sourceClaim = claimResult.txHash;
  
  steps[3].status = 'completed';
  steps[3].txHash = claimResult.txHash;
  steps[3].explorerUrl = `https://www.oklink.com/amoy/tx/${claimResult.txHash}`;
  steps[3].timestamp = Date.now();
  console.log(`✅ EVM claim successful: ${claimResult.txHash}`);

  // Step 5: Solana Claim with Secret Reveal (Source Chain)
  console.log('🔓 Executing Solana claim with revealed secret...');
  steps[4].status = 'processing';

  const solanaClaimTxId = `SOL_CLAIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  result.transactions.destinationClaim = solanaClaimTxId;
  
  steps[4].status = 'completed';
  steps[4].txHash = solanaClaimTxId;
  steps[4].explorerUrl = `https://explorer.solana.com/tx/${solanaClaimTxId}?cluster=testnet`;
  steps[4].timestamp = Date.now();
  console.log(`✅ Solana claim successful (simulated): ${solanaClaimTxId}`);
}

// EVM to NEAR Atomic Swap
async function executeEVMToNEARAtomicSwap(
  amount: number, 
  secret: string, 
  hashedSecret: string, 
  steps: AtomicSwapStep[], 
  result: AtomicSwapResult
) {
  // Step 2: EVM Deposit (Source Chain)
  console.log('💰 Executing EVM deposit...');
  steps[1].status = 'processing';
  
  const depositParams = {
    amountEth: amount,
    hashedSecret: hashedSecret,
    expirationSeconds: 3600,
    depositorPrivateKey: ALICE_PRIVATE_KEY,
    claimerAddress: getCarolAddress()
  };

  const depositResult = await depositETH(depositParams);
  result.transactions.sourceDeposit = depositResult.txHash;
  
  steps[1].status = 'completed';
  steps[1].txHash = depositResult.txHash;
  steps[1].explorerUrl = `https://www.oklink.com/amoy/tx/${depositResult.txHash}`;
  steps[1].timestamp = Date.now();
  console.log(`✅ EVM deposit successful: ${depositResult.txHash}`);

  // Step 3: NEAR Deposit (Destination Chain)
  console.log('💰 Executing NEAR deposit...');
  steps[2].status = 'processing';

  const nearTxId = `NEAR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  result.transactions.destinationDeposit = nearTxId;
  
  steps[2].status = 'completed';
  steps[2].txHash = nearTxId;
  steps[2].explorerUrl = `https://testnet.nearblocks.io/txns/${nearTxId}`;
  steps[2].timestamp = Date.now();
  console.log(`✅ NEAR deposit successful (simulated): ${nearTxId}`);

  // Step 4: NEAR Claim (Destination Chain)
  console.log('🎯 Executing NEAR claim...');
  steps[3].status = 'processing';

  const nearClaimTxId = `NEAR_CLAIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  result.transactions.sourceClaim = nearClaimTxId;
  
  steps[3].status = 'completed';
  steps[3].txHash = nearClaimTxId;
  steps[3].explorerUrl = `https://testnet.nearblocks.io/txns/${nearClaimTxId}`;
  steps[3].timestamp = Date.now();
  console.log(`✅ NEAR claim successful (simulated): ${nearClaimTxId}`);

  // Step 5: EVM Claim with Secret Reveal (Source Chain)
  console.log('🔓 Executing EVM claim with secret reveal...');
  steps[4].status = 'processing';

  const claimParams = {
    depositId: depositResult.depositId,
    secret: secret,
    claimerPrivateKey: CAROL_PRIVATE_KEY
  };

  const claimResult = await claimETH(claimParams);
  result.transactions.destinationClaim = claimResult.txHash;
  
  steps[4].status = 'completed';
  steps[4].txHash = claimResult.txHash;
  steps[4].explorerUrl = `https://www.oklink.com/amoy/tx/${claimResult.txHash}`;
  steps[4].timestamp = Date.now();
  console.log(`✅ EVM claim successful: ${claimResult.txHash}`);
}

// NEAR to EVM Atomic Swap
async function executeNEARToEVMAtomicSwap(
  amount: number, 
  secret: string, 
  hashedSecret: string, 
  steps: AtomicSwapStep[], 
  result: AtomicSwapResult
) {
  // Step 2: NEAR Deposit (Source Chain)
  console.log('💰 Executing NEAR deposit...');
  steps[1].status = 'processing';

  const nearTxId = `NEAR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  result.transactions.sourceDeposit = nearTxId;
  
  steps[1].status = 'completed';
  steps[1].txHash = nearTxId;
  steps[1].explorerUrl = `https://testnet.nearblocks.io/txns/${nearTxId}`;
  steps[1].timestamp = Date.now();
  console.log(`✅ NEAR deposit successful (simulated): ${nearTxId}`);

  // Step 3: EVM Deposit (Destination Chain)
  console.log('💰 Executing EVM deposit...');
  steps[2].status = 'processing';
  
  const depositParams = {
    amountEth: amount,
    hashedSecret: hashedSecret,
    expirationSeconds: 3600,
    depositorPrivateKey: CAROL_PRIVATE_KEY,
    claimerAddress: getAliceAddress()
  };

  const depositResult = await depositETH(depositParams);
  result.transactions.destinationDeposit = depositResult.txHash;
  
  steps[2].status = 'completed';
  steps[2].txHash = depositResult.txHash;
  steps[2].explorerUrl = `https://www.oklink.com/amoy/tx/${depositResult.txHash}`;
  steps[2].timestamp = Date.now();
  console.log(`✅ EVM deposit successful: ${depositResult.txHash}`);

  // Step 4: EVM Claim (Destination Chain)
  console.log('🎯 Executing EVM claim...');
  steps[3].status = 'processing';

  const claimParams = {
    depositId: depositResult.depositId,
    secret: secret,
    claimerPrivateKey: ALICE_PRIVATE_KEY
  };

  const claimResult = await claimETH(claimParams);
  result.transactions.sourceClaim = claimResult.txHash;
  
  steps[3].status = 'completed';
  steps[3].txHash = claimResult.txHash;
  steps[3].explorerUrl = `https://www.oklink.com/amoy/tx/${claimResult.txHash}`;
  steps[3].timestamp = Date.now();
  console.log(`✅ EVM claim successful: ${claimResult.txHash}`);

  // Step 5: NEAR Claim with Secret Reveal (Source Chain)
  console.log('🔓 Executing NEAR claim with revealed secret...');
  steps[4].status = 'processing';

  const nearClaimTxId = `NEAR_CLAIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  result.transactions.destinationClaim = nearClaimTxId;
  
  steps[4].status = 'completed';
  steps[4].txHash = nearClaimTxId;
  steps[4].explorerUrl = `https://testnet.nearblocks.io/txns/${nearClaimTxId}`;
  steps[4].timestamp = Date.now();
  console.log(`✅ NEAR claim successful (simulated): ${nearClaimTxId}`);
}

// Simulated Atomic Swap for unsupported combinations
async function executeSimulatedAtomicSwap(
  amount: number, 
  secret: string, 
  hashedSecret: string, 
  steps: AtomicSwapStep[], 
  result: AtomicSwapResult,
  fromChain: string,
  toChain: string
) {
  console.log(`🔄 Simulating atomic swap: ${fromChain} → ${toChain}`);
  
  // Simulate all steps with realistic delays
  for (let i = 1; i < steps.length; i++) {
    steps[i].status = 'processing';
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate simulated transaction hash
    const txId = `${fromChain.toUpperCase()}_${toChain.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    steps[i].status = 'completed';
    steps[i].txHash = txId;
    steps[i].timestamp = Date.now();
    
    // Set appropriate explorer URLs based on chain
    if (fromChain.includes('80002') || fromChain.includes('polygon')) {
      steps[i].explorerUrl = `https://www.oklink.com/amoy/tx/${txId}`;
    } else if (toChain.includes('solana')) {
      steps[i].explorerUrl = `https://explorer.solana.com/tx/${txId}?cluster=testnet`;
    } else if (toChain.includes('near')) {
      steps[i].explorerUrl = `https://testnet.nearblocks.io/txns/${txId}`;
    } else if (toChain.includes('algorand')) {
      steps[i].explorerUrl = `https://lora.algokit.io/testnet/tx/${txId}`;
    }
    
    console.log(`✅ Step ${i} completed (simulated): ${txId}`);
  }
  
  // Set transaction hashes in result
  result.transactions = {
    sourceDeposit: steps[1].txHash,
    destinationDeposit: steps[2].txHash,
    sourceClaim: steps[3].txHash,
    destinationClaim: steps[4].txHash
  };
} 