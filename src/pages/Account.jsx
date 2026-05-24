import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { Wallet, Ticket, History, Settings } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useWallet } from '../context/WalletContext';
import { useContract } from '../hooks/useContract';

const Account = () => {
  const navigate = useNavigate();
  const { account, chainId, disconnect } = useWallet();
  const { nftRead } = useContract();
  const [activeTab, setActiveTab] = useState('My Hub');
  const [ticketCount, setTicketCount] = useState(null);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (!nftRead || !account) return;
    nftRead.balanceOf(account)
      .then(b => setTicketCount(b.toString()))
      .catch(() => {});
  }, [nftRead, account]);

  useEffect(() => {
    if (!account || !window.ethereum) return;
    const p = new ethers.BrowserProvider(window.ethereum);
    p.getBalance(account).then(b => {
      setBalance(parseFloat(ethers.formatEther(b)).toFixed(4));
    }).catch(() => {});
  }, [account]);

  const shortAddress = account
    ? `${account.slice(0, 8)}...${account.slice(-6)}`
    : '—';

  const networkName = chainId === 31337 ? 'Hardhat Local'
    : chainId === 80002 ? 'Polygon Amoy'
    : chainId === 137   ? 'Polygon Mainnet'
    : `Chain ${chainId}`;

  const tabs = [
    { label: 'My Hub',   icon: <Wallet size={16} /> },
    { label: 'My Tickets', icon: <Ticket size={16} /> },
    { label: 'History',  icon: <History size={16} /> },
    { label: 'Settings', icon: <Settings size={16} /> },
  ];

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="container" style={{ paddingTop: '10rem', paddingBottom: '6rem', flex: 1 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#111' }}>Account</h1>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

          {/* Sidebar */}
          <div style={{ width: '250px', background: '#fff', padding: '1rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {tabs.map(tab => (
                <li key={tab.label}>
                  <button
                    onClick={() => setActiveTab(tab.label)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '1rem 1.5rem',
                      background: activeTab === tab.label ? '#111' : 'transparent',
                      color: activeTab === tab.label ? '#fff' : '#555',
                      border: 'none', borderRadius: '8px', cursor: 'pointer',
                      fontWeight: activeTab === tab.label ? 'bold' : 'normal',
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    {tab.icon} {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Main content */}
          <div style={{ flex: 1, background: '#fff', padding: '3rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>

            {activeTab === 'My Hub' && (
              <>
                {/* Wallet card */}
                <div style={{ background: 'linear-gradient(135deg, #111 0%, #2938b8 100%)', borderRadius: '16px', padding: '2rem', color: '#fff', marginBottom: '2.5rem' }}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7, letterSpacing: '2px', marginBottom: '1rem' }}>CONNECTED WALLET</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1rem', marginBottom: '1.5rem', wordBreak: 'break-all' }}>{account}</div>
                  <div style={{ display: 'flex', gap: '2rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Balance</div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{balance ?? '…'} ETH</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>NFT Tickets</div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{ticketCount ?? '…'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Network</div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{networkName}</div>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  {[
                    { label: 'My NFT Tickets', desc: 'View and manage your tickets', path: '/my-tickets', primary: true },
                    { label: 'Browse Concerts', desc: 'Find events and mint tickets', path: '/concerts', primary: false },
                    { label: 'Resale Market', desc: 'Buy or sell tickets', path: '/resale-market', primary: false },
                    { label: 'Organizer Dashboard', desc: 'Manage your events', path: '/organizer-dashboard', primary: false },
                  ].map(action => (
                    <button
                      key={action.label}
                      onClick={() => navigate(action.path)}
                      style={{
                        background: action.primary ? '#111' : '#f8f9fa',
                        color: action.primary ? '#fff' : '#111',
                        border: 'none', borderRadius: '12px', padding: '1.5rem',
                        textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{action.label}</div>
                      <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>{action.desc}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'My Tickets' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111', marginBottom: '1.5rem' }}>My NFT Tickets</h2>
                <p style={{ color: '#888', marginBottom: '1.5rem' }}>You own <strong>{ticketCount ?? '…'}</strong> NFT ticket{ticketCount !== '1' ? 's' : ''}.</p>
                <button className="btn btn-primary" onClick={() => navigate('/my-tickets')}>View All Tickets →</button>
              </div>
            )}

            {activeTab === 'History' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111', marginBottom: '1.5rem' }}>Transaction History</h2>
                <button className="btn btn-primary" onClick={() => navigate('/transaction-history')}>View Full History →</button>
              </div>
            )}

            {activeTab === 'Settings' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111', marginBottom: '2rem' }}>Settings</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px' }}>
                  <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1.5rem' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Wallet Address</div>
                    <div style={{ fontFamily: 'monospace', color: '#555', wordBreak: 'break-all', fontSize: '0.9rem' }}>{account}</div>
                  </div>
                  <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1.5rem' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Network</div>
                    <div style={{ color: '#555' }}>{networkName} (Chain ID: {chainId})</div>
                  </div>
                  <button
                    onClick={disconnect}
                    style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', cursor: 'pointer', fontWeight: '600', alignSelf: 'flex-start' }}
                  >
                    Disconnect Wallet
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
