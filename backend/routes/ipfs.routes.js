const express = require('express');
const router = express.Router();
const { upload, uploadImage, uploadMetadataHandler, getMetadata, testPinata } = require('../controllers/ipfs.controller');

// No auth required for local dev — add protect middleware in production
router.get('/test', testPinata);
router.post('/upload-image', upload.single('image'), uploadImage);
router.post('/upload-metadata', uploadMetadataHandler);
router.get('/metadata/:cid', getMetadata);

module.exports = router;
