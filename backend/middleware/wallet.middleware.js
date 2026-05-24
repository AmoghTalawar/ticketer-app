const { ethers } = require('ethers');
const User = require('../models/User');

/**
 * Middleware to verify a MetaMask wallet signature.
 * Expects: { walletAddress, signature } in req.body
 * Verifies the signature matches the nonce stored for that address.
 */
const verifyWalletSignature = async (req, res, next) => {
  const { walletAddress, signature } = req.body;

  if (!walletAddress || !signature) {
    return res.status(400).json({
      success: false,
      message: 'walletAddress and signature are required',
    });
  }

  try {
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user || !user.nonce) {
      return res.status(401).json({
        success: false,
        message: 'No nonce found. Request a nonce first.',
      });
    }

    const message = `Sign this message to authenticate with BlockTicket.\nNonce: ${user.nonce}`;
    const recovered = ethers.verifyMessage(message, signature);

    if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: 'Signature verification failed',
      });
    }

    req.verifiedUser = user;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { verifyWalletSignature };
