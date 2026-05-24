require("@nomicfoundation/hardhat-toolbox");
try { require("dotenv").config(); } catch (_) {}

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
// Only include accounts array if private key looks valid (64 hex chars)
const amoyAccounts = PRIVATE_KEY && /^[0-9a-fA-F]{64}$/.test(PRIVATE_KEY)
  ? [PRIVATE_KEY]
  : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.26",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    amoy: {
      url: process.env.POLYGON_AMOY_RPC || "https://rpc-amoy.polygon.technology",
      accounts: amoyAccounts,
      chainId: 80002,
    },
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
