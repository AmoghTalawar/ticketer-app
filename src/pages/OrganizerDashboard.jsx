import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { BarChart2, Ticket, Plus, RefreshCw, DollarSign, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useWallet } from '../context/WalletContext';
import { useContract } from '../hooks/useContract';

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const { account } = useWallet();
  const { nftRead, nftWrite } = useContract();

  const [stats, setStats] = useState({ totalSupply: 0, maxSupply: 0, ticketPrice: '0', saleActive: false, balance: '0' });
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [msg, setMsg] = useState(null);

  const loadStats = async () => {
    if (!nftRead) return;
    setLoading(true);
    try {
      const [totalSupply, maxSupply, ticketPrice, saleActive] = await Promise.all([
        nftRead.totalSupply(),
        nftRead.maxSupply(),
        nftRead.ticketPrice(),
        nftRead.saleActive(),
      ]);
      // Contract balance
      const provider = nftRead.runner.provider;
      const contractAddr = await nftRead.getAddress();
      const balWei = await provider.getBalance(contractAddr);

      setStats({
        totalSupply: Number(totalSupply),
        maxSupply: Number(maxSupply),
        ticketPrice: ethers.formatEther(ticketPrice),
        saleActive,
        balance: ethers.formatEther(balWei),
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, [nftRead]);

  const handleToggleSale = async () => {
    if (!nftWrite) return;
    setToggling(true);
    setMsg(null);
    try {
      const tx = await nftWrite.toggleSale();
      await tx.wait();
      setMsg({ type: 'success', text: `Sale is now ${stats.saleActive ? 'PAUSED' : 'ACTIVE'}` });
      await loadStats();
    } catch (err) {
      setMsg({ type: 'error', text: err.reason ?? err.message });
    } finally {
      setToggling(false);
    }
  };

  const handleWithdraw = async () => {
    if (!nftWrite) return;
    if (!window.confirm('Withdraw all contract funds to organizer wallet?')) return;
    setWithdrawing(true);
    setMsg(null);
    try {
      const tx = await nftWrite.withdrawFunds();
      await tx.wait();
      setMsg({ type: 'success', text: 'Funds withdrawn successfully!' });
      await loadStats();
    } catch (err) {
      setMsg({ type: 'error', text: err.reason ?? err.message });
    } finally {
      setWithdrawing(false);
    }
  };

  const soldPct = stats.maxSupply > 0 ? Math.round((stats.totalSupply / stats.maxSupply) * 100) : 0;

  const statCards = [
    { label: 'Tickets Sold', value: loading ? '…' : `${stats.totalSupply} / ${stats.maxSupply}`, icon: <Ticket size={22} color="var(--clr-primary-500)" /> },
    { label: 'Ticket Price', value: loading ? '…' : `${stats.ticketPrice} ETH`, icon: <DollarSign size={22} color="var(--clr-primary-500)" /> },
    { label: 'Contract Balance', value: loading ? '…' : `${parseFloat(stats.balance).toFixed(4)} ETH`, icon: <BarChart2 size={22} color="var(--clr-primary-500)" /> },
    { label: 'Sale Status', value: loading ? '…' : (stats.saleActive ? 'ACTIVE' : 'PAUSED'), icon: <ShieldCheck size={22} color={stats.saleActive ? '#28a745' : '#dc3545'} /> },
  ];

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <Navbar />

      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111', marginBottom: '0.25rem' }}>Organizer Dashboard</h1>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>Manage your TicketNFT contract</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={loadStats}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', color: '#555' }}
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => navigate('/ticket-verification')}
            >
              <ShieldCheck size={18} /> Gate Scanner
            </button>
          </div>
        </div>

        {/* Message */}
        {msg && (
          <div style={{ background: msg.type === 'success' ? '#d4edda' : '#f8d7da', border: `1px solid ${msg.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`, borderRadius: '8px', padding: '0.75rem 1.25rem', marginBottom: '1.5rem', color: msg.type === 'success' ? '#155724' : '#721c24', fontSize: '0.9rem' }}>
            {msg.text}
          </div>
        )}

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {statCards.map((s, i) => (
            <div key={i} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: '#f0f0ff', padding: '0.75rem', borderRadius: '50%' }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#111' }}>{s.value}</div>
                <div style={{ fontSize: '0.85rem', color: '#888' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem 2rem', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: '600', color: '#111' }}>Ticket Sales Progress</span>
            <span style={{ color: '#888', fontSize: '0.9rem' }}>{soldPct}% sold</span>
          </div>
          <div style={{ background: '#eee', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
            <div style={{ width: `${soldPct}%`, background: soldPct > 80 ? '#dc3545' : 'var(--clr-primary-500)', height: '100%', borderRadius: '8px', transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
            <span>{stats.totalSupply} sold</span>
            <span>{stats.maxSupply - stats.totalSupply} remaining</span>
          </div>
        </div>

        {/* Admin actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Toggle sale */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#111' }}>Sale Control</h3>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Sale is currently <strong style={{ color: stats.saleActive ? '#28a745' : '#dc3545' }}>{stats.saleActive ? 'ACTIVE' : 'PAUSED'}</strong>.
              {stats.saleActive ? ' Users can mint tickets.' : ' Minting is disabled.'}
            </p>
            <button
              className="btn"
              style={{ background: stats.saleActive ? '#dc3545' : '#28a745', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: toggling ? 'not-allowed' : 'pointer', opacity: toggling ? 0.7 : 1, fontWeight: '600' }}
              onClick={handleToggleSale}
              disabled={toggling}
            >
              {toggling ? 'Processing…' : stats.saleActive ? 'Pause Sale' : 'Activate Sale'}
            </button>
          </div>

          {/* Withdraw funds */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#111' }}>Withdraw Revenue</h3>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Contract balance: <strong style={{ color: '#111' }}>{parseFloat(stats.balance).toFixed(4)} ETH</strong>.
              Funds go to the organizer wallet.
            </p>
            <button
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.5rem', opacity: (withdrawing || parseFloat(stats.balance) === 0) ? 0.6 : 1, cursor: (withdrawing || parseFloat(stats.balance) === 0) ? 'not-allowed' : 'pointer' }}
              onClick={handleWithdraw}
              disabled={withdrawing || parseFloat(stats.balance) === 0}
            >
              {withdrawing ? 'Withdrawing…' : `Withdraw ${parseFloat(stats.balance).toFixed(4)} ETH`}
            </button>
          </div>
        </div>

        {/* Quick links */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { label: 'View Resale Market', path: '/resale-market' },
            { label: 'Transaction History', path: '/transaction-history' },
            { label: 'My Tickets', path: '/my-tickets' },
          ].map(l => (
            <button key={l.path} className="btn btn-outline" onClick={() => navigate(l.path)} style={{ padding: '0.5rem 1.25rem' }}>
              {l.label}
            </button>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrganizerDashboard;
