const Ticket = require('../models/Ticket');

// POST /api/verify/scan — Verify ticket on-chain, mark as used
const scanTicket = async (req, res) => {
  try {
    const { tokenId, ownerAddress } = req.body;

    if (!tokenId) {
      return res.status(400).json({ success: false, message: 'tokenId is required' });
    }

    const ticket = await Ticket.findOne({ tokenId }).populate('eventId', 'title date venue singer');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Ticket not found in database',
      });
    }

    if (ticket.isUsed) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Ticket already used',
        usedAt: ticket.usedAt,
      });
    }

    // Optional: cross-check owner address
    if (ownerAddress && ticket.owner.toLowerCase() !== ownerAddress.toLowerCase()) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Ownership mismatch',
      });
    }

    // Mark as used
    ticket.isUsed = true;
    ticket.usedAt = new Date();
    await ticket.save();

    res.json({
      success: true,
      valid: true,
      message: '✅ Ticket verified — Entry granted',
      data: {
        tokenId: ticket.tokenId,
        owner: ticket.owner,
        event: ticket.eventId,
        seatInfo: ticket.seatInfo,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/verify/status/:tokenId
const getTicketStatus = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ tokenId: req.params.tokenId });

    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    res.json({
      success: true,
      data: {
        tokenId: ticket.tokenId,
        isUsed: ticket.isUsed,
        isListed: ticket.isListed,
        owner: ticket.owner,
        usedAt: ticket.usedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { scanTicket, getTicketStatus };
