import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useWallet } from '../context/WalletContext';
import { CHAIN_ID, CONTRACT_ADDRESSES } from '../contracts/addresses';

const BACKEND = 'http://localhost:5000';

const TransactionHistory = () => {
  const navigate = useNavigate();
  const { account } = useWallet();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const explorerBase = CHAIN_ID === 1337 || CHAIN_ID === 31337
    ? null
    : 'https://amoy.polygonscan.com/tx/';

  const load = async () => {
    if (!account) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/tickets/my?wallet=${account}`);
      const data = await res.json();
      if (data.success) setTickets(data.data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [account]);

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <Navbar />

      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111' }}>Transaction History</h1>
          <button
            onClick={load}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', color: '#555' }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>Loading…</div>
        )}

        {!loading && tickets.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <p style={{ color: '#888' }}>No transactions recorded yet. Mint a ticket to see history here.</p>
          </div>
        )}

        {!loading && tickets.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
             <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                <tr>
                  {['Token ID', 'Seat', 'Status', 'Minted At', 'Transaction', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.9rem', color: '#555' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => {
                  const contractAddress = t.eventId?.contractAddress || CONTRACT_ADDRESSES.TicketNFT;
                  const metadata = t.eventId ? {
                    name: `${t.eventId.title} - Ticket #${t.tokenId}`,
                    description: t.eventId.description,
                    imageUrl: t.eventId.imageUrl,
                    attributes: [
                      { trait_type: 'Venue', value: t.eventId.venue },
                      { trait_type: 'Seat', value: t.seatInfo || 'General Admission' },
                    ]
                  } : {
                    name: `BlockTicket #${t.tokenId}`,
                    description: `Official NFT Ticket #${t.tokenId}`,
                    imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=600',
                    attributes: [
                      { trait_type: 'Venue', value: 'Decentralized Arena' },
                      { trait_type: 'Seat', value: t.seatInfo || 'General Admission' },
                    ]
                  };
                  const qrValue = `BLOCKTICKET:${contractAddress}:${t.tokenId}:${account}`;

                  return (
                    <tr key={t._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace', fontWeight: '600' }}>#{t.tokenId}</td>
                      <td style={{ padding: '1rem 1.5rem', color: '#555', fontSize: '0.9rem' }}>{t.seatInfo || '—'}</td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                          background: t.isUsed ? '#dc354520' : t.isListed ? '#ffc10720' : '#28a74520',
                          color: t.isUsed ? '#dc3545' : t.isListed ? '#856404' : '#28a745',
                        }}>
                          {t.isUsed ? 'USED' : t.isListed ? 'LISTED' : 'VALID'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: '#555', fontSize: '0.85rem' }}>
                        {new Date(t.mintedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        {explorerBase ? (
                          <a href={explorerBase + t.transactionHash} target="_blank" rel="noopener noreferrer"
                            style={{ color: 'var(--clr-primary-500)', fontFamily: 'monospace', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {t.transactionHash.slice(0, 10)}… <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#555' }}>
                            {t.transactionHash.slice(0, 14)}…
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {!t.isUsed && (
                            <button
                              onClick={() => navigate('/ticket', { state: { tokenId: t.tokenId, metadata, qrValue } })}
                              style={{
                                background: '#111', color: '#fff', border: 'none', borderRadius: '6px',
                                padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600'
                              }}
                            >
                              Download
                            </button>
                          )}
                          {!t.isUsed && !t.isListed && (
                            <button
                              onClick={() => navigate('/my-tickets')}
                              style={{
                                background: 'transparent', color: '#111', border: '1px solid #111', borderRadius: '6px',
                                padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600'
                              }}
                            >
                              Resell
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TransactionHistory;
