import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

// Create HTTPS agent that ignores SSL certificate verification for development
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export interface LightningNode {
  alias: string;
  rest_port: string;
  macaroons: Array<{
    type: string;
    path: string;
  }>;
  channels?: Array<{
    remote_pubkey: string;
    local_pubkey: string;
    remote_alias: string;
    channel_point: string;
  }>;
}

export interface LightningInvoice {
  payment_request: string;
  r_hash: string;
  add_index: string;
  payment_addr: string;
  value: string;
  cltv_expiry: string;
  expiry: string;
  private: boolean;
  amt_paid: string;
  amt_paid_sat: string;
  amt_paid_msat: string;
  state: string;
  htlcs: any[];
  features: Record<string, any>;
  is_keysend: boolean;
}

export interface LightningConfig {
  nodes: LightningNode[];
}

/**
 * Issues a Lightning Network invoice using the LND REST API
 * @param amountBtc - Amount in BTC
 * @param nodeAlias - Alias of the node to issue invoice from (default: 'alice')
 * @param memo - Optional memo for the invoice
 * @returns Promise<LightningInvoice> - Invoice details
 */
export async function issueLightningInvoice(
  amountBtc: number,
  nodeAlias: string = 'alice',
  memo?: string
): Promise<LightningInvoice> {
  try {
    console.log(`📝 Issuing Lightning Network invoice...`);
    console.log(`   Node: ${nodeAlias}`);
    console.log(`   Amount: ${amountBtc} BTC`);
    
    // Load LN configuration
    const lnConfig = await loadLightningConfig();
    
    // Find the specified node
    const node = lnConfig.nodes.find(n => n.alias === nodeAlias);
    if (!node) {
      throw new Error(`Node with alias '${nodeAlias}' not found in configuration`);
    }
    
    // Find admin macaroon
    const adminMacaroon = node.macaroons.find(m => m.type === 'admin');
    if (!adminMacaroon) {
      throw new Error(`Admin macaroon not found for node '${nodeAlias}'`);
    }
    
    // Check if macaroon file exists
    if (!fs.existsSync(adminMacaroon.path)) {
      throw new Error(`Admin macaroon file not found at: ${adminMacaroon.path}`);
    }
    
    // Read macaroon file and convert to hex
    const macaroonBuffer = fs.readFileSync(adminMacaroon.path);
    const macaroonHex = macaroonBuffer.toString('hex');
    
    // Convert BTC to satoshis
    const amountSatoshis = Math.floor(amountBtc * 100000000);
    
    // Prepare request data
    const requestData = {
      value: amountSatoshis.toString(),
      memo: memo || `Cross-chain swap payment for ${amountBtc} BTC`,
      expiry: '3600' // 1 hour expiry
    };
    
    // Make API request to LND to create invoice
    const response = await fetch(`https://localhost:${node.rest_port}/v1/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Grpc-Metadata-macaroon': macaroonHex
      },
      body: JSON.stringify(requestData),
      // @ts-ignore - Node.js fetch supports agent
      agent: httpsAgent
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LND invoice creation failed with status ${response.status}: ${errorText}`);
    }
    
    const invoiceData = await response.json() as LightningInvoice;
    
    console.log('✅ Lightning invoice issued successfully on node \'' + nodeAlias + '\'');
    console.log(`   Amount: ${amountBtc} BTC (${amountSatoshis} satoshis)`);
    console.log(`   Payment Request: ${invoiceData.payment_request.substring(0, 25)}...`);
    
    return invoiceData;
    
  } catch (error) {
    console.error('❌ Failed to issue Lightning invoice:', error);
    throw error;
  }
}

/**
 * Loads Lightning Network configuration from JSON file
 */
async function loadLightningConfig(): Promise<LightningConfig> {
  try {
    // Try to load from btc-side/LN/ln.json first
    const btcSidePath = path.join(__dirname, '../../../btc-side/LN/ln.json');
    const crossChainPath = path.join(__dirname, 'ln.json');
    
    let configPath: string;
    if (fs.existsSync(btcSidePath)) {
      configPath = btcSidePath;
      console.log('📁 Using btc-side configuration');
    } else if (fs.existsSync(crossChainPath)) {
      configPath = crossChainPath;
      console.log('📁 Using cross-chain configuration');
    } else {
      throw new Error('ln.json configuration file not found');
    }
    
    const configData = fs.readFileSync(configPath, 'utf8');
    const parsedConfig = JSON.parse(configData);
    
    // Ensure the config has the expected structure
    if (!Array.isArray(parsedConfig)) {
      throw new Error('Invalid configuration format: expected array of nodes');
    }
    
    console.log(`📋 Loaded configuration with ${parsedConfig.length} nodes`);
    
    return { nodes: parsedConfig };
    
  } catch (error) {
    console.error('❌ Error loading Lightning config:', error);
    throw error;
  }
}

/**
 * Validates that a Lightning Network node is accessible
 * @param nodeAlias - Alias of the node to validate
 * @returns Promise<boolean> - True if node is accessible
 */
