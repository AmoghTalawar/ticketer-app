/**
 * resolveImageUrl — converts any image URL to a browser-loadable HTTPS URL.
 *
 * Problems this solves:
 *  - Old events stored imageUrl as "ipfs://Qm..." — browsers cannot fetch ipfs:// directly.
 *  - New events store the Pinata gateway HTTPS URL — these load fine.
 *  - Some events may have no imageUrl at all.
 *
 * @param {string|null|undefined} url - The raw image URL from MongoDB
 * @param {string} [fallback] - Fallback image URL if everything fails
 * @returns {string} A browser-loadable HTTPS URL
 */
export const PINATA_GATEWAY = 'https://gateway.pinata.cloud';

export const resolveImageUrl = (url, fallback = '') => {
  if (!url) return fallback;

  // Already an HTTP/HTTPS URL — return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // ipfs://CID or ipfs://CID/path — convert to Pinata gateway HTTPS
  if (url.startsWith('ipfs://')) {
    const cid = url.replace('ipfs://', '');
    return `${PINATA_GATEWAY}/ipfs/${cid}`;
  }

  // Bare CID (starts with Qm or bafk) — wrap in gateway
  if (url.startsWith('Qm') || url.startsWith('baf')) {
    return `${PINATA_GATEWAY}/ipfs/${url}`;
  }

  // Unknown format — return as-is and let onError handle it
  return url;
};

/**
 * Default placeholder image shown when an event image fails to load.
 */
export const DEFAULT_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop';
