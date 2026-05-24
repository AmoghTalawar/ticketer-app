const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      maxlength: 5000,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: 'India',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    singer: {
      type: String,
      trim: true,
    },
    genre: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['concert', 'festival', 'club', 'virtual', 'other'],
      default: 'concert',
    },
    totalSupply: {
      type: Number,
      required: [true, 'Total ticket supply is required'],
      min: 1,
    },
    ticketPrice: {
      type: String, // stored as string to avoid floating point issues with MATIC
      required: [true, 'Ticket price is required'],
    },
    priceCapPercent: {
      type: Number,
      default: 110, // max 110% of original on resale
      min: 100,
      max: 200,
    },
    contractAddress: {
      type: String,
      lowercase: true,
    },
    ipfsCID: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSoldOut: {
      type: Boolean,
      default: false,
    },
    ticketsSold: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Virtual: remaining supply
eventSchema.virtual('remainingSupply').get(function () {
  return this.totalSupply - this.ticketsSold;
});

// Index for search
eventSchema.index({ title: 'text', singer: 'text', venue: 'text', city: 'text' });

module.exports = mongoose.model('Event', eventSchema);
