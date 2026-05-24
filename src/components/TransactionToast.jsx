import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

/**
 * status: 'pending' | 'success' | 'error'
 * message: string
 * txHash: string (optional)
 * onClose: () => void
 */
const TransactionToast = ({ status, message, txHash, onClose }) => {
  // Auto-dismiss on success/error after 6 seconds
  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const t = setTimeout(onClose, 6000);
      return () => clearTimeout(t);
    }
  }, [status, onClose]);

  const colors = {
    pending: { bg: '#1a1a2e', border: '#4A3AFF', icon: <Loader size={20} color="#4A3AFF" style={{ animation: 'spin 1s linear infinite' }} /> },
    success: { bg: '#0d2818', border: '#28a745', icon: <CheckCircle size={20} color="#28a745" /> },
    error:   { bg: '#2e0d0d', border: '#dc3545', icon: <XCircle size={20} color="#dc3545" /> },
  };

  const c = colors[status] || colors.pending;

  return (
    <>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 9999,
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        maxWidth: '380px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        color: '#fff',
        animation: 'slideIn 0.3s ease',
      }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        <div style={{ marginTop: '2px', flexShrink: 0 }}>{c.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.95rem' }}>{message}</div>
          {txHash && (
            <a
              href={`https://amoy.polygonscan.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#4A3AFF', fontSize: '0.8rem', fontFamily: 'monospace', wordBreak: 'break-all' }}
            >
              {txHash.slice(0, 20)}...{txHash.slice(-8)}
            </a>
          )}
        </div>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1, padding: 0, flexShrink: 0 }}
        >
          ×
        </button>
      </div>
    </>
  );
};

export default TransactionToast;
