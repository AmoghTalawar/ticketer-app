const express = require('express');
const router = express.Router();
const { upload, uploadImage, uploadMetadataHandler, getMetadata } = require('../controllers/ipfs.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/upload-image', protect, upload.single('image'), uploadImage);
router.post('/upload-metadata', protect, uploadMetadataHandler);
router.get('/metadata/:cid', getMetadata);

module.exports = router;
