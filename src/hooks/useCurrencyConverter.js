/**
 * useCurrencyConverter — Fetches live ETH/INR rate and exposes helpers.
 *
 * Design decision:
 *   - Internally, ALL blockchain transactions use ETH (wei).
 *   - Externally (UI), all prices are shown in Indian Rupees (₹) for clarity.
 *   - The conversion is display-only; the smart contract always receives ETH.
 *   - Rate is fetched from CoinGecko (free, no API key needed).
 *   - Falls back to a fixed rate of ₹2,00,000 per ETH if the fetch fails.
 */

import { useState, useEffect, useCallback } from 'react';

const FALLBACK_ETH_INR = 200000; // ₹2,00,000 per ETH fallback
const CACHE_KEY = 'blockticket_eth_inr_rate';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const useCurrencyConverter = () => {
  const [ethInrRate, setEthInrRate] = useState(null);  // null = loading
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const fetchRate = useCallback(async () => {
    // Check cache first
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
        setEthInrRate(cached.rate);
        setLoading(false);
        return;
      }
    } catch (_) {}

    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr',
        { signal: AbortSignal.timeout(5000) }
      );
      if (!res.ok) throw new Error('Rate fetch failed');
      const data = await res.json();
      const rate = data?.ethereum?.inr;
      if (!rate) throw new Error('Invalid response');

      setEthInrRate(rate);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ rate, ts: Date.now() }));
      setError(null);
    } catch (err) {
      console.warn('[useCurrencyConverter] Using fallback ETH/INR rate:', err.message);
      setEthInrRate(FALLBACK_ETH_INR);
      setError('live rate unavailable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRate();
    // Refresh every 5 minutes while page is open
    const timer = setInterval(fetchRate, CACHE_TTL_MS);
    return () => clearInterval(timer);
  }, [fetchRate]);

  /**
   * Convert ETH amount to INR string.
   * @param {number|string} ethAmount - e.g. 0.01
   * @returns {string} e.g. "₹2,000"
   */
  const ethToInr = useCallback((ethAmount) => {
    const rate = ethInrRate ?? FALLBACK_ETH_INR;
    const inr = parseFloat(ethAmount || 0) * rate;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(inr);
  }, [ethInrRate]);

  /**
   * Convert ETH amount to a compact INR number (no symbol) for inputs.
   * @param {number|string} ethAmount
   * @returns {number}
   */
  const ethToInrNumber = useCallback((ethAmount) => {
    const rate = ethInrRate ?? FALLBACK_ETH_INR;
    return Math.round(parseFloat(ethAmount || 0) * rate);
  }, [ethInrRate]);

  /**
   * Format a price display with INR primary and ETH secondary.
   * Returns: { inr: "₹2,000", eth: "0.01 ETH" }
   */
  const formatPrice = useCallback((ethAmount) => {
    return {
      inr: ethToInr(ethAmount),
      eth: `${parseFloat(ethAmount || 0).toFixed(4).replace(/\.?0+$/, '')} ETH`,
    };
  }, [ethToInr]);

  return {
    ethInrRate: ethInrRate ?? FALLBACK_ETH_INR,
    loading,
    error,
    ethToInr,
    ethToInrNumber,
    formatPrice,
    refresh: fetchRate,
  };
};
