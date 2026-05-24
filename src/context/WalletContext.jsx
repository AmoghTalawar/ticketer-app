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
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const isCorrectNetwork = chainId === CHAIN_ID;

  const _buildProvider = async () => {
    const p = new ethers.BrowserProvider(window.ethereum);
    const s = await p.getSigner();
    const network = await p.getNetwork();
    return { p, s, chainId: Number(network.chainId) };
  };

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
      setAccount(accounts[0].toLowerCase());
      setProvider(p);
      setSigner(s);
      setChainId(cid);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
      return false;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setError(null);
  }, []);

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
    window.ethereum.request({ method: 'eth_accounts' }).then(async (accounts) => {
      if (accounts.length > 0) {
        try {
          const { p, s, chainId: cid } = await _buildProvider();
          setAccount(accounts[0].toLowerCase());
          setProvider(p);
          setSigner(s);
          setChainId(cid);
        } catch (_) {}
      }
    });
  }, []);

  // MetaMask event listeners
  useEffect(() => {
    if (!window.ethereum) return;

    const onAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0].toLowerCase());
        _buildProvider().then(({ p, s }) => { setProvider(p); setSigner(s); }).catch(() => {});
      }
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
