import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { RefreshCw, ShoppingCart, Tag } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TransactionToast from '../components/TransactionToast';
import { useWallet } from '../context/WalletContext';
import { useContract } from '../hooks/useContract';

const GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

const fetchMeta = async (tokenURI) => {
  try {
    if (tokenURI.startsWith('data:application/json;base64,')) {
      const b64 = tokenURI.replace('data:application/json;base64,', '');
      const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    }
    if (tokenURI.startsWith('ipfs://')) {
      const res = await fetch(GATEWAY + tokenURI.replace('ipfs://', ''));
      return await res.json();
    }
    const res = await fetch(tokenURI);
    return await res.json();
  } catch { return null; }
};

const ResaleMarket = () => {
  const navigate = useNavigate();
  const { account, isConnected } = useWallet();
  const { marketplaceRead, marketplaceWrite, getNFTContract } = useContract();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [buying, setBuying] = useState(null); // tokenId being bought

  const loadListings = useCallback(async () => {
    if (!marketplaceRead) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/tickets/resale');
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to fetch listings');

      const items = await Promise.all(
        data.data.map(async (ticket) => {
          const tokenId = ticket.tokenId;
          const contractAddress = ticket.eventId?.contractAddress;
          
          if (!contractAddress) return null;

          try {
            // Verify listing details on-chain
            const onChainListing = await marketplaceRead.listings(contractAddress, tokenId);
            if (!onChainListing.active) return null; // Filter out inactive listings

            const customNFT = getNFTContract(contractAddress, false);
            if (!customNFT) return null;

            const [tokenURI, owner] = await Promise.all([
              customNFT.tokenURI(tokenId),
              customNFT.ownerOf(tokenId)
            ]);

            const metadata = await fetchMeta(tokenURI);

            return {
              tokenId,
              contractAddress,
              seller: onChainListing.seller,
              price: onChainListing.price,
              priceEth: ethers.formatEther(onChainListing.price),
              metadata: ticket.eventId ? {
                name: ticket.eventId.title,
                description: ticket.eventId.description,
                imageUrl: ticket.eventId.imageUrl,
                attributes: [
                  { trait_type: 'Venue', value: ticket.eventId.venue },
                  { trait_type: 'Seat', value: ticket.seatInfo || 'General Admission' }
                ]
              } : metadata,
              owner,
            };
          } catch (err) {
            console.warn(`Failed to verify dynamic listing for token ${tokenId} on contract ${contractAddress}:`, err);
            return null;
          }
        })
      );

      // Filter out null values
      setListings(items.filter(item => item !== null));
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  }, [marketplaceRead, getNFTContract]);

  useEffect(() => { loadListings(); }, [loadListings]);

  const handleBuy = async (tokenId, contractAddress, price) => {
    if (!isConnected) { navigate('/login'); return; }
    if (!marketplaceWrite || !contractAddress) return;

    setBuying(tokenId);
    setToast({ status: 'pending', message: 'Confirm purchase in MetaMask…' });
    try {
      const tx = await marketplaceWrite.buyTicket(contractAddress, tokenId, { value: price });
      setToast({ status: 'pending', message: 'Waiting for confirmation…', txHash: tx.hash });
      await tx.wait();

      // Record purchase in backend
      await fetch('http://localhost:5000/api/tickets/buy-resale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, newOwner: account, transactionHash: tx.hash }),
      });

      setToast({ status: 'success', message: 'Ticket purchased successfully!', txHash: tx.hash });
      setTimeout(() => {
        navigate('/my-tickets');
      }, 1500);
    } catch (err) {
      const msg = err?.reason ?? err?.message ?? 'Transaction failed';
      setToast({ status: 'error', message: msg });
    } finally {
      setBuying(null);
    }
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <Navbar />
      {toast && <TransactionToast {...toast} onClose={() => setToast(null)} />}

      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111', marginBottom: '0.25rem' }}>Resale Market</h1>
            <p style={{ color: '#888' }}>Buy tickets from other fans — price cap enforced on-chain.</p>
          </div>
          <button
            onClick={loadListings}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', color: '#555' }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
            <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
            <p>Loading listings from blockchain…</p>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <Tag size={48} color="#ddd" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: '#111', marginBottom: '0.5rem' }}>No listings yet</h3>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Be the first to list a ticket for resale from My Tickets.</p>
            <button className="btn btn-primary" onClick={() => navigate('/concerts')}>Browse Concerts</button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {listings.map(item => (
            <div key={item.tokenId} style={{ background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
              {/* Image */}
              <div style={{ height: '180px', background: 'linear-gradient(135deg, #111 0%, #2938b8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {item.metadata?.image && !item.metadata.image.startsWith('https://via.placeholder') ? (
                  <img
                    src={item.metadata.image.startsWith('ipfs://') ? GATEWAY + item.metadata.image.replace('ipfs://', '') : item.metadata.image}
                    alt={item.metadata?.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', letterSpacing: '2px' }}>BLOCKTICKET NFT</div>
                )}
                <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '20px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  #{item.tokenId}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '1.25rem' }}>
                <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.5rem', color: '#111' }}>
                  {item.metadata?.name || `BlockTicket #${item.tokenId}`}
                </h3>

                {item.metadata?.attributes && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                    {item.metadata.attributes.slice(0, 3).map(a => (
                      <span key={a.trait_type} style={{ background: '#f0f0f0', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#555' }}>
                        {a.value}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#888', fontSize: '0.85rem' }}>Seller</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#555' }}>
                    {item.seller.slice(0, 8)}…{item.seller.slice(-4)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <span style={{ color: '#888', fontSize: '0.85rem' }}>Price</span>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#111' }}>{item.priceEth} ETH</span>
                </div>

                {item.seller.toLowerCase() === account?.toLowerCase() ? (
                  <div style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    Your listing
                  </div>
                ) : (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: buying === item.tokenId ? 0.7 : 1, cursor: buying === item.tokenId ? 'not-allowed' : 'pointer' }}
                    onClick={() => handleBuy(item.tokenId, item.contractAddress, item.price)}
                    disabled={buying === item.tokenId}
                  >
                    <ShoppingCart size={16} />
                    {buying === item.tokenId ? 'Buying…' : `Buy for ${item.priceEth} ETH`}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResaleMarket;
