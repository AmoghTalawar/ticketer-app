import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

/**
 * Wraps routes that require a connected wallet.
 * Redirects to /login with the intended path saved in location state.
 */
const WalletGuard = ({ children, allowedRoles }) => {
  const { isConnected, user } = useWallet();
  const location = useLocation();

  if (!isConnected) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized roles to their home dashboard
    const target = user.role === 'organizer' ? '/organizer-dashboard' : '/account';
    return <Navigate to={target} replace />;
  }

  return children;
};

export default WalletGuard;
