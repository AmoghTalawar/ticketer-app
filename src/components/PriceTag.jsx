/**
 * PriceTag — Displays a price in INR (primary) with ETH shown as a small badge.
 *
 * Usage:
 *   <PriceTag eth={0.01} />          → ₹2,000  [0.01 ETH]
 *   <PriceTag eth={0.01} size="lg" /> → larger variant for checkout
 *   <PriceTag eth={0.01} ethOnly />   → 0.01 ETH  (for blockchain-facing displays)
 */

import React from 'react';
import { useCurrencyConverter } from '../hooks/useCurrencyConverter';

const PriceTag = ({
  eth,              // number or string, e.g. 0.01 or "0.01"
  size = 'md',      // 'sm' | 'md' | 'lg'
  showEth = true,   // show the ETH badge
  ethOnly = false,  // show only ETH (no INR conversion)
  style = {},
}) => {
  const { ethToInr, loading } = useCurrencyConverter();

  const amount = parseFloat(eth || 0);

  if (ethOnly) {
    return (
      <span style={{ fontWeight: 700, ...style }}>
        {amount.toFixed(4).replace(/\.?0+$/, '')} ETH
      </span>
    );
  }

  const fontSize = size === 'lg' ? '1.6rem' : size === 'sm' ? '0.95rem' : '1.15rem';
  const badgeFontSize = size === 'lg' ? '0.75rem' : '0.65rem';

  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.4rem', ...style }}>
      {/* Primary: Indian Rupees */}
      <span style={{
        fontWeight: 800,
        fontSize,
        color: 'var(--clr-primary-500, #4f46e5)',
        letterSpacing: '-0.5px',
      }}>
        {loading ? '₹...' : ethToInr(amount)}
      </span>

      {/* Secondary: ETH badge */}
      {showEth && (
        <span
          title={`${amount} ETH — actual blockchain transaction amount`}
          style={{
            fontSize: badgeFontSize,
            fontWeight: 600,
            color: '#6b7280',
            background: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '999px',
            padding: '1px 6px',
            cursor: 'help',
            whiteSpace: 'nowrap',
            lineHeight: 1.5,
          }}
        >
          ≈ {amount.toFixed(4).replace(/\.?0+$/, '')} ETH
        </span>
      )}
    </span>
  );
};

export default PriceTag;
