const express = require('express');
const router = express.Router();
const { scanTicket, getTicketStatus } = require('../controllers/verify.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

router.post('/scan', protect, requireRole('organizer', 'admin'), scanTicket);
router.get('/status/:tokenId', getTicketStatus);

module.exports = router;
