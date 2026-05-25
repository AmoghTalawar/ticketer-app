import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CHAIN_ID } from '../contracts/addresses';

const WalletContext = createContext(null);

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [user, setUser] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const isCorrectNetwork = chainId === CHAIN_ID;

  const _buildProvider = async () => {
    const p = new ethers.BrowserProvider(window.ethereum);
    const s = await p.getSigner();
    const network = await p.getNetwork();
    return { p, s, chainId: Number(network.chainId) };
  };

  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setUser(null);
    setError(null);
    localStorage.removeItem('blockticket_token');
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install it from metamask.io');
      return false;
    }
    setConnecting(true);
    setError(null);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const { p, s, chainId: cid } = await _buildProvider();
      const walletAddress = accounts[0].toLowerCase();

      // SIWE Flow:
      // 1. Get Nonce
      const nonceRes = await fetch('http://localhost:5000/api/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });
      const nonceData = await nonceRes.json();
      if (!nonceData.success) throw new Error(nonceData.message || 'Failed to get nonce');

      // 2. Sign Message
      const signature = await s.signMessage(nonceData.message);

      // 3. Verify Wallet
      const verifyRes = await fetch('http://localhost:5000/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, signature }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) throw new Error(verifyData.message || 'Signature verification failed');

      // Save JWT token in local storage
      localStorage.setItem('blockticket_token', verifyData.token);

      setAccount(walletAddress);
      setProvider(p);
      setSigner(s);
      setChainId(cid);
      setUser(verifyData.user);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
      disconnect();
      return false;
    } finally {
      setConnecting(false);
    }
  }, [disconnect]);

  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    const hexChainId = '0x' + CHAIN_ID.toString(16); // 0x539 for 1337
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });
    } catch (err) {
      if (err.code === 4902) {
        // Chain not in MetaMask yet — add Hardhat Local
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: hexChainId,
              chainName: 'Hardhat Local',
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['http://127.0.0.1:8545'],
              blockExplorerUrls: [],
            }],
          });
        } catch (addErr) {
          setError('Failed to add Hardhat Local network: ' + addErr.message);
        }
      } else {
        setError('Failed to switch network: ' + err.message);
      }
    }
  }, []);

  // Auto-reconnect on page load
  useEffect(() => {
    if (!window.ethereum) return;
    const token = localStorage.getItem('blockticket_token');

    window.ethereum.request({ method: 'eth_accounts' }).then(async (accounts) => {
      if (accounts.length > 0 && token) {
        try {
          const { p, s, chainId: cid } = await _buildProvider();
          const walletAddress = accounts[0].toLowerCase();

          const res = await fetch('http://localhost:5000/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success && data.user.walletAddress.toLowerCase() === walletAddress) {
            setAccount(walletAddress);
            setProvider(p);
            setSigner(s);
            setChainId(cid);
            setUser(data.user);
          } else {
            localStorage.removeItem('blockticket_token');
          }
        } catch (_) {
          localStorage.removeItem('blockticket_token');
        }
      } else {
        localStorage.removeItem('blockticket_token');
      }
    });
  }, []);

  // MetaMask event listeners
  useEffect(() => {
    if (!window.ethereum) return;

    const onAccountsChanged = (accounts) => {
      disconnect();
    };

    const onChainChanged = (hexChainId) => {
      setChainId(parseInt(hexChainId, 16));
      _buildProvider().then(({ p, s }) => { setProvider(p); setSigner(s); }).catch(() => {});
    };

    window.ethereum.on('accountsChanged', onAccountsChanged);
    window.ethereum.on('chainChanged', onChainChanged);
    return () => {
      window.ethereum.removeListener('accountsChanged', onAccountsChanged);
      window.ethereum.removeListener('chainChanged', onChainChanged);
    };
  }, [disconnect]);

  const value = {
    account,
    chainId,
    provider,
    signer,
    user,
    setUser,
    connecting,
    error,
    isConnected: !!account,
    isCorrectNetwork,
    connect,
    disconnect,
    switchNetwork,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
