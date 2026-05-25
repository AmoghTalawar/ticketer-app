const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, email, password, walletAddress, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Check if wallet address already exists in the system
    if (walletAddress) {
      const existingWallet = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (existingWallet) {
        // If this wallet is already linked to a fully registered account, reject it
        if (existingWallet.email || existingWallet.username) {
          return res.status(400).json({ success: false, message: 'Wallet address is already linked to another account' });
        }

        // If it's a placeholder user created by the SIWE /nonce endpoint, update it
        existingWallet.username = username;
        existingWallet.email = email.toLowerCase();
        existingWallet.password = password;
        existingWallet.role = role || 'user';
        await existingWallet.save();

        const token = generateToken(existingWallet._id);

        return res.status(200).json({
          success: true,
          message: 'Account created successfully',
          token,
          user: {
            id: existingWallet._id,
            username: existingWallet.username,
            email: existingWallet.email,
            walletAddress: existingWallet.walletAddress,
            role: existingWallet.role,
          },
        });
      }
    }

    const user = await User.create({
      username,
      email,
      password,
      walletAddress: walletAddress ? walletAddress.toLowerCase() : undefined,
      role: role || 'user',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/nonce — Generate challenge nonce for MetaMask wallet
const getNonce = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ success: false, message: 'walletAddress is required' });
    }

    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      user = await User.create({ walletAddress: walletAddress.toLowerCase() });
    }

    const nonce = user.generateNonce();
    await user.save();

    res.json({
      success: true,
      nonce,
      message: `Sign this message to authenticate with BlockTicket.\nNonce: ${nonce}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/verify — Verify MetaMask signature and return JWT
const verifyWallet = async (req, res) => {
  try {
    const user = req.verifiedUser; // set by wallet.middleware

    // Rotate nonce after successful login
    user.generateNonce();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Wallet authenticated successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      walletAddress: req.user.walletAddress,
      role: req.user.role,
      createdAt: req.user.createdAt,
    },
  });
};

module.exports = { register, login, getNonce, verifyWallet, getMe };
