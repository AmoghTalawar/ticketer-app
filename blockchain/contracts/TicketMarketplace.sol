// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TicketNFT.sol";

/**
 * @title TicketMarketplace
 * @dev Secondary market for reselling BlockTicket NFTs with a hard price cap.
 *      Supports multiple TicketNFT contracts deployed by the EventFactory.
 *      Sellers must approve this contract to transfer their NFT before listing.
 *      The original mint price cap (e.g. 110%) is enforced on-chain.
 */
contract TicketMarketplace is Ownable, ReentrancyGuard {

    // ─── Structs ──────────────────────────────────────────────────────────────

    struct Listing {
        address seller;
        uint256 price;     // listing price in wei
        bool    active;
    }

    // ─── State Variables ──────────────────────────────────────────────────────

    uint256 public platformFeePercent; // e.g. 2 = 2%

    // Mapping: nftContract => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;

    // Track active listings per contract
    mapping(address => uint256[]) private _activeListingIds;
    // nftContract => tokenId => index in _activeListingIds
    mapping(address => mapping(uint256 => uint256)) private _listingIndexById;

    // ─── Events ───────────────────────────────────────────────────────────────

    event TicketListed(address indexed nftContract, uint256 indexed tokenId, address indexed seller, uint256 price);
    event TicketSold(address indexed nftContract, uint256 indexed tokenId, address indexed buyer, address seller, uint256 price);
    event TicketDelisted(address indexed nftContract, uint256 indexed tokenId, address indexed seller);
    event PriceUpdated(address indexed nftContract, uint256 indexed tokenId, uint256 newPrice);
    event PlatformFeeUpdated(uint256 newFee);
    event PlatformFeesWithdrawn(address indexed to, uint256 amount);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(uint256 platformFee_) Ownable(msg.sender) {
        require(platformFee_ <= 20, "Platform fee cannot exceed 20%");
        platformFeePercent = platformFee_;
    }

    // ─── Seller Functions ─────────────────────────────────────────────────────

    /**
     * @notice List a ticket for resale.
     * @dev Caller must call NFTContract.approve(marketplaceAddress, tokenId) first.
     * @param nftContractAddress Address of the TicketNFT contract
     * @param tokenId Token ID to list
     * @param price   Asking price in wei (must be <= maxResalePrice)
     */
    function listTicket(address nftContractAddress, uint256 tokenId, uint256 price) external {
        TicketNFT nftContract = TicketNFT(payable(nftContractAddress));
        require(nftContract.ownerOf(tokenId) == msg.sender, "You don't own this ticket");
        require(!nftContract.ticketUsed(tokenId), "Used tickets cannot be listed");
        require(!listings[nftContractAddress][tokenId].active, "Already listed");
        require(price > 0, "Price must be > 0");

        // Enforce the price cap from the NFT contract
        uint256 cap = nftContract.maxResalePrice(tokenId);
        require(price <= cap, "Price exceeds resale cap");

        // Verify marketplace is approved to transfer
        require(
            nftContract.getApproved(tokenId) == address(this) ||
            nftContract.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved - call NFT.approve() first"
        );

        listings[nftContractAddress][tokenId] = Listing({
            seller: msg.sender,
            price:  price,
            active: true
        });

        _listingIndexById[nftContractAddress][tokenId] = _activeListingIds[nftContractAddress].length;
        _activeListingIds[nftContractAddress].push(tokenId);

        emit TicketListed(nftContractAddress, tokenId, msg.sender, price);
    }

    /**
     * @notice Purchase a listed ticket.
     */
    function buyTicket(address nftContractAddress, uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[nftContractAddress][tokenId];
        require(listing.active, "Ticket not listed for sale");
        require(msg.value >= listing.price, "Insufficient MATIC sent");
        require(msg.sender != listing.seller, "Cannot buy your own ticket");

        address seller = listing.seller;
        uint256 price  = listing.price;

        // Remove listing
        _removeListing(nftContractAddress, tokenId);

        // Transfer NFT to buyer
        TicketNFT(payable(nftContractAddress)).transferFrom(seller, msg.sender, tokenId);

        // Distribute funds
        uint256 fee           = (price * platformFeePercent) / 100;
        uint256 sellerPayment = price - fee;

        (bool sellerPaid, ) = payable(seller).call{value: sellerPayment}("");
        require(sellerPaid, "Seller payment failed");

        // Refund excess MATIC to buyer
        if (msg.value > price) {
            (bool refunded, ) = payable(msg.sender).call{value: msg.value - price}("");
            require(refunded, "Refund failed");
        }

        emit TicketSold(nftContractAddress, tokenId, msg.sender, seller, price);
    }

    /**
     * @notice Delist a ticket from resale.
     */
    function delistTicket(address nftContractAddress, uint256 tokenId) external {
        Listing storage listing = listings[nftContractAddress][tokenId];
        require(listing.active, "Not listed");
        require(listing.seller == msg.sender || msg.sender == owner(), "Not authorized");

        _removeListing(nftContractAddress, tokenId);
        emit TicketDelisted(nftContractAddress, tokenId, msg.sender);
    }

    /**
     * @notice Update the price of an existing listing.
     */
    function updatePrice(address nftContractAddress, uint256 tokenId, uint256 newPrice) external {
        Listing storage listing = listings[nftContractAddress][tokenId];
        require(listing.active, "Not listed");
        require(listing.seller == msg.sender, "Not your listing");
        require(newPrice > 0, "Price must be > 0");

        TicketNFT nftContract = TicketNFT(payable(nftContractAddress));
        uint256 cap = nftContract.maxResalePrice(tokenId);
        require(newPrice <= cap, "Price exceeds resale cap");

        listing.price = newPrice;
        emit PriceUpdated(nftContractAddress, tokenId, newPrice);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /**
     * @notice Get all active listing token IDs for a specific contract.
     */
    function getActiveListings(address nftContractAddress) external view returns (uint256[] memory) {
        return _activeListingIds[nftContractAddress];
    }

    /**
     * @notice Get listing details for a token in a contract.
     */
    function getListing(address nftContractAddress, uint256 tokenId) external view returns (Listing memory) {
        return listings[nftContractAddress][tokenId];
    }

    // ─── Admin Functions ──────────────────────────────────────────────────────

    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 20, "Fee cannot exceed 20%");
        platformFeePercent = newFee;
        emit PlatformFeeUpdated(newFee);
    }

    function withdrawFees() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        (bool sent, ) = payable(owner()).call{value: balance}("");
        require(sent, "Withdrawal failed");
        emit PlatformFeesWithdrawn(owner(), balance);
    }

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    function _removeListing(address nftContractAddress, uint256 tokenId) internal {
        uint256 idx = _listingIndexById[nftContractAddress][tokenId];
        uint256 lastId = _activeListingIds[nftContractAddress][_activeListingIds[nftContractAddress].length - 1];

        _activeListingIds[nftContractAddress][idx] = lastId;
        _listingIndexById[nftContractAddress][lastId] = idx;

        _activeListingIds[nftContractAddress].pop();
        delete _listingIndexById[nftContractAddress][tokenId];
        delete listings[nftContractAddress][tokenId];
    }

    receive() external payable {}
}
