import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { QRCodeSVG } from 'qrcode.react';
import { RefreshCw, Tag, Download } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useWallet } from '../context/WalletContext';
import { useContract } from '../hooks/useContract';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import TicketNFTAbi from '../contracts/TicketNFT.json';

// Decode a data-URI or ipfs:// tokenURI into a metadata object
const fetchMetadata = async (tokenURI) => {
  try {
    if (tokenURI.startsWith('data:application/json;base64,')) {
      const base64 = tokenURI.replace('data:application/json;base64,', '');
      // Use TextDecoder for UTF-8 safe decoding
      const binary = atob(base64);
      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      const json = new TextDecoder().decode(bytes);
      return JSON.parse(json);
    }
    if (tokenURI.startsWith('ipfs://')) {
      const cid = tokenURI.replace('ipfs://', '');
      const res = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
      return await res.json();
    }
    // Plain URL
    const res = await fetch(tokenURI);
    return await res.json();
  } catch {
    return null;
  }
};

const MyTickets = () => {
  const navigate = useNavigate();
  const { account } = useWallet();
  const { marketplaceWrite, getNFTContract } = useContract();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listingTokenId, setListingTokenId] = useState(null);
  const [listPrice, setListPrice] = useState('');
  const [txStatus, setTxStatus] = useState({}); // tokenId → 'listing' | 'done' | 'error'

  const loadTickets = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/tickets/my?wallet=${account}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to fetch tickets');

      const items = await Promise.all(
        data.data.map(async (ticket) => {
          const tokenId = ticket.tokenId;
          const contractAddress = ticket.eventId?.contractAddress || CONTRACT_ADDRESSES.TicketNFT;
          
          let isUsed = ticket.isUsed;
          let currentOwner = ticket.owner;
          let tokenURI = ticket.tokenURI;
          
          // Query live blockchain data if contractAddress is available
          if (contractAddress) {
            try {
              const customNFT = getNFTContract(contractAddress, false);
              if (customNFT) {
                const [onChainUsed, onChainOwner, onChainURI] = await Promise.all([
                  customNFT.ticketUsed(tokenId),
                  customNFT.ownerOf(tokenId),
                  customNFT.tokenURI(tokenId)
                ]);
                isUsed = onChainUsed;
                currentOwner = onChainOwner.toLowerCase();
                tokenURI = onChainURI;
              }
            } catch (blockchainErr) {
              console.warn(`Failed to fetch on-chain status for token ${tokenId} on contract ${contractAddress}:`, blockchainErr);
            }
          }
          
          return {
            tokenId,
            tokenURI,
            isUsed,
            currentOwner,
            contractAddress,
            metadata: ticket.eventId ? {
              name: `${ticket.eventId.title} - Ticket #${tokenId}`,
              description: ticket.eventId.description,
              imageUrl: ticket.eventId.imageUrl,
              attributes: [
                { trait_type: 'Venue', value: ticket.eventId.venue },
                { trait_type: 'Seat', value: ticket.seatInfo || 'General Admission' },
              ]
            } : {
              name: `BlockTicket #${tokenId}`,
              description: `Official NFT Ticket #${tokenId}`,
              imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=600',
              attributes: [
                { trait_type: 'Venue', value: 'Decentralized Arena' },
                { trait_type: 'Seat', value: ticket.seatInfo || 'General Admission' },
              ]
            }
          };
        })
      );

      // Only display tickets that this user currently owns on-chain
      const ownedItems = items.filter(item => item.currentOwner.toLowerCase() === account.toLowerCase());
      setTickets(ownedItems);
    } catch (err) {
      setError('Failed to load tickets: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  }, [getNFTContract, account]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  // QR code value: tokenId + ownerAddress + contractAddress (used by gate scanner)
  const qrValue = (tokenId, contractAddress) => `BLOCKTICKET:${contractAddress}:${tokenId}:${account}`;

  const handleListForResale = async (tokenId, contractAddress) => {
    if (!marketplaceWrite || !listPrice || !contractAddress) return;
    setTxStatus(s => ({ ...s, [tokenId]: 'listing' }));
    try {
      const priceWei = ethers.parseEther(listPrice);

      // Step 1: approve marketplace to transfer the NFT on the dynamic contract
      const customNFTWrite = getNFTContract(contractAddress, true);
      if (!customNFTWrite) throw new Error("Could not initialize contract write instance");

      const approveTx = await customNFTWrite.approve(CONTRACT_ADDRESSES.TicketMarketplace, tokenId);
      await approveTx.wait();

      // Step 2: list on marketplace
      const listTx = await marketplaceWrite.listTicket(contractAddress, tokenId, priceWei);
      await listTx.wait();

      // Step 3: notify backend of listing
      await fetch('http://localhost:5000/api/tickets/list-resale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, resalePrice: listPrice, owner: account })
      });

      setTxStatus(s => ({ ...s, [tokenId]: 'done' }));
      setListingTokenId(null);
      setListPrice('');
      await loadTickets();
    } catch (err) {
      console.error(err);
      setTxStatus(s => ({ ...s, [tokenId]: 'error' }));
    }
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <Navbar />

      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111' }}>My NFT Tickets</h1>
          <button
            onClick={loadTickets}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', color: '#555' }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
            <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
            <p>Loading your NFT tickets from the blockchain…</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && (
          <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '12px', padding: '1.5rem', color: '#856404', marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        {!loading && !error && tickets.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ marginBottom: '1rem', color: '#111' }}>No Tickets Found</h3>
            <p style={{ color: '#888', marginBottom: '2rem' }}>You don't have any NFT tickets in your wallet yet.</p>
            <button className="btn btn-primary" onClick={() => navigate('/concerts')}>Browse Concerts</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {tickets.map(ticket => (
            <div key={ticket.tokenId} style={{ background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', display: 'flex' }}>

              {/* QR Code panel */}
              <div style={{ background: '#111', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', minWidth: '180px' }}>
                <QRCodeSVG
                  value={qrValue(ticket.tokenId, ticket.contractAddress)}
                  size={120}
                  bgColor="#111"
                  fgColor="#fff"
                  level="H"
                />
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  #{ticket.tokenId}
                </span>
              </div>

              {/* Ticket info */}
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111', margin: 0 }}>
                      {ticket.metadata?.name || `BlockTicket #${ticket.tokenId}`}
                    </h3>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                      background: ticket.isUsed ? '#dc354520' : '#28a74520',
                      color: ticket.isUsed ? '#dc3545' : '#28a745',
                    }}>
                      {ticket.isUsed ? 'USED' : 'VALID'}
                    </span>
                  </div>

                  {ticket.metadata?.description && (
                    <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                      {ticket.metadata.description}
                    </p>
                  )}

                  {ticket.metadata?.attributes && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                      {ticket.metadata.attributes.map(attr => (
                        <span key={attr.trait_type} style={{ background: '#f0f0f0', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.8rem', color: '#555' }}>
                          <strong>{attr.trait_type}:</strong> {attr.value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!ticket.isUsed && (
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-outline-dark"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      onClick={() => navigate('/ticket', { state: { tokenId: ticket.tokenId, metadata: ticket.metadata, qrValue: qrValue(ticket.tokenId, ticket.contractAddress) } })}
                    >
                      <Download size={14} /> Download Ticket
                    </button>

                    {listingTokenId === ticket.tokenId ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          placeholder="Price in ETH"
                          value={listPrice}
                          onChange={e => setListPrice(e.target.value)}
                          style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd', width: '140px', outline: 'none' }}
                        />
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', opacity: txStatus[ticket.tokenId] === 'listing' ? 0.7 : 1 }}
                          onClick={() => handleListForResale(ticket.tokenId, ticket.contractAddress)}
                          disabled={txStatus[ticket.tokenId] === 'listing'}
                        >
                          {txStatus[ticket.tokenId] === 'listing' ? 'Listing…' : 'Confirm'}
                        </button>
                        <button
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#888' }}
                          onClick={() => { setListingTokenId(null); setListPrice(''); }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                        onClick={() => setListingTokenId(ticket.tokenId)}
                      >
                        <Tag size={14} /> Resell Ticket
                      </button>
                    )}

                    {txStatus[ticket.tokenId] === 'done' && (
                      <span style={{ color: '#28a745', fontSize: '0.85rem', alignSelf: 'center' }}>✓ Listed on marketplace</span>
                    )}
                    {txStatus[ticket.tokenId] === 'error' && (
                      <span style={{ color: '#dc3545', fontSize: '0.85rem', alignSelf: 'center' }}>Transaction failed</span>
                    )}
                  </div>
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

export default MyTickets;
