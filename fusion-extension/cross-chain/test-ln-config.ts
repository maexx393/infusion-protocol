import * as fs from 'fs';
import * as path from 'path';

async function testLightningConfig() {
  try {
    console.log('🔍 Testing Lightning Network configuration...');
    
    // Try to load from btc-side/LN/ln.json first
    const btcSidePath = path.join(__dirname, '../btc-side/LN/ln.json');
    const crossChainPath = path.join(__dirname, 'src/ln.json');
    
    console.log('📁 Checking paths:');
    console.log(`   btc-side path: ${btcSidePath}`);
    console.log(`   cross-chain path: ${crossChainPath}`);
    
    let configPath: string;
    if (fs.existsSync(btcSidePath)) {
      configPath = btcSidePath;
      console.log('✅ Found config at btc-side path');
    } else if (fs.existsSync(crossChainPath)) {
      configPath = crossChainPath;
      console.log('✅ Found config at cross-chain path');
    } else {
      throw new Error('ln.json configuration file not found');
    }
    
    const configData = fs.readFileSync(configPath, 'utf8');
    const nodes = JSON.parse(configData);
    
    console.log('📋 Configuration loaded successfully!');
    console.log(`   Number of nodes: ${nodes.length}`);
    
    nodes.forEach((node: any, index: number) => {
      console.log(`   Node ${index + 1}: ${node.alias} (port: ${node.rest_port})`);
    });
    
    // Check if all required nodes exist
    const requiredNodes = ['alice', 'carol', 'dave'];
    const foundNodes = nodes.map((n: any) => n.alias);
    
    console.log('\n🔍 Checking required nodes:');
    requiredNodes.forEach(nodeName => {
      if (foundNodes.includes(nodeName)) {
        const node = nodes.find((n: any) => n.alias === nodeName);
        console.log(`   ✅ ${nodeName} found (port: ${node.rest_port})`);
      } else {
        console.log(`   ❌ ${nodeName} not found`);
      }
    });
    
    // Check macaroon paths
    console.log('\n🔐 Checking macaroon paths:');
    nodes.forEach((node: any) => {
      const adminMacaroon = node.macaroons.find((m: any) => m.type === 'admin');
      if (adminMacaroon && fs.existsSync(adminMacaroon.path)) {
        console.log(`   ✅ ${node.alias} admin macaroon exists`);
      } else {
        console.log(`   ❌ ${node.alias} admin macaroon missing or invalid path`);
      }
    });
    
    return { nodes };
  } catch (error) {
    console.error('❌ Error testing Lightning config:', error);
    throw error;
  }
}

// Run the test
testLightningConfig()
  .then(() => {
    console.log('\n🎉 Lightning Network configuration test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  }); 