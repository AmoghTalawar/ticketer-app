const { uploadMetadata, uploadFile, testConnection } = require('../config/pinata');
const multer = require('multer');

// Memory storage — pass buffer directly to Pinata
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'), false);
  },
});

// GET /api/ipfs/test — verify Pinata credentials work
const testPinata = async (req, res) => {
  try {
    const result = await testConnection();
    res.json({ success: true, message: 'Pinata connected', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Pinata auth failed: ' + error.message });
  }
};

// POST /api/ipfs/upload-image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const cid = await uploadFile(req.file.buffer, req.file.originalname);
    const url = `ipfs://${cid}`;
    const gatewayUrl = `${process.env.PINATA_GATEWAY}/ipfs/${cid}`;
    res.json({ success: true, cid, url, gatewayUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/ipfs/upload-metadata
// Body: { name, description, image (ipfs:// or url), attributes[], seat, event, date, tokenId }
const uploadMetadataHandler = async (req, res) => {
  try {
    const { name, description, image, attributes, seat, event, date, tokenId } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'name is required' });
    }

    const metadata = {
      name,
      description: description || `Official NFT ticket for ${event || name}`,
      image: image || 'https://via.placeholder.com/400x400?text=BlockTicket',
      external_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/ticket/${tokenId || ''}`,
      attributes: attributes || [
        { trait_type: 'Event', value: event || name },
        { trait_type: 'Date', value: date || '' },
        { trait_type: 'Seat', value: seat || '' },
        { trait_type: 'Token ID', value: tokenId?.toString() || '' },
      ],
    };

    const cid = await uploadMetadata(metadata, name);
    const tokenURI = `ipfs://${cid}`;
    const gatewayUrl = `${process.env.PINATA_GATEWAY}/ipfs/${cid}`;

    res.json({ success: true, cid, tokenURI, gatewayUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/ipfs/metadata/:cid
const getMetadata = async (req, res) => {
  try {
    const axios = require('axios');
    const url = `${process.env.PINATA_GATEWAY}/ipfs/${req.params.cid}`;
    const response = await axios.get(url, { timeout: 10000 });
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { upload, uploadImage, uploadMetadataHandler, getMetadata, testPinata };
