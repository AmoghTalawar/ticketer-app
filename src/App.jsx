import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/concerts" element={<Concerts />} />
        <Route path="/singers" element={<Singers />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/ticket" element={<DownloadTicket />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<Account />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
