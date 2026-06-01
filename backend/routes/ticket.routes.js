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
  markUsed,
  countByEvent,
} = require('../controllers/ticket.controller');

router.post('/mint', recordMint);
router.get('/my', getMyTickets);
router.get('/count', countByEvent);       // ?eventId=xxx
router.get('/resale', getResaleListings);
router.post('/list-resale', listForResale);
router.post('/buy-resale', buyResale);
router.post('/mark-used', markUsed);
router.delete('/delist/:tokenId', delistResale);
router.get('/:tokenId', getTicket);

module.exports = router;