export async function validateLightningNode(nodeAlias: string = 'alice'): Promise<boolean> {
  try {
    const lnConfig = await loadLightningConfig();
    const node = lnConfig.nodes.find(n => n.alias === nodeAlias);
    
    if (!node) {
      console.log(`❌ Node '${nodeAlias}' not found in configuration`);
      return false;
    }
    
    const adminMacaroon = node.macaroons.find(m => m.type === 'admin');
    if (!adminMacaroon || !fs.existsSync(adminMacaroon.path)) {
      console.log(`❌ Admin macaroon not found for node '${nodeAlias}'`);
      return false;
    }
    
    const macaroonBuffer = fs.readFileSync(adminMacaroon.path);
    const macaroonHex = macaroonBuffer.toString('hex');
    
    const response = await fetch(`https://localhost:${node.rest_port}/v1/getinfo`, {
      headers: {
        'Grpc-Metadata-macaroon': macaroonHex
      },
      // @ts-ignore - Node.js fetch supports agent
      agent: httpsAgent
    });
    
    if (response.ok) {
      console.log(`✅ Node '${nodeAlias}' is accessible`);
      return true;
    } else {
      console.log(`❌ Node '${nodeAlias}' is not accessible (status: ${response.status})`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Error validating node '${nodeAlias}':`, error);
    return false;
  }
}

export interface PaymentReceipt {
  secret: string;
  paymentHash: string;
  amount: number;
  timestamp: Date;
}

/**
 * Pays a Lightning Network invoice using the LND REST API
 * @param paymentRequest - The Lightning Network payment request (invoice)
 * @param nodeAlias - Alias of the node to pay from (default: 'alice')
 * @returns Promise<PaymentReceipt> - Payment details including the secret
 */
export async function payLightningInvoice(
  paymentRequest: string,
  nodeAlias: string = 'alice'
): Promise<PaymentReceipt> {
  try {
    console.log(`⚡ Paying Lightning Network invoice...`);
    console.log(`   Invoice: ${paymentRequest.substring(0, 25)}...`);
    
    // Load LN configuration
    const lnConfig = await loadLightningConfig();
    
    // Find the specified node
    const node = lnConfig.nodes.find(n => n.alias === nodeAlias);
    if (!node) {
      throw new Error(`Node with alias '${nodeAlias}' not found in configuration`);
    }
    
    // Find admin macaroon
    const adminMacaroon = node.macaroons.find(m => m.type === 'admin');
    if (!adminMacaroon) {
      throw new Error(`Admin macaroon not found for node '${nodeAlias}'`);
    }
    
    // Check if macaroon file exists
    if (!fs.existsSync(adminMacaroon.path)) {
      throw new Error(`Admin macaroon file not found at: ${adminMacaroon.path}`);
    }
    
    // Read macaroon file and convert to hex
    const macaroonBuffer = fs.readFileSync(adminMacaroon.path);
    const macaroonHex = macaroonBuffer.toString('hex');
    
    // First, decode the payment request to get the amount
    const decodeResponse = await fetch(`https://localhost:${node.rest_port}/v1/payreq/${encodeURIComponent(paymentRequest)}`, {
      method: 'GET',
      headers: {
        'Grpc-Metadata-macaroon': macaroonHex
      },
      // @ts-ignore - Node.js fetch supports agent
      agent: httpsAgent
    });
    
    if (!decodeResponse.ok) {
      const errorText = await decodeResponse.text();
      throw new Error(`Failed to decode payment request with status ${decodeResponse.status}: ${errorText}`);
    }
    
    const decodedData = await decodeResponse.json() as any;
    const amountSatoshis = parseInt(decodedData.num_satoshis || '0');
    const amountBtc = amountSatoshis / 100000000;
    
    // Prepare request data for payment
    const requestData = {
      payment_request: paymentRequest
    };
    
    // Make API request to LND to pay the invoice
    const response = await fetch(`https://localhost:${node.rest_port}/v1/channels/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Grpc-Metadata-macaroon': macaroonHex
      },
      body: JSON.stringify(requestData),
      // @ts-ignore - Node.js fetch supports agent
      agent: httpsAgent
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LND payment request failed with status ${response.status}: ${errorText}`);
    }
    
    const paymentData = await response.json() as any;
    
    // Extract payment details
    const receipt: PaymentReceipt = {
      secret: paymentData.payment_preimage,
      paymentHash: paymentData.payment_hash,
      amount: amountBtc, // Use the amount from decoded payment request
      timestamp: new Date()
    };
    
    console.log('✅ Lightning payment successful');
    console.log(`   Secret: ${receipt.secret}`);
    console.log(`   Payment Hash: ${receipt.paymentHash}`);
    console.log(`   Amount: ${receipt.amount} BTC`);
    console.log(`   Timestamp: ${receipt.timestamp.toISOString()}`);
    
    return receipt;
    
  } catch (error) {
    console.error('❌ Failed to pay Lightning invoice:', error);
    throw error;
  }
}

export interface LNChannelBalance {
  channelPoint: string;
  remotePubkey: string;
  remoteAlias: string;
  localBalance: number;
  remoteBalance: number;
}

