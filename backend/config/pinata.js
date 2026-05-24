const axios = require('axios');

const PINATA_BASE_URL = 'https://api.pinata.cloud';

const pinataHeaders = () => ({
  pinata_api_key: process.env.PINATA_API_KEY,
  pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
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

  const response = await axios.post(
    `${PINATA_BASE_URL}/pinning/pinFileToIPFS`,
    form,
    {
      headers: {
        ...form.getHeaders(),
        ...pinataHeaders(),
      },
      maxContentLength: Infinity,
    }
  );
  return response.data.IpfsHash;
};

module.exports = { uploadMetadata, uploadFile };
