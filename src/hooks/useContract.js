import { useMemo } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import TicketNFTAbi from '../contracts/TicketNFT.json';
import TicketMarketplaceAbi from '../contracts/TicketMarketplace.json';

/**
 * Returns read-only and write contract instances for TicketNFT and TicketMarketplace.
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

  return { nftRead, nftWrite, marketplaceRead, marketplaceWrite };
};
