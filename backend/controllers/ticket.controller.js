const Ticket = require('../models/Ticket');
const Event  = require('../models/Event');

// POST /api/tickets/mint — Record mint after on-chain tx confirmed (no auth required)
const recordMint = async (req, res) => {
  try {
    const { tokenId, owner, transactionHash, seat, ipfsMetadataCID, tokenURI, eventId } = req.body;

    if (tokenId === undefined || !owner || !transactionHash) {
      return res.status(400).json({
        success: false,
        message: 'tokenId, owner, and transactionHash are required',
      });
    }

    // Upsert — avoid duplicate if frontend retries
    const ticket = await Ticket.findOneAndUpdate(
      { tokenId: tokenId.toString() },
      {
        tokenId: tokenId.toString(),
        eventId: eventId || undefined,
        owner: owner.toLowerCase(),
        transactionHash,
        seatInfo: seat || '',
        ipfsMetadataCID: ipfsMetadataCID || '',
        tokenURI: tokenURI || '',
        isUsed: false,
        isListed: false,
        mintedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Atomically increment ticketsSold on the Event document
    if (eventId) {
      await Event.findByIdAndUpdate(eventId, { $inc: { ticketsSold: 1 } }).catch(() => {});
    }

    res.status(201).json({ success: true, data: ticket, message: 'Ticket recorded' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/tickets/my?wallet=0x... — Get tickets by wallet address
const getMyTickets = async (req, res) => {
  try {
    const wallet = (req.query.wallet || '').toLowerCase();
    if (!wallet) return res.status(400).json({ success: false, message: 'wallet query param required' });

    const tickets = await Ticket.find({ owner: wallet }).populate('eventId').sort({ mintedAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/tickets/:tokenId
const getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ tokenId: req.params.tokenId }).populate('eventId');
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/tickets/list-resale
const listForResale = async (req, res) => {
  try {
    const { tokenId, resalePrice, owner } = req.body;
    const ticket = await Ticket.findOne({ tokenId: tokenId.toString(), owner: owner?.toLowerCase() });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (ticket.isUsed) return res.status(400).json({ success: false, message: 'Used ticket cannot be listed' });

    ticket.isListed = true;
    ticket.resalePrice = resalePrice;
    await ticket.save();
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/tickets/buy-resale
const buyResale = async (req, res) => {
  try {
    const { tokenId, newOwner, transactionHash } = req.body;
    const ticket = await Ticket.findOne({ tokenId: tokenId.toString(), isListed: true });
    if (!ticket) return res.status(404).json({ success: false, message: 'Listing not found' });

    ticket.owner = newOwner.toLowerCase();
    ticket.isListed = false;
    ticket.resalePrice = undefined;
    ticket.transactionHash = transactionHash;
    await ticket.save();
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/tickets/delist/:tokenId
const delistResale = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ tokenId: req.params.tokenId });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    ticket.isListed = false;
    ticket.resalePrice = undefined;
    await ticket.save();
    res.json({ success: true, message: 'Delisted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/tickets/resale — All active listings
const getResaleListings = async (req, res) => {
  try {
    const listings = await Ticket.find({ isListed: true, isUsed: false }).populate('eventId').sort({ updatedAt: -1 });
    res.json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/tickets/mark-used — Gate scanner marks ticket used
const markUsed = async (req, res) => {
  try {
    const { tokenId, transactionHash } = req.body;
    const ticket = await Ticket.findOneAndUpdate(
      { tokenId: tokenId.toString() },
      { isUsed: true, usedAt: new Date(), transactionHash },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/tickets/count?eventId=xxx — Count tickets minted for a specific event
const countByEvent = async (req, res) => {
  try {
    const { eventId } = req.query;
    if (!eventId) return res.status(400).json({ success: false, message: 'eventId query param required' });
    const count = await Ticket.countDocuments({ eventId, isUsed: false });
    // Also count used ones for total sold
    const totalCount = await Ticket.countDocuments({ eventId });
    res.json({ success: true, count: totalCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { recordMint, getMyTickets, getTicket, listForResale, buyResale, delistResale, getResaleListings, markUsed, countByEvent };
