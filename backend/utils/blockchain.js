const { ethers } = require('ethers');

let provider = null;

const getProvider = () => {
  if (!provider) {
    const rpcUrl = process.env.POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology';
    provider = new ethers.JsonRpcProvider(rpcUrl);
  }
  return provider;
};

/**
 * Get a read-only contract instance
 * @param {string} address - Contract address
 * @param {Array} abi - Contract ABI
 */
const getContract = (address, abi) => {
  return new ethers.Contract(address, abi, getProvider());
};

/**
 * Get the current block number
 */
const getBlockNumber = async () => {
  return getProvider().getBlockNumber();
};

/**
 * Verify a MetaMask signature on the backend
 */
const verifySignature = (message, signature) => {
  return ethers.verifyMessage(message, signature);
};

/**
 * Format MATIC value from wei to MATIC string
 */
const formatMatic = (weiValue) => {
  return ethers.formatEther(weiValue);
};

/**
 * Parse MATIC string to wei bigint
 */
const parseMatic = (maticValue) => {
  return ethers.parseEther(maticValue.toString());
};

module.exports = { getProvider, getContract, getBlockNumber, verifySignature, formatMatic, parseMatic };