export interface LNNodeBalances {
  nodeAlias: string;
  onchainBalance: number; // in satoshis
  channels: LNChannelBalance[];
  totalLocalBalance: number; // sum of all local channel balances
  totalRemoteBalance: number; // sum of all remote channel balances
}

/**
 * Gets balances for a Lightning Network node
 * @param nodeAlias - Alias of the node to get balances for
 * @returns Promise<LNNodeBalances> - Node balance information
 */
export async function getLNBalances(nodeAlias: string): Promise<LNNodeBalances> {
  try {
    // Load LN configuration
    const lnConfig = await loadLightningConfig();
    
    // Find the specified node
    const node = lnConfig.nodes.find(n => n.alias === nodeAlias);
    if (!node) {
      throw new Error(`Node with alias '${nodeAlias}' not found in configuration`);
    }
    
    // Find admin macaroon
    const adminMacaroon = node.macaroons.find(m => m.type === 'admin');
    if (!adminMacaroon) {
      throw new Error(`Admin macaroon not found for node '${nodeAlias}'`);
    }
    
    // Check if macaroon file exists
    if (!fs.existsSync(adminMacaroon.path)) {
      throw new Error(`Admin macaroon file not found at: ${adminMacaroon.path}`);
    }
    
    // Read macaroon file and convert to hex
    const macaroonBuffer = fs.readFileSync(adminMacaroon.path);
    const macaroonHex = macaroonBuffer.toString('hex');
    
    // Get on-chain balance
    const balanceResponse = await fetch(`https://localhost:${node.rest_port}/v1/balance/blockchain`, {
      headers: {
        'Grpc-Metadata-macaroon': macaroonHex
      },
      // @ts-ignore - Node.js fetch supports agent
      agent: httpsAgent
    });
    
    if (!balanceResponse.ok) {
      throw new Error(`Failed to get on-chain balance for node '${nodeAlias}'`);
    }
    
    const balanceData = await balanceResponse.json() as any;
    const onchainBalance = parseInt(balanceData.total_balance || '0');
    
    // Get channel balances
    const channelsResponse = await fetch(`https://localhost:${node.rest_port}/v1/channels`, {
      headers: {
        'Grpc-Metadata-macaroon': macaroonHex
      },
      // @ts-ignore - Node.js fetch supports agent
      agent: httpsAgent
    });
    
    if (!channelsResponse.ok) {
      throw new Error(`Failed to get channel balances for node '${nodeAlias}'`);
    }
    
    const channelsData = await channelsResponse.json() as any;
    const channels = channelsData.channels || [];
    
    // Process channel balances
    const channelBalances: LNChannelBalance[] = [];
    let totalLocalBalance = 0;
    let totalRemoteBalance = 0;
    
    for (const channel of channels) {
      const localBalance = parseInt(channel.local_balance || '0');
      const remoteBalance = parseInt(channel.remote_balance || '0');
      
      totalLocalBalance += localBalance;
      totalRemoteBalance += remoteBalance;
      
      // Try to find remote alias from configuration
      let remoteAlias = 'unknown';
      for (const configNode of lnConfig.nodes) {
        if (configNode.channels) {
          const configChannel = configNode.channels.find(c => c.channel_point === channel.channel_point);
          if (configChannel) {
            remoteAlias = configChannel.remote_alias;
            break;
          }
        }
      }
      
      channelBalances.push({
        channelPoint: channel.channel_point,
        remotePubkey: channel.remote_pubkey,
        remoteAlias: remoteAlias,
        localBalance: localBalance,
        remoteBalance: remoteBalance
      });
    }
    
    return {
      nodeAlias: nodeAlias,
      onchainBalance: onchainBalance,
      channels: channelBalances,
      totalLocalBalance: totalLocalBalance,
      totalRemoteBalance: totalRemoteBalance
    };
    
  } catch (error) {
    console.error(`❌ Failed to get balances for node '${nodeAlias}':`, error);
    throw error;
  }
}

/**
 * Prints the change in balances between two balance snapshots
 * @param balancesBefore - Balance snapshot before operation
 * @param balancesAfter - Balance snapshot after operation
 */
export function printLNBalancesChange(balancesBefore: LNNodeBalances, balancesAfter: LNNodeBalances): void {
  console.log(`\n📊 Balance Changes for ${balancesBefore.nodeAlias}:`);
  console.log(`   On-chain: ${balancesBefore.onchainBalance} → ${balancesAfter.onchainBalance} (${balancesAfter.onchainBalance - balancesBefore.onchainBalance})`);
  console.log(`   Local Channels: ${balancesBefore.totalLocalBalance} → ${balancesAfter.totalLocalBalance} (${balancesAfter.totalLocalBalance - balancesBefore.totalLocalBalance})`);
  console.log(`   Remote Channels: ${balancesBefore.totalRemoteBalance} → ${balancesAfter.totalRemoteBalance} (${balancesAfter.totalRemoteBalance - balancesBefore.totalRemoteBalance})`);
} 