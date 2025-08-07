// BTC Orders
export class OrderBTC2EVM {
  constructor(
    public amountBtc: number,
    public amountEth: number,
    public ethAddress: string
  ) {}
}

export class OrderBTC2EVMResponse {
  constructor(
    public lightningNetworkInvoice: string
  ) {}
}

export class OrderEVM2BTC {
  constructor(
    public amountBtc: number,
    public btcLightningNetInvoice: string,
    public amountEth: number
  ) {}
}

export class OrderEVM2BTCResponse {
  constructor(
    public ethAddress: string,
  ) {}
}

// NEAR Orders
export class OrderNEAR2EVM {
  constructor(
    public amountNear: number,
    public amountEth: number,
    public ethAddress: string
  ) {}
}

export class OrderNEAR2EVMResponse {
  constructor(
    public ethAddress: string
  ) {}
}

export class OrderEVM2NEAR {
  constructor(
    public amountNear: number,
    public nearInvoice: string,
    public amountEth: number
  ) {}
}

export class OrderEVM2NEARResponse {
  constructor(
    public nearInvoice: string
  ) {}
}

// Algorand Orders
export class OrderAlgorand2EVM {
  constructor(
    public amountAlgo: number,
    public amountEth: number,
    public ethAddress: string
  ) {}
}

export class OrderAlgorand2EVMResponse {
  constructor(
    public ethAddress: string
  ) {}
}

export class OrderEVM2Algorand {
  constructor(
    public amountAlgo: number,
    public algorandInvoice: string,
    public amountEth: number
  ) {}
}

export class OrderEVM2AlgorandResponse {
  constructor(
    public algorandInvoice: string
  ) {}
}

// Solana Orders
export class OrderSolana2EVM {
  constructor(
    public amountSol: number,
    public amountEth: number,
    public ethAddress: string
  ) {}
}

export class OrderSolana2EVMResponse {
  constructor(
    public ethAddress: string
  ) {}
}

export class OrderEVM2Solana {
  constructor(
    public amountSol: number,
    public solanaInvoice: string,
    public amountEth: number
  ) {}
}

export class OrderEVM2SolanaResponse {
  constructor(
    public solanaInvoice: string
  ) {}
}
