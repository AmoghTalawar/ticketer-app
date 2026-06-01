import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { useContract } from '../hooks/useContract';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TransactionToast from '../components/TransactionToast';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { account } = useWallet();
  const { eventFactoryWrite, getNFTContract } = useContract();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('concert');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [priceCapPercent, setPriceCapPercent] = useState('110');
  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eventFactoryWrite) {
      alert('Wallet not connected. Please connect MetaMask first.');
      return;
    }
    if (!imageFile) {
      alert('Please select an event banner image.');
      return;
    }

    setLoading(true);
    setToast({ status: 'pending', message: 'Uploading event banner to IPFS...' });

    try {
      // 1. Upload banner image to backend IPFS endpoint
      const formData = new FormData();
      formData.append('image', imageFile);

      const uploadRes = await fetch('http://localhost:5000/api/ipfs/upload-image', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        throw new Error(uploadData.message || 'Failed to upload image to Pinata');
      }

      // gatewayUrl is the HTTP-accessible Pinata gateway URL (browsers can load this)
      // url is ipfs:// which browsers cannot fetch directly — we store gatewayUrl
      const { gatewayUrl: imageUrl, cid: ipfsCID } = uploadData;

      // 2. Deploy TicketNFT via EventFactory contract
      setToast({ status: 'pending', message: 'Confirm event contract deployment in MetaMask...' });

      const symbol = title.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 5) || 'BTKT';
      const priceWei = ethers.parseEther(ticketPrice);

      const deployTx = await eventFactoryWrite.createEvent(
        title,
        symbol,
        parseInt(totalSupply),
        priceWei,
        parseInt(priceCapPercent),
        account
      );

      setToast({ status: 'pending', message: 'Deploying contract on-chain...', txHash: deployTx.hash });
      const deployReceipt = await deployTx.wait();

      // Extract new event address from EventCreated event
      const iface = eventFactoryWrite.interface;
      let contractAddress = '';
      for (const log of deployReceipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed && parsed.name === 'EventCreated') {
            contractAddress = parsed.args.eventAddress;
            break;
          }
        } catch (_) {}
      }

      if (!contractAddress) {
        throw new Error('Could not retrieve deployed event address from tx logs.');
      }

      // 3. Open ticket sale on the newly created TicketNFT contract
      setToast({ status: 'pending', message: 'Opening ticket sale...', txHash: deployTx.hash });
      const customNFT = getNFTContract(contractAddress, true);
      if (customNFT) {
        const saleTx = await customNFT.toggleSale();
        await saleTx.wait();
      }

      // 4. Save event details in backend MongoDB
      setToast({ status: 'pending', message: 'Saving event in database...' });
      const token = localStorage.getItem('blockticket_token');

      const createRes = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          category,
          description,
          date: new Date(date).toISOString(),
          venue,
          totalSupply: parseInt(totalSupply),
          ticketPrice,
          priceCapPercent: parseInt(priceCapPercent),
          contractAddress,
          ipfsCID,
          imageUrl,
        })
      });

      const createData = await createRes.json();
      if (!createData.success) {
        throw new Error(createData.message || 'Failed to save event details');
      }

      setToast({ status: 'success', message: 'Event and Smart Contract deployed successfully!', txHash: deployTx.hash });

      setTimeout(() => {
        navigate('/organizer-dashboard');
      }, 1500);

    } catch (err) {
      console.error(err);
      setToast({ status: 'error', message: err.reason || err.message || 'Failed to create event' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <Navbar />
      {toast && <TransactionToast {...toast} onClose={() => setToast(null)} />}

      <section className="section bg-light" style={{ minHeight: '80vh', paddingTop: '8rem', paddingBottom: '4rem' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 className="title-md" style={{ marginBottom: '2rem', textAlign: 'center', color: '#111' }}>Create New Event</h1>
          
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#333' }}>
              
              <div className="grid grid-cols-2 gap-4">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '600' }}>Event Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Coldplay World Tour" 
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }} 
                    required 
                    disabled={loading}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '600' }}>Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }} 
                    required
                    disabled={loading}
                  >
                    <option value="concert">Concert</option>
                    <option value="festival">Festival</option>
                    <option value="club">Club</option>
                    <option value="virtual">Virtual</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600' }}>Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Event details..." 
                  rows="4" 
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical', outline: 'none' }} 
                  required
                  disabled={loading}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '600' }}>Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }} 
                    required 
                    disabled={loading}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '600' }}>Venue / Location</label>
                  <input 
                    type="text" 
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. DY Patil Stadium" 
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }} 
                    required 
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '600' }}>Total Supply</label>
                  <input 
                    type="number" 
                    value={totalSupply}
                    onChange={(e) => setTotalSupply(e.target.value)}
                    placeholder="1000" 
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }} 
                    required 
                    min="1" 
                    disabled={loading}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '600' }}>Ticket Price (MATIC)</label>
                  <input 
                    type="number" 
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(e.target.value)}
                    placeholder="50" 
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }} 
                    required 
                    min="0" 
                    step="0.001" 
                    disabled={loading}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '600' }}>Resale Cap (%)</label>
                  <input 
                    type="number" 
                    value={priceCapPercent}
                    onChange={(e) => setPriceCapPercent(e.target.value)}
                    placeholder="110" 
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }} 
                    required 
                    min="100" 
                    disabled={loading}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600' }}>Event Banner Image (IPFS Upload)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setImageFile(e.target.files[0])}
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '1px dashed #ccc', background: '#f9f9f9', cursor: 'pointer' }} 
                  required 
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ marginTop: '1rem', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Create Event & Deploy Smart Contract'}
              </button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CreateEvent;
