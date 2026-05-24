import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

/**
 * Wraps routes that require a connected wallet.
 * Redirects to /login with the intended path saved in location state.
 */
const WalletGuard = ({ children }) => {
  const { isConnected } = useWallet();
  const location = useLocation();

  if (!isConnected) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default WalletGuard;
