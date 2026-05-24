const QRCode = require('qrcode');

/**
 * Generate a QR code data URL from ticket data
 * @param {Object} ticketData - { tokenId, owner, eventId }
 * @returns {string} Base64 PNG data URL
 */
const generateQRCode = async (ticketData) => {
  const payload = JSON.stringify({
    tokenId: ticketData.tokenId,
    owner: ticketData.owner,
    eventId: ticketData.eventId,
  });
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'H',
    width: 300,
    margin: 2,
  });
};

/**
 * Generate a QR code SVG string
 */
const generateQRCodeSVG = async (ticketData) => {
  const payload = JSON.stringify(ticketData);
  return QRCode.toString(payload, { type: 'svg' });
};

module.exports = { generateQRCode, generateQRCodeSVG };
