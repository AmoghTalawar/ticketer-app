import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { BarChart2, Ticket, Plus, RefreshCw, DollarSign, ShieldCheck, Calendar, MapPin, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useWallet } from '../context/WalletContext';
import { useContract } from '../hooks/useContract';

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const { account, user } = useWallet();
  const { getNFTContract } = useContract();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [stats, setStats] = useState({ totalSupply: 0, maxSupply: 0, ticketPrice: '0', saleActive: false, balance: '0' });
  
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  
  const [withdrawing, setWithdrawing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [msg, setMsg] = useState(null);

  // Fetch all events created by this organizer
  const fetchEvents = async () => {
    if (!user?.id) return;
    setLoadingEvents(true);
    try {
      const res = await fetch(`http://localhost:5000/api/events?organizer=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
        if (data.data.length > 0) {
          setSelectedEvent(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Load contract stats for the selected event
  const loadStats = async () => {
    if (!selectedEvent || !selectedEvent.contractAddress) {
      setStats({ totalSupply: 0, maxSupply: 0, ticketPrice: '0', saleActive: false, balance: '0' });
      return;
    }
    
    setLoadingStats(true);
    try {
      const contractAddress = selectedEvent.contractAddress;
      const customNFTRead = getNFTContract(contractAddress, false);
      if (!customNFTRead) {
        throw new Error("Unable to initialize read-only contract instance.");
      }

      const [totalSupply, maxSupply, ticketPrice, saleActive] = await Promise.all([
        customNFTRead.totalSupply(),
        customNFTRead.maxSupply(),
        customNFTRead.ticketPrice(),
        customNFTRead.saleActive(),
      ]);

      // Fetch on-chain balance
      const provider = customNFTRead.runner.provider;
      const balWei = await provider.getBalance(contractAddress);

      setStats({
        totalSupply: Number(totalSupply),
        maxSupply: Number(maxSupply),
        ticketPrice: ethers.formatEther(ticketPrice),
        saleActive,
        balance: ethers.formatEther(balWei),
      });
    } catch (err) {
      console.error('Failed to load contract stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  useEffect(() => {
    loadStats();
  }, [selectedEvent]);

  const handleToggleSale = async () => {
    if (!selectedEvent || !selectedEvent.contractAddress) return;
    const customNFTWrite = getNFTContract(selectedEvent.contractAddress, true);
    if (!customNFTWrite) {
      setMsg({ type: 'error', text: 'Wallet not connected or invalid signer.' });
      return;
    }

    setToggling(true);
    setMsg(null);
    try {
      const tx = await customNFTWrite.toggleSale();
      await tx.wait();
      setMsg({ type: 'success', text: `Sale status toggled successfully!` });
      await loadStats();
    } catch (err) {
      setMsg({ type: 'error', text: err.reason ?? err.message });
    } finally {
      setToggling(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedEvent || !selectedEvent.contractAddress) return;
    const customNFTWrite = getNFTContract(selectedEvent.contractAddress, true);
    if (!customNFTWrite) {
      setMsg({ type: 'error', text: 'Wallet not connected or invalid signer.' });
      return;
    }

    if (!window.confirm('Withdraw all contract funds to organizer wallet?')) return;
    
    setWithdrawing(true);
    setMsg(null);
    try {
      const tx = await customNFTWrite.withdrawFunds();
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
    { label: 'Tickets Sold', value: loadingStats ? '…' : `${stats.totalSupply} / ${stats.maxSupply}`, icon: <Ticket size={22} color="var(--clr-primary-500)" /> },
    { label: 'Ticket Price', value: loadingStats ? '…' : `${stats.ticketPrice} ETH`, icon: <DollarSign size={22} color="var(--clr-primary-500)" /> },
    { label: 'Contract Balance', value: loadingStats ? '…' : `${parseFloat(stats.balance).toFixed(4)} ETH`, icon: <BarChart2 size={22} color="var(--clr-primary-500)" /> },
    { label: 'Sale Status', value: loadingStats ? '…' : (stats.saleActive ? 'ACTIVE' : 'PAUSED'), icon: <ShieldCheck size={22} color={stats.saleActive ? '#28a745' : '#dc3545'} /> },
  ];

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '6rem', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111', marginBottom: '0.25rem' }}>Organizer Dashboard</h1>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>Deploy and manage your ticket sales</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => { fetchEvents(); setMsg(null); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', color: '#555' }}
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, var(--clr-primary-500) 0%, var(--clr-primary-400) 100%)', border: 'none' }}
              onClick={() => navigate('/create-event')}
            >
              <Plus size={18} /> Create New Event
            </button>
            <button
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: '#333', color: '#333' }}
              onClick={() => navigate('/ticket-verification')}
            >
              <ShieldCheck size={18} /> Gate Scanner
            </button>
          </div>
        </div>

        {msg && (
          <div style={{ background: msg.type === 'success' ? '#d4edda' : '#f8d7da', border: `1px solid ${msg.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`, borderRadius: '8px', padding: '0.75rem 1.25rem', marginBottom: '1.5rem', color: msg.type === 'success' ? '#155724' : '#721c24', fontSize: '0.9rem' }}>
            {msg.text}
          </div>
        )}

        {loadingEvents ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#888' }}>
            <RefreshCw className="animate-spin" size={32} style={{ marginBottom: '1rem' }} />
            <div>Loading your events...</div>
          </div>
        ) : events.length === 0 ? (
          /* Empty State */
          <div style={{ background: '#fff', padding: '4rem 2rem', borderRadius: '24px', boxShadow: 'var(--shadow-sm)', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
            <AlertCircle size={48} color="var(--clr-primary-500)" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111', marginBottom: '0.5rem' }}>No Events Found</h2>
            <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.95rem' }}>
              You haven't created any event ticket contracts yet. Let's create your first concert or festival to launch your ticket sale on the blockchain!
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/create-event')}
              style={{ padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: '600' }}
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          /* Main Dashboard Content */
          <>
            {/* Event Dropdown Selector */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', background: '#fff', padding: '1.5rem 2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
              <div>
                <label style={{ fontWeight: '700', color: '#111', fontSize: '1.05rem', display: 'block', marginBottom: '0.25rem' }}>Select Event to Manage:</label>
                <div style={{ color: '#666', fontSize: '0.85rem' }}>Each event has its own smart contract address.</div>
              </div>
              <select
                value={selectedEvent ? selectedEvent._id : ''}
                onChange={(e) => {
                  const ev = events.find(event => event._id === e.target.value);
                  setSelectedEvent(ev);
                  setMsg(null);
                }}
                style={{ padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #ddd', background: '#fff', fontSize: '1rem', color: '#111', minWidth: '320px', cursor: 'pointer', outline: 'none', fontWeight: '600' }}
              >
                {events.map(ev => (
                  <option key={ev._id} value={ev._id}>{ev.title}</option>
                ))}
              </select>

              {selectedEvent && (
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#666' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={16} color="#888" /> {selectedEvent.venue}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={16} color="#888" /> {new Date(selectedEvent.date).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            {selectedEvent && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Contract address badge */}
                <div style={{ background: '#eef2ff', color: 'var(--clr-primary-700)', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', display: 'inline-flex', alignSelf: 'flex-start', fontFamily: 'monospace', border: '1px solid #dbeafe' }}>
                  Smart Contract Address: {selectedEvent.contractAddress}
                </div>

                {/* Stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
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
                <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem 2rem', boxShadow: 'var(--shadow-sm)' }}>
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

                {/* Organizer quick actions */}
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-primary" onClick={() => navigate('/create-event')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                    <Plus size={16} /> Create Another Event
                  </button>
                  <button className="btn btn-outline" onClick={() => navigate('/ticket-verification')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderColor: '#333', color: '#333' }}>
                    <ShieldCheck size={16} /> Open Gate Scanner
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OrganizerDashboard;
