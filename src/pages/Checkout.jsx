import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { ethers } from 'ethers';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TransactionToast from '../components/TransactionToast';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../context/WalletContext';
import { CONCERT_IMAGES } from '../constants/images';
import { CHAIN_ID, CONTRACT_ADDRESSES } from '../contracts/addresses';

// Build a minimal on-chain metadata URI for the ticket in case IPFS fails
const buildTokenURI = (seat, eventName, date, imageUrl) => {
  const metadata = {
    name: `BlockTicket - ${eventName}`,
    description: `Official NFT ticket for ${eventName} on ${date}. Seat: ${seat}.`,
    image: imageUrl || 'https://via.placeholder.com/400x400?text=BlockTicket',
    attributes: [
      { trait_type: 'Event', value: eventName },
      { trait_type: 'Date', value: date },
      { trait_type: 'Seat', value: seat },
    ],
  };
  const json = JSON.stringify(metadata);
  const bytes = new TextEncoder().encode(json);
  const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
  return 'data:application/json;base64,' + btoa(binary);
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getNFTContract } = useContract();
  const { account, chainId, switchNetwork } = useWallet();

  // Load custom event data from state, fallback to Taylor Swift
  const event = location.state?.event || {
    _id: 'default',
    title: 'Taylor Swift: The Eras Tour',
    ticketPrice: '0.01',
    date: '2026-06-04T20:00:00.000Z',
    venue: 'Royal Albert Hall',
    imageUrl: CONCERT_IMAGES.taylor_swift,
    contractAddress: CONTRACT_ADDRESSES.TicketNFT
  };

  const selectedSeats = location.state?.selectedSeats || ['S1-0-1'];
  const ticketPrice = parseFloat(event.ticketPrice || '0.01');
  const subtotal = selectedSeats.length * ticketPrice;
  const serviceFee = selectedSeats.length * (ticketPrice * 0.05); // 5% fee
  const total = subtotal + serviceFee;

  const [toast, setToast] = useState(null);
  const [minting, setMinting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [onChainPrice, setOnChainPrice] = useState(null); // fetched once on mount

  const isWrongNetwork = chainId !== CHAIN_ID;
  const closeToast = () => setToast(null);

  // Set up contract instances for read/write
  const contractAddress = event.contractAddress || CONTRACT_ADDRESSES.TicketNFT;
  const nftReadCustom = getNFTContract(contractAddress, false);
  const nftWriteCustom = getNFTContract(contractAddress, true);

  // Fetch ticket price from contract using the READ provider (no signer needed)
  useEffect(() => {
    if (!nftReadCustom) return;
    nftReadCustom.ticketPrice()
      .then(p => setOnChainPrice(p))
      .catch(err => {
        console.warn('Could not fetch ticketPrice from contract:', err.message);
        setOnChainPrice(ethers.parseEther(event.ticketPrice || '0.01'));
      });
  }, [nftReadCustom, event.ticketPrice]);

  const handleMint = async () => {
    if (!agreed) {
      alert('Please agree to the Privacy Policy before proceeding.');
      return;
    }
    if (!nftWriteCustom) {
      alert('Wallet not connected. Please connect MetaMask first.');
      return;
    }

    // Check network via MetaMask directly
    const metamaskChainId = parseInt(
      await window.ethereum.request({ method: 'eth_chainId' }), 16
    );
    if (metamaskChainId !== CHAIN_ID) {
      setToast({
        status: 'error',
        message: `Wrong network (Chain ID ${metamaskChainId}). Please switch MetaMask to Hardhat Local (Chain ID ${CHAIN_ID} — localhost:8545).`,
      });
      return;
    }

    setMinting(true);
    setToast({ status: 'pending', message: 'Waiting for MetaMask confirmation…' });

    try {
      // Pre-flight contract check
      const code = await nftReadCustom.runner.provider.getCode(contractAddress);
      if (code === '0x') {
        throw new Error(
          `Contract not found at address ${contractAddress}. Make sure your local chain is running and deployed.`
        );
      }

      // Use fetched price or fall back to event price
      const priceWei = onChainPrice ?? ethers.parseEther(event.ticketPrice || '0.01');

      const seat = selectedSeats[0];
      const seatLabel = `Section ${seat.split('-')[0].replace('S','')}, Row ${seat.split('-')[1]}, Seat ${seat.split('-')[2]}`;
      const formattedDateStr = new Date(event.date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });

      // ── Step 1: Upload metadata to IPFS via Pinata ──────────────────────
      setToast({ status: 'pending', message: 'Uploading ticket metadata to IPFS…' });

      let tokenURI;
      let ipfsCID = '';
      try {
        const ipfsRes = await fetch('http://localhost:5000/api/ipfs/upload-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `BlockTicket - ${event.title}`,
            description: `Official NFT ticket for ${event.title} at ${event.venue} on ${formattedDateStr}. Seat: ${seatLabel}.`,
            image: event.imageUrl,
            event: event.title,
            date: formattedDateStr,
            seat: seatLabel,
            attributes: [
              { trait_type: 'Event', value: event.title },
              { trait_type: 'Venue', value: event.venue },
              { trait_type: 'Date', value: formattedDateStr },
              { trait_type: 'Seat', value: seatLabel },
              { trait_type: 'Category', value: 'VIP' },
            ],
          }),
        });
        const ipfsData = await ipfsRes.json();
        if (ipfsData.success) {
          tokenURI = ipfsData.tokenURI;   // ipfs://CID
          ipfsCID = ipfsData.cid;
        } else {
          throw new Error('IPFS upload failed: ' + ipfsData.message);
        }
      } catch (ipfsErr) {
        // Fall back to data URI if backend/Pinata is unavailable
        console.warn('IPFS upload failed, using data URI fallback:', ipfsErr.message);
        tokenURI = buildTokenURI(seatLabel, event.title, formattedDateStr, event.imageUrl);
      }

      // ── Step 2: Mint NFT on-chain ────────────────────────────────────────
      setToast({ status: 'pending', message: 'Confirm transaction in MetaMask…' });

      const tx = await nftWriteCustom.mintTicket(tokenURI, { value: priceWei });

      setToast({ status: 'pending', message: 'Transaction submitted — waiting for confirmation…', txHash: tx.hash });

      const receipt = await tx.wait();

      // Parse TicketMinted event to get tokenId
      const iface = nftWriteCustom.interface;
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

      // ── Step 3: Record in MongoDB ────────────────────────────────────────
      fetch('http://localhost:5000/api/tickets/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId,
          owner: account,
          transactionHash: tx.hash,
          seat: seatLabel,
          ipfsMetadataCID: ipfsCID,
          tokenURI,
          eventId: event._id === 'default' ? undefined : event._id
        }),
      }).catch((e) => { console.warn('Non-blocking: Failed to save ticket in DB:', e); });

      // Clean event stats (increment ticketsSold in DB)
      if (event._id !== 'default') {
        fetch(`http://localhost:5000/api/events/${event._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('blockticket_token')}`
          },
          body: JSON.stringify({
            ticketsSold: (event.ticketsSold || 0) + 1
          })
        }).catch(() => {});
      }

      setTimeout(() => {
        navigate('/mint-success', { state: { tokenId, txHash: tx.hash, seat: seatLabel, ipfsCID, tokenURI, event } });
      }, 1500);

    } catch (err) {
      console.error('Mint error:', err);
      const msg = err?.reason
        ?? err?.data?.message
        ?? err?.message
        ?? 'Transaction failed or was rejected';
      setToast({ status: 'error', message: msg });
    } finally {
      setMinting(false);
    }
  };

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', weekday: 'short'
  });
  const formattedTime = new Date(event.date).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit'
  });

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', color: '#111' }}>
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
                <img src={event.imageUrl} alt="Concert" referrerPolicy="no-referrer" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h4 style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{event.title}</h4>
                  <div style={{ color: '#555', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{formattedDate} at {formattedTime} · VIP Ticket</div>
                  <div style={{ color: '#555', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    Section {seat.split('-')[0].replace('S', '')}, Row {seat.split('-')[1]}, Seat {seat.split('-')[2]}
                  </div>
                  <div style={{ fontWeight: 'bold' }}>{ticketPrice} MATIC</div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#555', fontSize: '1.1rem' }}>
                <span>Subtotal</span><span>{ticketPrice} MATIC × {selectedSeats.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', color: '#555', fontSize: '1.1rem' }}>
                <span>Platform Fee</span><span>~2%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.3rem', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem' }}>
                <span>Total <span style={{ fontWeight: 'normal', color: '#888', fontSize: '1.1rem' }}>({selectedSeats.length} ticket{selectedSeats.length > 1 ? 's' : ''})</span></span>
                <span>{total.toFixed(3)} MATIC</span>
              </div>
            </div>
          </div>

          {/* Right: Payment / Mint */}
          <div style={{ flex: '1', background: '#fff', borderRadius: '16px', padding: '3rem 2rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111', marginBottom: '2rem' }}>Mint NFT Ticket</h3>

            {/* Wrong network warning */}
            {isWrongNetwork && (
              <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <span style={{ color: '#856404', fontSize: '0.9rem', fontWeight: '600' }}>
                  ⚠ Wrong network. Switch to Chain ID {CHAIN_ID} (Hardhat Local).
                </span>
                <button
                  onClick={switchNetwork}
                  style={{ background: '#856404', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.35rem 0.75rem', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                >
                  Switch
                </button>
              </div>
            )}

            {/* Wallet info */}
            <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '2rem', fontSize: '0.9rem' }}>
              <div style={{ color: '#888', marginBottom: '0.25rem' }}>Connected Wallet</div>
              <div style={{ fontFamily: 'monospace', fontWeight: '600', color: '#111', wordBreak: 'break-all' }}>{account}</div>
              <div style={{ color: '#888', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                Ticket price: <strong style={{ color: '#111' }}>{onChainPrice ? ethers.formatEther(onChainPrice) + ' MATIC' : 'loading…'}</strong>
              </div>
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
              {minting ? 'Minting…' : `Mint NFT Ticket (${onChainPrice ? ethers.formatEther(onChainPrice) : ticketPrice} MATIC)`}
            </button>

            <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', marginTop: '1rem' }}>
              Gas fees apply. Make sure your wallet has enough MATIC.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
