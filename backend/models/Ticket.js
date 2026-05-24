const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,   // string to handle large BigInt values safely
      required: true,
      unique: true,
    },
    owner: {
      type: String,   // wallet address (lowercase)
      required: true,
      lowercase: true,
    },
    transactionHash: {
      type: String,
      required: true,
    },
    seatInfo: {
      type: String,   // e.g. "Section 1, Row 0, Seat 1"
      default: '',
    },
    ipfsMetadataCID: {
      type: String,
      default: '',
    },
    tokenURI: {
      type: String,   // full tokenURI (ipfs:// or data:)
      default: '',
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
    },
    isListed: {
      type: Boolean,
      default: false,
    },
    resalePrice: {
      type: String,   // in ETH/MATIC as string
    },
    mintedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);
