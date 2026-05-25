import React, { useState, useRef, useEffect, useCallback } from 'react';
import { QrCode, CheckCircle, XCircle, Loader, Camera, ShieldAlert } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TransactionToast from '../components/TransactionToast';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../context/WalletContext';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';

// Parse QR value:
// 4-part format: "BLOCKTICKET:contractAddress:tokenId:ownerAddress"
// 3-part format: "BLOCKTICKET:tokenId:ownerAddress"
const parseQR = (value) => {
  const parts = value.split(':');
  if (parts[0] === 'BLOCKTICKET') {
    if (parts.length >= 4) {
      return { contractAddress: parts[1], tokenId: parts[2], owner: parts[3] };
    } else if (parts.length === 3) {
      return { tokenId: parts[1], owner: parts[2] };
    }
  }
  return null;
};

const TicketVerification = () => {
  const { account } = useWallet();
  const { getNFTContract } = useContract();

  const [manualInput, setManualInput] = useState('');
  const [verifyResult, setVerifyResult] = useState(null); // { tokenId, owner, isUsed, uri, valid, contractAddress }
  const [toast, setToast] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [burning, setBurning] = useState(false);
  const [burnDone, setBurnDone] = useState(false);

  // Camera scanner states
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = () => {
    setScanning(true);
    setVerifyResult(null);
    setBurnDone(false);
    
    setTimeout(() => {
      const html5Qrcode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5Qrcode;
      
      html5Qrcode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setManualInput(decodedText);
          verifyTicket(decodedText);
          stopScanner();
        },
        () => {
          // Silent scan failures (normal frame analysis)
        }
      ).catch(err => {
        console.error("Scanner start error:", err);
        setScanning(false);
        alert("Failed to start camera: " + err.message);
      });
    }, 150);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current = null;
        setScanning(false);
      }).catch(err => {
        console.error("Scanner stop error:", err);
        setScanning(false);
      });
    } else {
      setScanning(false);
    }
  };

  // ── Verify ticket on-chain ──────────────────────────────────────────────
  const verifyTicket = useCallback(async (qrValue) => {
    const parsed = parseQR(qrValue.trim());
    if (!parsed) {
      setVerifyResult({ valid: false, error: 'Invalid QR format. Expected: BLOCKTICKET:contractAddress:tokenId:address' });
      return;
    }

    setVerifying(true);
    setVerifyResult(null);
    setBurnDone(false);

    try {
      const { tokenId, owner } = parsed;

      // 1. Resolve contractAddress: check QR first, then fall back to database, then default.
      let contractAddress = parsed.contractAddress;
      if (!contractAddress) {
        contractAddress = CONTRACT_ADDRESSES.TicketNFT;
        try {
          const ticketRes = await fetch(`http://localhost:5000/api/tickets/${tokenId}`);
          const ticketData = await ticketRes.json();
          if (ticketData.success && ticketData.data?.eventId?.contractAddress) {
            contractAddress = ticketData.data.eventId.contractAddress;
          }
        } catch (dbErr) {
          console.warn('Backend fetch failed, using default contract address fallback:', dbErr.message);
        }
      }

      // 2. Instantiate read-only NFT contract instance
      const nftReadCustom = getNFTContract(contractAddress, false);
      if (!nftReadCustom) {
        throw new Error('Web3 provider is not initialized.');
      }

      // 3. Call verifyTicket on contract
      const [tokenOwner, isUsed, uri] = await nftReadCustom.verifyTicket(tokenId);

      // Check ownership matches QR claim
      const ownerMatch = tokenOwner.toLowerCase() === owner.toLowerCase();

      setVerifyResult({
        valid: !isUsed && ownerMatch,
        tokenId,
        claimedOwner: owner,
        actualOwner: tokenOwner,
        ownerMatch,
        isUsed,
        uri,
        contractAddress,
        error: isUsed
          ? 'Ticket has already been used.'
          : !ownerMatch
          ? 'Ownership mismatch — QR does not match current owner.'
          : null,
      });
    } catch (err) {
      setVerifyResult({
        valid: false,
        error: err.message?.includes('Token does not exist')
          ? 'Token does not exist on-chain.'
          : 'Verification failed: ' + (err.reason ?? err.message),
      });
    } finally {
      setVerifying(false);
    }
  }, [getNFTContract]);

  // ── Burn ticket (gate entry) ────────────────────────────────────────────
  const handleBurn = async () => {
    if (!verifyResult?.tokenId || !verifyResult?.contractAddress) return;

    const confirmed = window.confirm(
      `⚠ This will permanently burn Token #${verifyResult.tokenId}.\n\nThis action is IRREVERSIBLE. Proceed?`
    );
    if (!confirmed) return;

    setBurning(true);
    setToast({ status: 'pending', message: `Burning Token #${verifyResult.tokenId}…` });

    try {
      const nftWriteCustom = getNFTContract(verifyResult.contractAddress, true);
      if (!nftWriteCustom) {
        throw new Error('Please connect your MetaMask wallet first.');
      }

      const tx = await nftWriteCustom.burnTicket(verifyResult.tokenId);
      setToast({ status: 'pending', message: 'Waiting for confirmation…', txHash: tx.hash });
      await tx.wait();

      // Record in backend
      fetch('http://localhost:5000/api/tickets/mark-used', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId: verifyResult.tokenId, transactionHash: tx.hash }),
      }).catch(() => {});

      setToast({ status: 'success', message: `Token #${verifyResult.tokenId} burned — entry granted!`, txHash: tx.hash });
      setBurnDone(true);
      setVerifyResult(r => ({ ...r, isUsed: true, valid: false }));
    } catch (err) {
      const msg = err?.reason ?? err?.message ?? 'Burn failed';
      setToast({ status: 'error', message: msg });
    } finally {
      setBurning(false);
    }
  };

  const handleManualVerify = () => {
    if (manualInput.trim()) verifyTicket(manualInput.trim());
  };

  const reset = () => {
    setVerifyResult(null);
    setManualInput('');
    setBurnDone(false);
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', color: '#111' }}>
      <Navbar />
      {toast && <TransactionToast {...toast} onClose={() => setToast(null)} />}

      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem', maxWidth: '700px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111', marginBottom: '0.5rem' }}>Gate Verification</h1>
        <p style={{ color: '#888', marginBottom: '2.5rem' }}>Scan or enter a ticket QR code to verify and grant entry.</p>

        {/* Camera Scanner View */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem', textAlign: 'center' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Camera size={20} color="var(--clr-primary-500)" /> Camera Scanner
          </h3>
          
          {scanning ? (
            <div>
              <div 
                id="qr-reader" 
                style={{ 
                  width: '100%', 
                  maxWidth: '400px', 
                  margin: '0 auto 1.5rem auto',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #ccc'
                }} 
              />
              <button className="btn btn-outline" onClick={stopScanner} style={{ padding: '0.5rem 1.5rem' }}>
                Cancel Scanning
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={startScanner} 
              style={{ padding: '1rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Camera size={18} /> Start Camera Scan
            </button>
          )}
        </div>

        {/* Manual input panel */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#111', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <QrCode size={20} /> Manual QR Code Entry
          </h3>
          <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Format: <code style={{ background: '#f0f0f0', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>BLOCKTICKET:contractAddress:tokenId:walletAddress</code>
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualVerify()}
              placeholder="BLOCKTICKET:0xContractAddress:3:0xOwnerAddress"
              style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontFamily: 'monospace', fontSize: '0.9rem' }}
              disabled={scanning}
            />
            <button
              className="btn btn-primary"
              onClick={handleManualVerify}
              disabled={verifying || !manualInput.trim() || scanning}
              style={{ padding: '0.75rem 1.5rem', opacity: verifying ? 0.7 : 1 }}
            >
              {verifying ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Verify'}
            </button>
          </div>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>

        {/* Verification result */}
        {verifyResult && (
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
            border: `2px solid ${burnDone ? '#6c757d' : verifyResult.valid ? '#28a745' : '#dc3545'}`,
          }}>
            {/* Status header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              {burnDone ? (
                <CheckCircle size={48} color="#6c757d" />
              ) : verifyResult.valid ? (
                <CheckCircle size={48} color="#28a745" />
              ) : (
                <XCircle size={48} color="#dc3545" />
              )}
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: burnDone ? '#6c757d' : verifyResult.valid ? '#28a745' : '#dc3545' }}>
                  {burnDone ? 'ENTRY GRANTED — BURNED' : verifyResult.valid ? 'VALID TICKET' : 'INVALID TICKET'}
                </div>
                {verifyResult.error && (
                  <div style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '0.25rem' }}>{verifyResult.error}</div>
                )}
              </div>
            </div>

            {/* Details */}
            {verifyResult.tokenId && (
              <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Token ID', value: `#${verifyResult.tokenId}` },
                  { label: 'Claimed Owner', value: verifyResult.claimedOwner ? `${verifyResult.claimedOwner.slice(0,10)}…${verifyResult.claimedOwner.slice(-6)}` : '—' },
                  { label: 'Actual Owner', value: verifyResult.actualOwner ? `${verifyResult.actualOwner.slice(0,10)}…${verifyResult.actualOwner.slice(-6)}` : '—' },
                  { label: 'Owner Match', value: verifyResult.ownerMatch ? '✓ Yes' : '✗ No' },
                  { label: 'Used', value: verifyResult.isUsed ? 'Yes (already scanned)' : 'No' },
                  { label: 'Contract Address', value: verifyResult.contractAddress ? `${verifyResult.contractAddress.slice(0,12)}…` : '—' }
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <span style={{ color: '#888' }}>{row.label}</span>
                    <span style={{ fontWeight: '600', color: '#111', fontFamily: 'monospace' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={reset}
              >
                Reset Verification
              </button>
              {verifyResult.valid && !burnDone && (
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, background: '#dc3545', opacity: burning ? 0.7 : 1 }}
                  onClick={handleBurn}
                  disabled={burning}
                >
                  {burning ? 'Burning…' : '🔥 Grant Entry & Burn Ticket'}
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TicketVerification;
