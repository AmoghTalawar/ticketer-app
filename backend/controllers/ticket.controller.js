const Ticket = require('../models/Ticket');
const Event = require('../models/Event');

// POST /api/tickets/mint — Record mint after on-chain tx confirmed
const recordMint = async (req, res) => {
  try {
    const { tokenId, eventId, transactionHash, seatInfo, ipfsMetadataCID } = req.body;

    if (!tokenId || !eventId || !transactionHash) {
      return res.status(400).json({
        success: false,
        message: 'tokenId, eventId, and transactionHash are required',
      });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const ticket = await Ticket.create({
      tokenId,
      eventId,
      owner: req.user.walletAddress,
      transactionHash,
      seatInfo,
      ipfsMetadataCID,
    });

    // Increment tickets sold count
    event.ticketsSold += 1;
    if (event.ticketsSold >= event.totalSupply) event.isSoldOut = true;
    await event.save();

    res.status(201).json({ success: true, data: ticket, message: 'Ticket minted and recorded' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Token ID already exists for this event' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/tickets/my — Get user's tickets
const getMyTickets = async (req, res) => {
  try {
    const walletAddress = req.user.walletAddress;
    if (!walletAddress) {
      return res.status(400).json({ success: false, message: 'No wallet address linked to account' });
    }

    const tickets = await Ticket.find({ owner: walletAddress.toLowerCase() })
      .populate('eventId', 'title date venue city singer imageUrl')
      .sort({ mintedAt: -1 });

    res.json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/tickets/:tokenId — Get single ticket
const getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ tokenId: req.params.tokenId })
      .populate('eventId', 'title date venue city singer imageUrl ticketPrice');

    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/tickets/list-resale — List ticket for resale
const listForResale = async (req, res) => {
  try {
    const { tokenId, resalePrice } = req.body;
    const ticket = await Ticket.findOne({ tokenId, owner: req.user.walletAddress?.toLowerCase() });

    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found or not owned by you' });
    if (ticket.isUsed) return res.status(400).json({ success: false, message: 'Used ticket cannot be listed' });

    ticket.isListed = true;
    ticket.resalePrice = resalePrice;
    await ticket.save();

    res.json({ success: true, data: ticket, message: 'Ticket listed for resale' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/tickets/buy-resale — Purchase resale ticket
const buyResale = async (req, res) => {
  try {
    const { tokenId, transactionHash } = req.body;
    const ticket = await Ticket.findOne({ tokenId, isListed: true });

    if (!ticket) return res.status(404).json({ success: false, message: 'Listing not found' });

    ticket.owner = req.user.walletAddress.toLowerCase();
    ticket.isListed = false;
    ticket.resalePrice = undefined;
    ticket.transactionHash = transactionHash;
    await ticket.save();

    res.json({ success: true, data: ticket, message: 'Resale ticket purchased' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/tickets/delist/:tokenId
const delistResale = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      tokenId: req.params.tokenId,
      owner: req.user.walletAddress?.toLowerCase(),
    });

    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    ticket.isListed = false;
    ticket.resalePrice = undefined;
    await ticket.save();

    res.json({ success: true, message: 'Ticket delisted from resale' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/tickets/resale — All active resale listings
const getResaleListings = async (req, res) => {
  try {
    const listings = await Ticket.find({ isListed: true, isUsed: false })
      .populate('eventId', 'title date venue city singer imageUrl')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { recordMint, getMyTickets, getTicket, listForResale, buyResale, delistResale, getResaleListings };
