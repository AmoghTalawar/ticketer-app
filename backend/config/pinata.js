const axios = require('axios');

const PINATA_BASE_URL = 'https://api.pinata.cloud';

// Use JWT auth — more reliable than API key/secret pair
const pinataHeaders = () => ({
  Authorization: `Bearer ${process.env.PINATA_JWT}`,
  'Content-Type': 'application/json',
});

/**
 * Upload JSON metadata to IPFS via Pinata
 * @param {Object} metadata - JSON object to upload
 * @param {string} name - Pinata pin name
 * @returns {string} IPFS CID
 */
const uploadMetadata = async (metadata, name = 'BlockTicket Metadata') => {
  const response = await axios.post(
    `${PINATA_BASE_URL}/pinning/pinJSONToIPFS`,
    {
      pinataContent: metadata,
      pinataMetadata: { name },
      pinataOptions: { cidVersion: 1 },
    },
    { headers: pinataHeaders() }
  );
  return response.data.IpfsHash;
};

/**
 * Upload file (Buffer) to IPFS via Pinata
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - File name
 * @returns {string} IPFS CID
 */
const uploadFile = async (buffer, filename) => {
  const FormData = require('form-data');
  const form = new FormData();
  form.append('file', buffer, { filename });
  form.append('pinataMetadata', JSON.stringify({ name: filename }));
  form.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

  const response = await axios.post(
    `${PINATA_BASE_URL}/pinning/pinFileToIPFS`,
    form,
    {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    }
  );
  return response.data.IpfsHash;
};

/**
 * Test Pinata connection
 */
const testConnection = async () => {
  const response = await axios.get(
    `${PINATA_BASE_URL}/data/testAuthentication`,
    { headers: pinataHeaders() }
  );
  return response.data;
};

module.exports = { uploadMetadata, uploadFile, testConnection };
