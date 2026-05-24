// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TicketNFT
 * @dev ERC-721 NFT contract for event tickets on BlockTicket platform.
 *      Each token represents one ticket. Tickets can be minted (purchased),
 *      burned (destroyed on gate entry), or marked used (soft invalidation).
 */
contract TicketNFT is
    ERC721,
    ERC721URIStorage,
    ERC721Enumerable,
    Ownable,
    Pausable,
    ReentrancyGuard
{
    // ─── State Variables ──────────────────────────────────────────────────────

    uint256 private _tokenIdCounter;

    uint256 public maxSupply;
    uint256 public ticketPrice;        // in wei (MATIC)
    uint256 public resalePriceCap;     // percentage, e.g. 110 = 110% of original
    address public organizer;
    bool    public saleActive;

    mapping(uint256 => bool)    public ticketUsed;
    mapping(uint256 => uint256) public mintPrice;  // original price per token (wei)

    // ─── Events ───────────────────────────────────────────────────────────────

    event TicketMinted(address indexed buyer, uint256 indexed tokenId, string tokenURI, uint256 price);
    event TicketBurned(uint256 indexed tokenId, address indexed burner);
    event TicketMarkedUsed(uint256 indexed tokenId);
    event SaleToggled(bool active);
    event FundsWithdrawn(address indexed to, uint256 amount);
    event PriceUpdated(uint256 newPrice);
    event MaxSupplyUpdated(uint256 newMaxSupply);

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyOrganizer() {
        require(msg.sender == organizer || msg.sender == owner(), "Not authorized");
        _;
    }

    modifier whenSaleActive() {
        require(saleActive, "Sale is not active");
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────

    /**
     * @param name_          NFT collection name (e.g. "Coldplay World Tour Tickets")
     * @param symbol_        NFT symbol (e.g. "CWT")
     * @param maxSupply_     Total number of tickets available
     * @param ticketPrice_   Price per ticket in wei
     * @param resalePriceCap_ Max resale % (e.g. 110 = 110% of original price)
     * @param organizer_     Address of the event organizer
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        uint256 ticketPrice_,
        uint256 resalePriceCap_,
        address organizer_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        require(maxSupply_ > 0, "Max supply must be > 0");
        require(organizer_ != address(0), "Invalid organizer address");
        require(resalePriceCap_ >= 100, "Resale cap must be >= 100%");

        maxSupply     = maxSupply_;
        ticketPrice   = ticketPrice_;
        resalePriceCap = resalePriceCap_;
        organizer     = organizer_;
        saleActive    = false;
    }

    // ─── Core Functions ───────────────────────────────────────────────────────

    /**
     * @notice Mint one ticket NFT.
     * @param tokenURI_ IPFS metadata URI for this ticket (ipfs://CID)
     */
    function mintTicket(string calldata tokenURI_)
        external
        payable
        nonReentrant
        whenNotPaused
        whenSaleActive
        returns (uint256)
    {
        require(totalSupply() < maxSupply, "All tickets sold out");
        require(msg.value >= ticketPrice, "Insufficient MATIC sent");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI_);

        mintPrice[tokenId] = msg.value;
        ticketUsed[tokenId] = false;

        // Refund excess payment
        if (msg.value > ticketPrice) {
            uint256 excess = msg.value - ticketPrice;
            (bool refunded, ) = payable(msg.sender).call{value: excess}("");
            require(refunded, "Refund failed");
        }

        emit TicketMinted(msg.sender, tokenId, tokenURI_, ticketPrice);
        return tokenId;
    }

    /**
     * @notice Burn a ticket on gate entry (destroys the NFT permanently).
     * @param tokenId Token ID to burn
     */
    function burnTicket(uint256 tokenId) external {
        require(
            ownerOf(tokenId) == msg.sender || msg.sender == organizer || msg.sender == owner(),
            "Not authorized to burn"
        );
        require(!ticketUsed[tokenId], "Ticket already used");

        ticketUsed[tokenId] = true;
        _burn(tokenId);

        emit TicketBurned(tokenId, msg.sender);
    }

    /**
     * @notice Mark ticket as used (soft invalidation — keeps the NFT).
     * @param tokenId Token ID to mark used
     */
    function markUsed(uint256 tokenId) external onlyOrganizer {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(!ticketUsed[tokenId], "Already marked used");

        ticketUsed[tokenId] = true;
        emit TicketMarkedUsed(tokenId);
    }

    /**
     * @notice Verify ticket details (ownership + used status).
     * @return tokenOwner Address of the ticket owner
     * @return isUsed     Whether the ticket has been used
     * @return uri        Token metadata URI
     */
    function verifyTicket(uint256 tokenId)
        external
        view
        returns (
            address tokenOwner,
            bool    isUsed,
            string  memory uri
        )
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return (ownerOf(tokenId), ticketUsed[tokenId], tokenURI(tokenId));
    }

    /**
     * @notice Get all token IDs owned by an address.
     */
    function tokensByOwner(address owner_) external view returns (uint256[] memory) {
        uint256 count = balanceOf(owner_);
        uint256[] memory tokens = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            tokens[i] = tokenOfOwnerByIndex(owner_, i);
        }
        return tokens;
    }

    /**
     * @notice Get the max resale price allowed for a token (in wei).
     */
    function maxResalePrice(uint256 tokenId) external view returns (uint256) {
        return (mintPrice[tokenId] * resalePriceCap) / 100;
    }

    // ─── Admin Functions ──────────────────────────────────────────────────────

    function toggleSale() external onlyOrganizer {
        saleActive = !saleActive;
        emit SaleToggled(saleActive);
    }

    function setMaxSupply(uint256 newMaxSupply) external onlyOwner {
        require(newMaxSupply >= totalSupply(), "Cannot reduce below minted count");
        maxSupply = newMaxSupply;
        emit MaxSupplyUpdated(newMaxSupply);
    }

    function setTicketPrice(uint256 newPrice) external onlyOwner {
        ticketPrice = newPrice;
        emit PriceUpdated(newPrice);
    }

    function setResalePriceCap(uint256 newCap) external onlyOwner {
        require(newCap >= 100, "Cap must be >= 100%");
        resalePriceCap = newCap;
    }

    function setOrganizer(address newOrganizer) external onlyOwner {
        require(newOrganizer != address(0), "Invalid address");
        organizer = newOrganizer;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Withdraw all contract funds to the organizer wallet.
     */
    function withdrawFunds() external onlyOrganizer nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool sent, ) = payable(organizer).call{value: balance}("");
        require(sent, "Withdrawal failed");

        emit FundsWithdrawn(organizer, balance);
    }

    // ─── ERC721 Overrides ─────────────────────────────────────────────────────

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    receive() external payable {}
}
