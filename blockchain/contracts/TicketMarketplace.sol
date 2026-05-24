// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TicketNFT.sol";

/**
 * @title TicketMarketplace
 * @dev Secondary market for reselling BlockTicket NFTs with a hard price cap.
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

    TicketNFT public nftContract;
    uint256   public platformFeePercent; // e.g. 2 = 2%

    mapping(uint256 => Listing) public listings;

    uint256[] private _activeListingIds;
    mapping(uint256 => uint256) private _listingIndexById; // tokenId => index in _activeListingIds

    // ─── Events ───────────────────────────────────────────────────────────────

    event TicketListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event TicketSold(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price);
    event TicketDelisted(uint256 indexed tokenId, address indexed seller);
    event PriceUpdated(uint256 indexed tokenId, uint256 newPrice);
    event PlatformFeeUpdated(uint256 newFee);
    event PlatformFeesWithdrawn(address indexed to, uint256 amount);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address payable nftContractAddress, uint256 platformFee_) Ownable(msg.sender) {
        require(nftContractAddress != address(0), "Invalid NFT contract");
        require(platformFee_ <= 20, "Platform fee cannot exceed 20%");
        nftContract = TicketNFT(nftContractAddress);
        platformFeePercent = platformFee_;
    }

    // ─── Seller Functions ─────────────────────────────────────────────────────

    /**
     * @notice List a ticket for resale.
     * @dev Caller must call nftContract.approve(marketplaceAddress, tokenId) first.
     * @param tokenId Token ID to list
     * @param price   Asking price in wei (must be <= maxResalePrice)
     */
    function listTicket(uint256 tokenId, uint256 price) external {
        require(nftContract.ownerOf(tokenId) == msg.sender, "You don't own this ticket");
        require(!nftContract.ticketUsed(tokenId), "Used tickets cannot be listed");
        require(!listings[tokenId].active, "Already listed");
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

        listings[tokenId] = Listing({
            seller: msg.sender,
            price:  price,
            active: true
        });

        _listingIndexById[tokenId] = _activeListingIds.length;
        _activeListingIds.push(tokenId);

        emit TicketListed(tokenId, msg.sender, price);
    }

    /**
     * @notice Purchase a listed ticket.
     */
    function buyTicket(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Ticket not listed for sale");
        require(msg.value >= listing.price, "Insufficient MATIC sent");
        require(msg.sender != listing.seller, "Cannot buy your own ticket");

        address seller = listing.seller;
        uint256 price  = listing.price;

        // Remove listing
        _removeListing(tokenId);

        // Transfer NFT to buyer
        nftContract.transferFrom(seller, msg.sender, tokenId);

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

        emit TicketSold(tokenId, msg.sender, seller, price);
    }

    /**
     * @notice Delist a ticket from resale.
     */
    function delistTicket(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Not listed");
        require(listing.seller == msg.sender || msg.sender == owner(), "Not authorized");

        _removeListing(tokenId);
        emit TicketDelisted(tokenId, msg.sender);
    }

    /**
     * @notice Update the price of an existing listing.
     */
    function updatePrice(uint256 tokenId, uint256 newPrice) external {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Not listed");
        require(listing.seller == msg.sender, "Not your listing");
        require(newPrice > 0, "Price must be > 0");

        uint256 cap = nftContract.maxResalePrice(tokenId);
        require(newPrice <= cap, "Price exceeds resale cap");

        listing.price = newPrice;
        emit PriceUpdated(tokenId, newPrice);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /**
     * @notice Get all active listing token IDs.
     */
    function getActiveListings() external view returns (uint256[] memory) {
        return _activeListingIds;
    }

    /**
     * @notice Get listing details for a token.
     */
    function getListing(uint256 tokenId) external view returns (Listing memory) {
        return listings[tokenId];
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

    function _removeListing(uint256 tokenId) internal {
        // Swap-and-pop to remove from active listings array
        uint256 idx = _listingIndexById[tokenId];
        uint256 lastId = _activeListingIds[_activeListingIds.length - 1];

        _activeListingIds[idx] = lastId;
        _listingIndexById[lastId] = idx;

        _activeListingIds.pop();
        delete _listingIndexById[tokenId];
        delete listings[tokenId];
    }

    receive() external payable {}
}
