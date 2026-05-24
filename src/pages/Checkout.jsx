import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { ethers } from 'ethers';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TransactionToast from '../components/TransactionToast';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../context/WalletContext';
import { CONCERT_IMAGES } from '../constants/images';

// Build a minimal on-chain metadata URI for the ticket
// In production this would be an IPFS CID from Pinata
const buildTokenURI = (seat, eventName, date) => {
  const metadata = {
    name: `BlockTicket — ${eventName}`,
    description: `Official NFT ticket for ${eventName} on ${date}. Seat: ${seat}.`,
    image: 'https://via.placeholder.com/400x400?text=BlockTicket',
    attributes: [
      { trait_type: 'Event', value: eventName },
      { trait_type: 'Date', value: date },
      { trait_type: 'Seat', value: seat },
    ],
  };
  // Encode as a data URI so it works without IPFS in local dev
  return 'data:application/json;base64,' + btoa(JSON.stringify(metadata));
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { nftWrite } = useContract();
  const { account } = useWallet();

  const selectedSeats = location.state?.selectedSeats || ['S1-0-1'];
  const ticketPrice = 399.00;
  const subtotal = location.state?.subtotal || selectedSeats.length * ticketPrice;
  const serviceFee = location.state?.serviceFee || selectedSeats.length * 1.00;
  const total = location.state?.total || subtotal + serviceFee;

  const [toast, setToast] = useState(null); // { status, message, txHash }
  const [minting, setMinting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const closeToast = () => setToast(null);

  const handleMint = async () => {
    if (!agreed) {
      alert('Please agree to the Privacy Policy before proceeding.');
      return;
    }
    if (!nftWrite) {
      alert('Wallet not connected or contract not loaded.');
      return;
    }

    setMinting(true);
    setToast({ status: 'pending', message: 'Waiting for MetaMask confirmation…' });

    try {
      // Fetch the ticket price from the contract (in wei)
      const priceWei = await nftWrite.ticketPrice();

      // Build token URI for the first seat (one mint per checkout for simplicity)
      const seat = selectedSeats[0];
      const tokenURI = buildTokenURI(seat, 'Taylor Swift: The Eras Tour', 'June 04, 2026');

      setToast({ status: 'pending', message: 'Transaction submitted — mining…' });

      const tx = await nftWrite.mintTicket(tokenURI, { value: priceWei });

      setToast({ status: 'pending', message: 'Waiting for confirmation…', txHash: tx.hash });

      const receipt = await tx.wait();

      // Parse TicketMinted event to get tokenId
      const iface = nftWrite.interface;
      let tokenId = null;
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed && parsed.name === 'TicketMinted') {
            tokenId = parsed.args.tokenId.toString();
            break;
          }
        } catch (_) { /* skip non-matching logs */ }
      }

      setToast({ status: 'success', message: 'NFT ticket minted successfully!', txHash: tx.hash });

      // Record in backend (fire-and-forget — don't block navigation)
      fetch('http://localhost:5000/api/tickets/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId,
          owner: account,
          transactionHash: tx.hash,
          seat,
        }),
      }).catch(() => { /* backend optional in local dev */ });

      // Navigate to success page after short delay
      setTimeout(() => {
        navigate('/mint-success', {
          state: { tokenId, txHash: tx.hash, seat },
        });
      }, 1500);

    } catch (err) {
      console.error('Mint error:', err);
      const msg = err?.reason || err?.message || 'Transaction failed';
      setToast({ status: 'error', message: msg });
    } finally {
      setMinting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <Navbar />

      {toast && (
        <TransactionToast
          status={toast.status}
          message={toast.message}
          txHash={toast.txHash}
          onClose={closeToast}
        />
      )}

      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>

        {/* Progress Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          {[
            { label: 'Choose Time', done: true },
            { label: 'Choose Seat', done: true },
            { label: 'Checkout', active: true },
            { label: 'Get Ticket', done: false },
          ].map((step, i, arr) => (
            <div key={step.label} style={{ textAlign: 'center', flex: 1, position: 'relative' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                border: step.active ? '2px solid #111' : '1px solid ' + (step.done ? '#111' : '#ddd'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 0.5rem',
                background: '#fff',
                fontWeight: step.active ? 'bold' : 'normal',
                color: step.done || step.active ? '#111' : '#888',
              }}>
                {step.done ? <Check size={16} /> : i + 1}
              </div>
              <span style={{ fontSize: '0.8rem', color: step.active ? '#111' : (step.done ? '#111' : '#888'), fontWeight: step.active ? 'bold' : 'normal' }}>
                {step.label}
              </span>
              {i < arr.length - 1 && (
                <div style={{ position: 'absolute', top: '16px', right: '-50%', width: '100%', height: '1px', background: step.done ? '#111' : '#ddd' }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111', marginBottom: '0.5rem' }}>Checkout</h1>
          <p style={{ color: '#888' }}>Review your order and mint your NFT ticket on-chain.</p>
        </div>

        <div style={{ display: 'flex', gap: '4rem', alignItems: 'flex-start' }}>

          {/* Left: Ticket List */}
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111', marginBottom: '0.5rem' }}>Your Ticket List</h3>

            {selectedSeats.map(seat => (
              <div key={seat} style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid #eaeaea', paddingBottom: '1.5rem' }}>
                <img src={CONCERT_IMAGES.taylor_swift} alt="Concert" referrerPolicy="no-referrer" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h4 style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Taylor Swift: The Eras Tour</h4>
                  <div style={{ color: '#555', fontSize: '0.9rem', marginBottom: '0.25rem' }}>June 04, Mon. 08:00 pm · VIP Ticket</div>
                  <div style={{ color: '#555', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    Section {seat.split('-')[0].replace('S', '')}, Row {seat.split('-')[1]}, Seat {seat.split('-')[2]}
                  </div>
                  <div style={{ fontWeight: 'bold' }}>0.01 ETH</div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#555', fontSize: '1.1rem' }}>
                <span>Subtotal</span><span>0.01 ETH × {selectedSeats.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', color: '#555', fontSize: '1.1rem' }}>
                <span>Platform Fee</span><span>~2%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.3rem', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem' }}>
                <span>Total <span style={{ fontWeight: 'normal', color: '#888', fontSize: '1.1rem' }}>({selectedSeats.length} ticket{selectedSeats.length > 1 ? 's' : ''})</span></span>
                <span>0.01 ETH</span>
              </div>
            </div>
          </div>

          {/* Right: Payment / Mint */}
          <div style={{ flex: '1', background: '#fff', borderRadius: '16px', padding: '3rem 2rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111', marginBottom: '2rem' }}>Mint NFT Ticket</h3>

            {/* Wallet info */}
            <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '2rem', fontSize: '0.9rem' }}>
              <div style={{ color: '#888', marginBottom: '0.25rem' }}>Connected Wallet</div>
              <div style={{ fontFamily: 'monospace', fontWeight: '600', color: '#111', wordBreak: 'break-all' }}>{account}</div>
            </div>

            {/* What happens */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { step: '1', text: 'MetaMask will ask you to confirm the transaction' },
                { step: '2', text: 'Your ticket is minted as an ERC-721 NFT on-chain' },
                { step: '3', text: 'Token ID and QR code are generated for gate entry' },
              ].map(item => (
                <div key={item.step} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--clr-primary-500)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>
                    {item.step}
                  </div>
                  <p style={{ color: '#555', margin: 0, paddingTop: '4px' }}>{item.text}</p>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                <span>I agree to Ticketer <a href="#" style={{ color: 'var(--clr-primary-500)', textDecoration: 'none' }}>Privacy Policy</a> and understand this transaction is irreversible.</span>
              </label>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', opacity: minting ? 0.7 : 1, cursor: minting ? 'not-allowed' : 'pointer' }}
              onClick={handleMint}
              disabled={minting}
            >
              {minting ? 'Minting…' : 'Mint NFT Ticket (0.01 ETH)'}
            </button>

            <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', marginTop: '1rem' }}>
              Gas fees apply. Make sure your wallet has enough ETH/MATIC.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
