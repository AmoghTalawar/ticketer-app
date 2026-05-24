const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getAvailability,
} = require('../controllers/event.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

router.get('/', getEvents);
router.get('/:id', getEvent);
router.get('/:id/availability', getAvailability);

router.post('/', protect, requireRole('organizer', 'admin'), createEvent);
router.put('/:id', protect, requireRole('organizer', 'admin'), updateEvent);
router.delete('/:id', protect, requireRole('organizer', 'admin'), deleteEvent);

module.exports = router;
