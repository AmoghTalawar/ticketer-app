import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CHAIN_ID } from '../contracts/addresses';

const GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

const MintSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tokenId  = location.state?.tokenId  ?? '—';
  const txHash   = location.state?.txHash   ?? null;
  const seat     = location.state?.seat     ?? '—';
  const ipfsCID  = location.state?.ipfsCID  ?? null;
  const tokenURI = location.state?.tokenURI ?? null;

  const explorerBase = CHAIN_ID === 31337 || CHAIN_ID === 1337
    ? null
    : 'https://amoy.polygonscan.com/tx/';

  const ipfsLink = ipfsCID ? GATEWAY + ipfsCID : null;

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10rem 1rem 6rem 1rem' }}>
        <div style={{ background: '#fff', padding: '3rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', width: '100%', maxWidth: '560px', textAlign: 'center' }}>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <CheckCircle size={72} color="#28a745" />
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#111' }}>
            Ticket Minted!
          </h1>
          <p style={{ color: '#888', marginBottom: '2.5rem' }}>
            Your NFT ticket has been successfully created on the blockchain
            {ipfsCID ? ' and metadata stored on IPFS via Pinata.' : '.'}
          </p>

          {/* Details card */}
          <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'left' }}>
            <Row label="Token ID" value={tokenId !== '—' ? `#${tokenId}` : '—'} />
            <Row label="Seat" value={seat} />
            <Row label="Network" value={CHAIN_ID === 1337 ? 'Hardhat Local' : CHAIN_ID === 80002 ? 'Polygon Amoy' : `Chain ${CHAIN_ID}`} />

            {ipfsCID && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                <span style={{ color: '#888', fontSize: '0.9rem' }}>IPFS Metadata</span>
                <a
                  href={ipfsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--clr-primary-500)', fontFamily: 'monospace', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {ipfsCID.slice(0, 12)}…
                  <ExternalLink size={12} />
                </a>
              </div>
            )}

            {txHash && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                <span style={{ color: '#888', fontSize: '0.9rem' }}>Transaction</span>
                {explorerBase ? (
                  <a href={explorerBase + txHash} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--clr-primary-500)', fontFamily: 'monospace', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {txHash.slice(0, 14)}…{txHash.slice(-6)} <ExternalLink size={12} />
                  </a>
                ) : (
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#555' }}>
                    {txHash.slice(0, 16)}…{txHash.slice(-8)}
                  </span>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={() => navigate('/concerts')}>Browse More</button>
            <button
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => navigate('/my-tickets')}
            >
              View My Tickets <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
    <span style={{ color: '#888', fontSize: '0.9rem' }}>{label}</span>
    <span style={{ fontWeight: '600', color: '#111', fontSize: '0.9rem' }}>{value}</span>
  </div>
);

export default MintSuccess;
