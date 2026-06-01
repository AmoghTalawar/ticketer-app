const Event = require('../models/Event');

const PINATA_GATEWAY = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud';

/**
 * Convert any ipfs:// or bare CID imageUrl to a browser-loadable HTTPS Pinata gateway URL.
 * If the url is already https:// it is returned unchanged.
 */
const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('ipfs://')) return `${PINATA_GATEWAY}/ipfs/${url.replace('ipfs://', '')}`;
  if (url.startsWith('Qm') || url.startsWith('baf')) return `${PINATA_GATEWAY}/ipfs/${url}`;
  return url;
};

/** Normalize imageUrl on a plain event object */
const normalizeEvent = (event) => {
  const obj = event.toObject ? event.toObject() : { ...event };
  obj.imageUrl = resolveImageUrl(obj.imageUrl);
  return obj;
};

// GET /api/events
const getEvents = async (req, res) => {
  try {
    const { singer, city, date, category, organizer, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };

    if (singer) filter.singer = { $regex: singer, $options: 'i' };
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (category) filter.category = category;
    if (organizer) filter.organizer = organizer;
    if (date) {
      const d = new Date(date);
      filter.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate('organizer', 'username walletAddress')
        .sort({ date: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Event.countDocuments(filter),
    ]);

    const normalizedEvents = events.map(normalizeEvent);

    res.json({
      success: true,
      data: normalizedEvents,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/events/:id
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'username walletAddress');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, data: normalizeEvent(event) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/events — Organizer only
const createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      organizer: req.user._id,
    });
    res.status(201).json({ success: true, data: event, message: 'Event created' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/events/:id — Organizer only
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/events/:id — Organizer only
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Event.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Event cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/events/:id/availability
const getAvailability = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select('totalSupply ticketsSold isSoldOut');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    res.json({
      success: true,
      data: {
        totalSupply: event.totalSupply,
        ticketsSold: event.ticketsSold,
        remaining: event.totalSupply - event.ticketsSold,
        isSoldOut: event.isSoldOut,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent, getAvailability };
