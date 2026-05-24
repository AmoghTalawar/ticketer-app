const express = require('express');
const router = express.Router();
const {
  recordMint,
  getMyTickets,
  getTicket,
  listForResale,
  buyResale,
  delistResale,
  getResaleListings,
} = require('../controllers/ticket.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/resale', getResaleListings);          // Public: all resale listings
router.get('/my', protect, getMyTickets);           // Auth: user's own tickets
router.get('/:tokenId', getTicket);                 // Public: single ticket by tokenId

router.post('/mint', protect, recordMint);          // Auth: record a mint
router.post('/list-resale', protect, listForResale);
router.post('/buy-resale', protect, buyResale);
router.delete('/delist/:tokenId', protect, delistResale);

module.exports = router;
