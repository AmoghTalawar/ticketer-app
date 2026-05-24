const { uploadMetadata, uploadFile } = require('../config/pinata');
const multer = require('multer');

// Use memory storage so we pass buffer to Pinata
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'), false);
  },
});

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
const uploadMetadataHandler = async (req, res) => {
  try {
    const { name, description, image, attributes, eventId } = req.body;

    if (!name || !image) {
      return res.status(400).json({ success: false, message: 'name and image are required' });
    }

    const metadata = {
      name,
      description: description || '',
      image,
      external_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/ticket/${eventId || ''}`,
      attributes: attributes || [],
    };

    const cid = await uploadMetadata(metadata, name);
    const tokenURI = `ipfs://${cid}`;

    res.json({ success: true, cid, tokenURI });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/ipfs/metadata/:cid
const getMetadata = async (req, res) => {
  try {
    const axios = require('axios');
    const url = `${process.env.PINATA_GATEWAY}/ipfs/${req.params.cid}`;
    const response = await axios.get(url);
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { upload, uploadImage, uploadMetadataHandler, getMetadata };
