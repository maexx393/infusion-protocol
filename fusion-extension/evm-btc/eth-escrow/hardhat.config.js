require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    polygonAmoy: {
      url: "https://polygon-amoy.g.alchemy.com/v2/E-LLa6qeTOzgnGgIhe8q3",
      accounts: process.env.ALICE_PRIVATE_KEY ? [process.env.ALICE_PRIVATE_KEY] : [],
      chainId: 80002
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  // Explicitly specify which contracts to compile
  compilers: [
    {
      version: "0.8.20",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  ]
}; 