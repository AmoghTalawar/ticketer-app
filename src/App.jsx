import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import WalletGuard from './components/WalletGuard';

import Home from './pages/Home';
import Concerts from './pages/Concerts';
import Singers from './pages/Singers';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import FAQ from './pages/FAQ';
import ContactUs from './pages/ContactUs';
import Reservation from './pages/Reservation';
import Checkout from './pages/Checkout';
import DownloadTicket from './pages/DownloadTicket';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import SearchResults from './pages/SearchResults';
import NotFound from './pages/NotFound';
import OrganizerDashboard from './pages/OrganizerDashboard';
import CreateEvent from './pages/CreateEvent';
import MyTickets from './pages/MyTickets';
import ResaleMarket from './pages/ResaleMarket';
import TicketVerification from './pages/TicketVerification';
import MintSuccess from './pages/MintSuccess';
import TransactionHistory from './pages/TransactionHistory';
import EventDetail from './pages/EventDetail';
import './index.css';

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/concerts" element={<Concerts />} />
          <Route path="/singers" element={<Singers />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/resale-market" element={<ResaleMarket />} />

          {/* Wallet-protected routes */}
          <Route path="/reservation" element={<WalletGuard allowedRoles={['user']}><Reservation /></WalletGuard>} />
          <Route path="/checkout" element={<WalletGuard allowedRoles={['user']}><Checkout /></WalletGuard>} />
          <Route path="/ticket" element={<WalletGuard allowedRoles={['user']}><DownloadTicket /></WalletGuard>} />
          <Route path="/mint-success" element={<WalletGuard allowedRoles={['user']}><MintSuccess /></WalletGuard>} />
          <Route path="/my-tickets" element={<WalletGuard allowedRoles={['user']}><MyTickets /></WalletGuard>} />
          <Route path="/account" element={<WalletGuard allowedRoles={['user']}><Account /></WalletGuard>} />
          <Route path="/transaction-history" element={<WalletGuard allowedRoles={['user']}><TransactionHistory /></WalletGuard>} />
          <Route path="/organizer-dashboard" element={<WalletGuard allowedRoles={['organizer']}><OrganizerDashboard /></WalletGuard>} />
          <Route path="/create-event" element={<WalletGuard allowedRoles={['organizer']}><CreateEvent /></WalletGuard>} />
          <Route path="/ticket-verification" element={<WalletGuard allowedRoles={['organizer']}><TicketVerification /></WalletGuard>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;
