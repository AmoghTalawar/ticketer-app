const express = require('express');
const router = express.Router();
const { register, login, getNonce, verifyWallet, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { verifyWalletSignature } = require('../middleware/wallet.middleware');

// Email / Password Auth
router.post('/register', register);
router.post('/login', login);

// MetaMask Wallet Auth (Sign-In with Ethereum)
router.post('/nonce', getNonce);
router.post('/verify', verifyWalletSignature, verifyWallet);

// Protected
router.get('/me', protect, getMe);

module.exports = router;
