import { useMemo, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import TicketNFTAbi from '../contracts/TicketNFT.json';
import TicketMarketplaceAbi from '../contracts/TicketMarketplace.json';
import EventFactoryAbi from '../contracts/EventFactory.json';

/**
 * Returns read-only and write contract instances for TicketNFT, TicketMarketplace, and EventFactory.
 * Read contracts use the provider (no signer needed).
 * Write contracts use the signer (wallet must be connected).
 */
export const useContract = () => {
  const { provider, signer } = useWallet();

  const nftRead = useMemo(() => {
    if (!provider) return null;
    return new ethers.Contract(
      CONTRACT_ADDRESSES.TicketNFT,
      TicketNFTAbi.abi,
      provider
    );
  }, [provider]);

  const nftWrite = useMemo(() => {
    if (!signer) return null;
    return new ethers.Contract(
      CONTRACT_ADDRESSES.TicketNFT,
      TicketNFTAbi.abi,
      signer
    );
  }, [signer]);

  const marketplaceRead = useMemo(() => {
    if (!provider) return null;
    return new ethers.Contract(
      CONTRACT_ADDRESSES.TicketMarketplace,
      TicketMarketplaceAbi.abi,
      provider
    );
  }, [provider]);

  const marketplaceWrite = useMemo(() => {
    if (!signer) return null;
    return new ethers.Contract(
      CONTRACT_ADDRESSES.TicketMarketplace,
      TicketMarketplaceAbi.abi,
      signer
    );
  }, [signer]);

  const eventFactoryRead = useMemo(() => {
    if (!provider) return null;
    return new ethers.Contract(
      CONTRACT_ADDRESSES.EventFactory,
      EventFactoryAbi.abi,
      provider
    );
  }, [provider]);

  const eventFactoryWrite = useMemo(() => {
    if (!signer) return null;
    return new ethers.Contract(
      CONTRACT_ADDRESSES.EventFactory,
      EventFactoryAbi.abi,
      signer
    );
  }, [signer]);

  // Helper to dynamically get any deployed event's TicketNFT contract
  const getNFTContract = useCallback((address, write = false) => {
    if (write) {
      if (!signer) return null;
      return new ethers.Contract(address, TicketNFTAbi.abi, signer);
    } else {
      if (!provider) return null;
      return new ethers.Contract(address, TicketNFTAbi.abi, provider);
    }
  }, [provider, signer]);

  return {
    nftRead,
    nftWrite,
    marketplaceRead,
    marketplaceWrite,
    eventFactoryRead,
    eventFactoryWrite,
    getNFTContract
  };
};
