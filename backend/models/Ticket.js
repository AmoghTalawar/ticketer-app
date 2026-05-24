const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    tokenId: {
      type: Number,
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    owner: {
      type: String, // wallet address
      required: true,
      lowercase: true,
    },
    mintedAt: {
      type: Date,
      default: Date.now,
    },
    transactionHash: {
      type: String,
      required: true,
    },
    seatInfo: {
      block: String,
      row: String,
      seat: String,
      category: {
        type: String,
        enum: ['VIP', 'Gold', 'Silver', 'General'],
        default: 'General',
      },
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
      type: String, // in MATIC
    },
    ipfsMetadataCID: {
      type: String,
    },
    burnTransactionHash: {
      type: String,
    },
  },
  { timestamps: true }
);

// Compound index: each tokenId is unique per event contract
ticketSchema.index({ tokenId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Ticket', ticketSchema);
