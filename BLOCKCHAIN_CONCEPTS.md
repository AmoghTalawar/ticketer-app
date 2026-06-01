# BlockTicket — Blockchain Concepts & End-to-End Technical Guide

This document explains **every blockchain concept used in BlockTicket**, how they are wired together, and what happens at each step of the system from the moment a user opens the browser to the moment a ticket is burned at the venue gate.

---

## Table of Contents

1. [What is a Blockchain? (In context of this project)](#1-what-is-a-blockchain-in-context-of-this-project)
2. [What is an NFT / ERC-721?](#2-what-is-an-nft--erc-721)
3. [Smart Contracts — The Core of BlockTicket](#3-smart-contracts--the-core-of-blockticket)
4. [The Three Smart Contracts Explained](#4-the-three-smart-contracts-explained)
5. [MetaMask & Wallets — How Identity Works](#5-metamask--wallets--how-identity-works)
6. [Sign-In With Ethereum (SIWE)](#6-sign-in-with-ethereum-siwe)
7. [Ethers.js — The Bridge Between Frontend & Blockchain](#7-ethersjs--the-bridge-between-frontend--blockchain)
8. [IPFS & Pinata — Decentralized Metadata Storage](#8-ipfs--pinata--decentralized-metadata-storage)
9. [End-to-End Flow: Event Creation](#9-end-to-end-flow-event-creation)
10. [End-to-End Flow: Ticket Purchase & Minting](#10-end-to-end-flow-ticket-purchase--minting)
11. [End-to-End Flow: Resale Marketplace](#11-end-to-end-flow-resale-marketplace)
12. [End-to-End Flow: Gate Verification & Burning](#12-end-to-end-flow-gate-verification--burning)
13. [Role-Based Access Control (RBAC)](#13-role-based-access-control-rbac)
14. [Security Mechanisms Explained](#14-security-mechanisms-explained)
15. [Data Architecture — On-Chain vs Off-Chain](#15-data-architecture--on-chain-vs-off-chain)
16. [Hardhat — Local Development Blockchain](#16-hardhat--local-development-blockchain)

---

## 1. What is a Blockchain? (In context of this project)

A blockchain is a distributed ledger — a database that is simultaneously maintained by thousands of computers worldwide. No single person or company controls it. Once data is written into a block, it cannot be changed or deleted.

**In BlockTicket**, the blockchain serves as the **ultimate source of truth** for:
- Who owns which ticket (token ownership)
- Whether a ticket has been used at the gate (`ticketUsed` flag)
- How much a ticket was originally purchased for (`mintPrice`)
- What the maximum resale price is (`maxResalePrice`)

This makes fraud impossible — the data on-chain cannot be altered, faked, or duplicated.

### Why not just use a database?

| Feature | Traditional Database | Blockchain |
|---|---|---|
| Who controls it | A company (centralized) | No one / everyone (decentralized) |
| Can data be changed | Yes, by admins | No, permanently recorded |
| Can be faked | Yes | No, cryptographically secured |
| Ownership proof | Off-chain record | Cryptographic on-chain proof |
| Ticket duplication | Possible | Impossible (token ID is unique) |

---

## 2. What is an NFT / ERC-721?

**NFT = Non-Fungible Token**

A **fungible** token is interchangeable — one 10-rupee note is identical to another. A **non-fungible** token is unique — one ticket for Row 3 Seat 7 is NOT the same as Row 3 Seat 8.

**ERC-721** is the Ethereum standard for NFTs. Every token has:
- A unique integer `tokenId` (e.g. `0`, `1`, `2`…)
- An `owner` address
- A `tokenURI` pointing to metadata stored on IPFS
- Transfer and approval functions built-in

**In BlockTicket**, every ticket is an ERC-721 NFT:

```solidity
// TicketNFT.sol
contract TicketNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable, Pausable, ReentrancyGuard
```

Each ticket inherits all standard ERC-721 capabilities including `ownerOf(tokenId)`, `transferFrom()`, `approve()`, and `tokenURI()`.

---

## 3. Smart Contracts — The Core of BlockTicket

A **smart contract** is a program that lives permanently on the blockchain. Once deployed, it runs exactly as written — no one can modify its rules, not even the deployer.

**Solidity** is the programming language used to write smart contracts on Ethereum-compatible chains. It compiles to **EVM bytecode** (Ethereum Virtual Machine), which runs deterministically across every node in the network.

### How a Smart Contract Transaction Works

```
User clicks "Mint Ticket"
         │
         ▼
MetaMask shows transaction preview
(gas fee estimate + ETH amount)
         │
  User approves (signs with private key)
         │
         ▼
Signed transaction broadcast to the Hardhat network
         │
         ▼
Hardhat validator includes it in a block
         │
         ▼
EVM executes mintTicket() function
(checks payment, creates token, emits event)
         │
         ▼
State change is permanent on-chain
(ownerOf(tokenId) now returns buyer's address)
         │
         ▼
Transaction receipt returned to frontend
(contains tokenId from event log)
```

---

## 4. The Three Smart Contracts Explained

### 4.1 `TicketNFT.sol` — The Individual Event Contract

This is the **heart** of the system. One instance is deployed per event.

**Key State Variables:**
```solidity
uint256 public maxSupply;          // Total tickets available
uint256 public ticketPrice;        // Price in wei (1 ETH = 10^18 wei)
uint256 public resalePriceCap;     // e.g. 110 = max 110% of original price
address public organizer;          // Event organizer's wallet address
bool    public saleActive;         // Whether tickets can be purchased

mapping(uint256 => bool)    public ticketUsed;   // tokenId => burned at gate?
mapping(uint256 => uint256) public mintPrice;    // tokenId => original purchase price
```

**Key Functions:**

| Function | What it does |
|---|---|
| `mintTicket(tokenURI)` | Creates a new NFT ticket and transfers it to the buyer. Requires exact ETH payment. |
| `burnTicket(tokenId)` | Permanently destroys the NFT. Called by gate organizer on entry. |
| `markUsed(tokenId)` | Soft invalidation — keeps the NFT but marks `ticketUsed = true`. |
| `verifyTicket(tokenId)` | Read-only. Returns `(owner, isUsed, tokenURI)` for gate scanner. |
| `maxResalePrice(tokenId)` | Returns `mintPrice[tokenId] * resalePriceCap / 100` — the price ceiling. |
| `withdrawFunds()` | Sends all collected ETH to the organizer wallet. |
| `toggleSale()` | Opens or closes ticket sales. |

**Modifiers used:**
```solidity
modifier onlyOrganizer() {
    require(msg.sender == organizer || msg.sender == owner(), "Not authorized");
    _;
}

modifier whenSaleActive() {
    require(saleActive, "Sale is not active");
    _;
}
```
These Solidity modifiers are **access control guards** that enforce who can call which function. They execute before the function body (the `_;` marks where the function body runs).

---

### 4.2 `EventFactory.sol` — The Contract Deployer

Instead of one global contract for all events (which would mix up funds and permissions), EventFactory uses the **Factory Design Pattern** to deploy a fresh `TicketNFT` per event.

```solidity
// EventFactory.sol
function createEvent(
    string calldata name,
    string calldata symbol,
    uint256 maxSupply,
    uint256 ticketPrice,
    uint256 resalePriceCap,
    address organizer
) external returns (address) {
    TicketNFT newEvent = new TicketNFT(name, symbol, maxSupply, ticketPrice, resalePriceCap, organizer);
    newEvent.transferOwnership(organizer);  // Organizer owns their event contract
    deployedEvents.push(address(newEvent));
    emit EventCreated(address(newEvent), ...);
    return address(newEvent);
}
```

**Why this matters:**
- Bruno Mars concert funds are **isolated** from Coldplay concert funds
- Each organizer has **full ownership** of their own contract
- If one event contract is compromised, others are unaffected
- The blockchain transaction receipt for `createEvent()` returns the new contract address, which is saved to MongoDB

---

### 4.3 `TicketMarketplace.sol` — The Resale Exchange

This contract enforces the anti-scalping rules. Sellers must list here (not sell directly) so the price cap can be enforced.

**The anti-scalping check:**
```solidity
function listTicket(address nftContractAddress, uint256 tokenId, uint256 price) external {
    TicketNFT nftContract = TicketNFT(payable(nftContractAddress));
    
    // Enforce the price cap from the NFT contract
    uint256 cap = nftContract.maxResalePrice(tokenId);  // originalPrice * cap% / 100
    require(price <= cap, "Price exceeds resale cap");   // REVERTS if scalping attempt
    
    // Requires prior approval from NFT owner
    require(nftContract.getApproved(tokenId) == address(this) || ...);
    
    listings[nftContractAddress][tokenId] = Listing({ seller: msg.sender, price: price, active: true });
}
```

**Why approval is needed first:**
ERC-721 ownership means only the owner can transfer their token. To list on the marketplace, the buyer first calls `NFTContract.approve(marketplaceAddress, tokenId)` — granting the marketplace smart contract the right to transfer their NFT when a purchase happens. Without this, `buyTicket()` would revert.

**The purchase flow on-chain:**
```solidity
function buyTicket(address nftContractAddress, uint256 tokenId) external payable nonReentrant {
    Listing storage listing = listings[nftContractAddress][tokenId];
    require(listing.active, "Ticket not listed for sale");
    require(msg.value >= listing.price, "Insufficient ETH sent");
    require(msg.sender != listing.seller, "Cannot buy your own ticket");

    address seller = listing.seller;
    uint256 price  = listing.price;
    _removeListing(nftContractAddress, tokenId);

    // Transfer NFT from seller to buyer
    TicketNFT(payable(nftContractAddress)).transferFrom(seller, msg.sender, tokenId);

    // Distribute funds: seller gets price minus platform fee
    uint256 fee           = (price * platformFeePercent) / 100;
    uint256 sellerPayment = price - fee;
    payable(seller).call{value: sellerPayment}("");
}
```

**`nonReentrant` modifier** — This OpenZeppelin guard prevents **reentrancy attacks**, where a malicious contract in the call chain tries to call `buyTicket()` again before the first call finishes (which could drain funds). The modifier locks execution for the duration of the function.

---

## 5. MetaMask & Wallets — How Identity Works

In traditional apps, you log in with email + password. In blockchain apps, **identity = a cryptographic key pair**:

- **Private Key**: A 256-bit secret number. Never shared. Used to sign transactions.
- **Public Key**: Mathematically derived from the private key.
- **Wallet Address**: The last 20 bytes of the `keccak256` hash of the public key (e.g. `0x70997970...`).

**MetaMask** is a browser extension that securely stores your private key and acts as a signing interface. When the app wants to send a transaction:
1. The app builds the transaction data
2. MetaMask shows the user a preview
3. The user clicks **Confirm**
4. MetaMask signs the transaction with the private key
5. The signed transaction is broadcast to the blockchain

The app **never has access to the private key** — MetaMask handles all signing in an isolated secure environment.

### How BlockTicket reads the connected wallet

```jsx
// WalletContext.jsx
const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
// Returns: ['0x70997970c51812dc3a010c7d01b50e0d17dc79c8']

const provider = new ethers.BrowserProvider(window.ethereum);
const signer   = await provider.getSigner();
// signer can sign transactions on behalf of the connected account
```

`window.ethereum` is the MetaMask injection — it exposes an Ethereum JSON-RPC provider. `ethers.BrowserProvider` wraps it into a clean Ethers.js API.

---

## 6. Sign-In With Ethereum (SIWE)

Instead of passwords, BlockTicket uses cryptographic proof of wallet ownership:

```
Step 1: Frontend asks backend for a nonce
         POST /api/auth/nonce { walletAddress }
         ← Returns: { message: "Sign this to login: abc123xyz" }

Step 2: MetaMask signs the message with user's private key
         const signature = await signer.signMessage(message)
         ← Returns: "0x4f7b3c..." (65-byte ECDSA signature)

Step 3: Backend verifies the signature
         POST /api/auth/verify { walletAddress, signature }
         Backend recovers the signer address from the signature
         If recoveredAddress === walletAddress → Login successful
         ← Returns: { token: "eyJhbGc..." } (JWT)
```

**Why this is secure:** The signature mathematically proves that the sender holds the private key for that wallet address. It is impossible to forge without the private key. The backend uses `ethers.verifyMessage(message, signature)` to recover and verify the signer's address.

**JWT (JSON Web Token)** is then used for all subsequent API calls to avoid requiring a blockchain signature every time:
```jsx
localStorage.setItem('blockticket_token', verifyData.token);
// Used in API headers: Authorization: Bearer <token>
```

---

## 7. Ethers.js — The Bridge Between Frontend & Blockchain

Ethers.js is the JavaScript library that allows the React frontend to communicate with smart contracts.

### Read vs Write Contracts

```js
// useContract.js

// READ contract (no wallet needed — uses public JSON-RPC endpoint)
const nftRead = new ethers.Contract(address, TicketNFTAbi.abi, provider);

// WRITE contract (requires wallet signer to pay gas & sign tx)
const nftWrite = new ethers.Contract(address, TicketNFTAbi.abi, signer);
```

**Provider** = connection to the blockchain (can read data)  
**Signer** = provider + wallet (can also write/sign transactions)

### Dynamic Contract Instantiation

Because EventFactory deploys a new `TicketNFT` per event, the frontend cannot hardcode the address. The `getNFTContract` helper creates contract instances on-the-fly with any address:

```js
// useContract.js
const getNFTContract = useCallback((address, write = false) => {
    if (write) {
        return new ethers.Contract(address, TicketNFTAbi.abi, signer);
    } else {
        return new ethers.Contract(address, TicketNFTAbi.abi, provider);
    }
}, [provider, signer]);
```

### Calling a Payable Function

```js
// Checkout.jsx — minting a ticket
const priceWei = onChainPrice;  // e.g. 10000000000000000n (0.01 ETH in wei)

const tx = await nftWriteCustom.mintTicket(tokenURI, { value: priceWei });
// ↑ Triggers MetaMask popup for user to confirm

const receipt = await tx.wait();  // Waits for the block to be mined

// Parse the TicketMinted event from the receipt logs to extract tokenId
for (const log of receipt.logs) {
    const parsed = iface.parseLog(log);
    if (parsed?.name === 'TicketMinted') {
        tokenId = parsed.args.tokenId.toString();
    }
}
```

### ABI (Application Binary Interface)

The ABI is a JSON description of all functions and events in a smart contract. Ethers.js uses it to:
- Encode function calls into hex data for the blockchain
- Decode response bytes back into JavaScript values
- Parse event logs from transaction receipts

```json
// TicketNFT.json (ABI excerpt)
{
  "name": "mintTicket",
  "type": "function",
  "inputs": [{ "name": "tokenURI_", "type": "string" }],
  "outputs": [{ "name": "", "type": "uint256" }],
  "stateMutability": "payable"
}
```

---

## 8. IPFS & Pinata — Decentralized Metadata Storage

**IPFS (InterPlanetary File System)** is a peer-to-peer distributed storage network. Files are content-addressed — meaning the address of a file is the `SHA-256` hash of its content (called a **CID, Content Identifier**).

### Why IPFS for ticket metadata?

If ticket metadata (seat info, event name, image) were stored in a central database:
- The company could change ticket details after purchase
- The server could go down, breaking all ticket displays

With IPFS:
- The CID permanently identifies that exact JSON — if anyone changes one byte, the CID changes
- The metadata is pinned permanently by Pinata's infrastructure
- The `tokenURI` stored on-chain (`ipfs://Qm...`) always resolves to the same immutable data

### NFT Metadata Format

```json
{
  "name": "Bruno Mars Live in Mumbai - Ticket #3",
  "description": "Official NFT ticket for Bruno Mars at DY Patil Stadium",
  "image": "https://images.unsplash.com/...",
  "attributes": [
    { "trait_type": "Event",  "value": "Bruno Mars Live in Mumbai" },
    { "trait_type": "Venue",  "value": "DY Patil Stadium" },
    { "trait_type": "Date",   "value": "June 04, 2026" },
    { "trait_type": "Seat",   "value": "Section 1, Row 3, Seat 7" },
    { "trait_type": "Category", "value": "VIP" }
  ]
}
```

### Fallback: Data URI

When Pinata is unavailable (e.g. development without API keys), the frontend generates a `data:application/json;base64,...` URI — a base64-encoded JSON embedded directly in the blockchain transaction:

```js
// Checkout.jsx
const buildTokenURI = (seat, eventName, date, imageUrl) => {
  const metadata = { name, description, image, attributes };
  const json = JSON.stringify(metadata);
  const bytes = new TextEncoder().encode(json);
  return 'data:application/json;base64,' + btoa(...);
};
```

This ensures the minting flow works even in local development.

---

## 9. End-to-End Flow: Event Creation

```
[Organizer fills Create Event form]
         │
         ▼
Frontend POST /api/events (title, price, supply, cap, image URL)
         │
         ▼
Backend saves Event document in MongoDB (no contractAddress yet)
         │
         ▼
Frontend calls: eventFactoryWrite.createEvent(name, symbol, supply, priceWei, cap, organizer)
         │
         ▼  ← MetaMask popup — organizer pays gas to deploy a new contract
         │
         ▼
Hardhat mines the block
EventFactory deploys a brand new TicketNFT.sol at a unique address
Event emits: EventCreated(newContractAddress, ...)
         │
         ▼
Frontend reads the new contract address from the event receipt
         │
         ▼
Frontend calls: newContract.toggleSale()   ← Activates ticket sales
         │  ← MetaMask popup again (2nd tx)
         │
         ▼
Frontend PATCH /api/events/:id { contractAddress }
Backend updates MongoDB Event record with the live contract address
         │
         ▼
Event now visible on Concerts & Home pages with a "Book Now" button
```

---

## 10. End-to-End Flow: Ticket Purchase & Minting

```
[Buyer clicks Book Now on Bruno Mars event]
         │
         ▼
Frontend: Fetches event from MongoDB via GET /api/events/:id
Loads EventDetail page with seat map and price
         │
[Buyer selects Seat: Section 1, Row 3, Seat 7]
         │
         ▼
Frontend navigates to /checkout with event + seat state
         │
[Checkout page loads]
         │
         ▼
Frontend reads ticketPrice from on-chain:
  nftReadCustom.ticketPrice() → 10000000000000000 (0.01 ETH in wei)
         │
         ▼
[Buyer clicks Mint NFT Ticket]

Step 1 — Upload Metadata to IPFS:
  POST /api/ipfs/upload-metadata { name, description, seat, attributes }
  Backend calls Pinata API → pins JSON to IPFS
  Returns: { tokenURI: "ipfs://QmXxx...", cid: "QmXxx..." }

Step 2 — Mint NFT on-chain:
  nftWriteCustom.mintTicket(tokenURI, { value: priceWei })
  ← MetaMask popup: "Confirm sending 0.01 ETH"
  tx.wait() → waits for block confirmation
  Parse logs → extract tokenId (e.g. 3)

Step 3 — Record in MongoDB:
  POST /api/tickets/mint {
    tokenId: "3",
    owner: "0x70997970...",
    transactionHash: "0xa627...",
    seat: "Section 1, Row 3, Seat 7",
    tokenURI: "ipfs://QmXxx...",
    eventId: "6651abc..."    ← MongoDB ObjectId of the event
  }

         ▼
Frontend redirects to /mint-success
Buyer can now:
  - Click "Download Ticket" → /ticket page with QR code
  - Click "View My Tickets" → /my-tickets
```

### What the QR Code Contains

```
BLOCKTICKET:0x5FbDB2315678afecb367f032d93F642f64180aa3:3:0x70997970C51812dc3A010C7d01b50e0d17dc79C8
            ↑ contractAddress                          ↑tokenId ↑ ownerAddress
```

This compact string encodes everything the gate scanner needs to verify on-chain without any external API calls.

---

## 11. End-to-End Flow: Resale Marketplace

### Listing a Ticket for Resale

```
[Buyer goes to My Tickets, clicks Resell Ticket]
         │
         ▼
Buyer enters resale price (e.g. 0.011 ETH)

Step 1 — Approve Marketplace:
  customNFTWrite.approve(marketplaceAddress, tokenId)
  ← MetaMask popup (approve transaction)
  This grants marketplace contract the right to transfer the NFT

Step 2 — List on Marketplace:
  marketplaceWrite.listTicket(contractAddress, tokenId, priceWei)
  Contract checks: price <= nftContract.maxResalePrice(tokenId)
                          = mintPrice[3] * 110 / 100
                          = 0.01 ETH * 1.1 = 0.011 ETH  ✓ Allowed
  Listing is stored: listings[contractAddress][tokenId] = { seller, price, active: true }
  ← MetaMask popup (list transaction)

Step 3 — Notify Backend:
  POST /api/tickets/list-resale { tokenId, resalePrice, owner }
  MongoDB: ticket.isListed = true, ticket.resalePrice = "0.011"
```

### Buying a Resale Ticket

```
[Charlie visits Resale Market]
         │
         ▼
Frontend: GET /api/tickets/resale
Backend: Ticket.find({ isListed: true }).populate('eventId')
Returns tickets with their event contractAddress

For each listing, frontend verifies on-chain:
  marketplaceRead.listings(contractAddress, tokenId)
  → { seller, price, active: true }

[Charlie clicks Buy for 0.011 ETH]
         │
         ▼
marketplaceWrite.buyTicket(contractAddress, tokenId, { value: price })
  ← MetaMask popup
  Contract executes:
    1. Removes listing
    2. TicketNFT.transferFrom(seller, buyer, tokenId)  ← NFT transfers on-chain
    3. Pays seller: 0.011 - (0.011 * 2%) = 0.01078 ETH
    4. Platform fee 2% kept in contract
         │
         ▼
Frontend: POST /api/tickets/buy-resale { tokenId, newOwner, transactionHash }
Backend updates MongoDB: ticket.owner = Charlie's address, ticket.isListed = false
         │
         ▼
Frontend redirects to /my-tickets (Charlie now sees the ticket)
```

---

## 12. End-to-End Flow: Gate Verification & Burning

```
[Organizer (Alice) opens Gate Scanner at venue]
Switches MetaMask to Account #0 and logs in as Organizer
Navigates to /ticket-verification
         │
[Buyer (Charlie) shows downloaded ticket — organizer scans QR]
QR value: BLOCKTICKET:0x5FbDB...:3:0x3C44CdD...

Step 1 — Parse QR:
  parts = value.split(':')
  contractAddress = parts[1]  // "0x5FbDB..."
  tokenId         = parts[2]  // "3"
  claimedOwner    = parts[3]  // "0x3C44CdD..."

Step 2 — Verify On-Chain:
  const nft = getNFTContract(contractAddress, false)  // read-only
  const [actualOwner, isUsed, uri] = await nft.verifyTicket(3)

  Checks:
  ✓ actualOwner === claimedOwner  (ownership matches QR claim)
  ✓ isUsed === false              (not already scanned)

  → Shows: VALID TICKET ✓ (green screen)

Step 3 — Grant Entry & Burn:
  Organizer clicks "🔥 Grant Entry & Burn Ticket"
  const nftWrite = getNFTContract(contractAddress, true)  // write with signer
  const tx = await nftWrite.burnTicket(3)
  ← MetaMask popup (organizer signs and pays gas)
  tx.wait()

  On-chain result:
    ticketUsed[3] = true
    _burn(3)  ← NFT is permanently destroyed
    emit TicketBurned(3, organizer)

Step 4 — Notify Backend:
  POST /api/tickets/mark-used { tokenId: "3", transactionHash }
  MongoDB: ticket.isUsed = true, ticket.usedAt = now

         ▼
If Charlie tries to enter again with the same QR:
  verifyTicket(3) → reverts with "Token does not exist"  (burned)
  OR ticketUsed[3] = true  → "Ticket already used"
  → Shows: INVALID TICKET ✗ (red screen)
```

---

## 13. Role-Based Access Control (RBAC)

BlockTicket implements a dual-layer RBAC system:

### Layer 1: On-Chain (Solidity modifiers)

```solidity
// Only organizer or owner can call admin functions
modifier onlyOrganizer() {
    require(msg.sender == organizer || msg.sender == owner(), "Not authorized");
    _;
}

// Only callable when the sale flag is active
modifier whenSaleActive() {
    require(saleActive, "Sale is not active");
    _;
}
```

Even if a malicious user bypasses the frontend UI, the contract itself **rejects unauthorized calls** at the EVM level.

### Layer 2: Frontend Route Guards (React)

```jsx
// App.jsx
<Route path="/ticket-verification"
  element={
    <WalletGuard allowedRoles={['organizer']}>
      <TicketVerification />
    </WalletGuard>
  }
/>
<Route path="/my-tickets"
  element={
    <WalletGuard allowedRoles={['user']}>
      <MyTickets />
    </WalletGuard>
  }
/>
```

```jsx
// WalletGuard.jsx
if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
  // Redirect organizers to organizer dashboard, users to /account
  return <Navigate to={user.role === 'organizer' ? '/organizer-dashboard' : '/account'} />;
}
```

### Layer 3: Navbar Filtering

```jsx
// Navbar.jsx
const menuItems = user?.role === 'organizer'
  ? [{ label: 'Organizer Dashboard', path: '/organizer-dashboard' },
     { label: 'Create Event',         path: '/create-event'         },
     { label: 'Gate Scanner',         path: '/ticket-verification'  }]
  : [{ label: 'My Tickets',     path: '/my-tickets'         },
     { label: 'Resale Market',  path: '/resale-market'      },
     { label: 'Account',        path: '/account'            }];
```

Organizers never see buyer menus. Buyers never see organizer tools.

---

## 14. Security Mechanisms Explained

### ReentrancyGuard
Prevents recursive calls that could drain contract funds:
```solidity
// TicketNFT.sol & TicketMarketplace.sol
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

function mintTicket(...) external payable nonReentrant { ... }
function buyTicket(...)  external payable nonReentrant { ... }
```
The `nonReentrant` modifier sets a lock on first entry and releases it on exit, preventing any re-entry during execution.

### Pausable
Emergency stop mechanism for the contract:
```solidity
function pause()   external onlyOwner { _pause();   }
function unpause() external onlyOwner { _unpause(); }

function mintTicket(...) external payable whenNotPaused { ... }
```
If a vulnerability is discovered, the contract owner can instantly halt all minting.

### On-Chain Price Cap
The resale ceiling is enforced in Solidity — not the UI:
```solidity
uint256 cap = nftContract.maxResalePrice(tokenId);
// = mintPrice[tokenId] * resalePriceCap / 100
require(price <= cap, "Price exceeds resale cap");
```
Even if a user calls the marketplace contract directly (bypassing the frontend), they cannot list above the cap.

### Excess Payment Refund
Protects buyers from overpaying:
```solidity
if (msg.value > ticketPrice) {
    uint256 excess = msg.value - ticketPrice;
    (bool refunded, ) = payable(msg.sender).call{value: excess}("");
    require(refunded, "Refund failed");
}
```

---

## 15. Data Architecture — On-Chain vs Off-Chain

BlockTicket uses a **hybrid architecture** — some data lives on-chain (permanent, tamper-proof) and some lives off-chain (fast, queryable).

| Data | Where Stored | Why |
|---|---|---|
| Token ownership | On-chain (ERC-721 `ownerOf`) | Tamper-proof ownership proof |
| Ticket used status | On-chain (`ticketUsed` mapping) | Cannot be faked, prevents double-entry |
| Ticket price | On-chain (`ticketPrice`, `mintPrice`) | Enforces resale cap mathematically |
| NFT metadata | IPFS (via Pinata) | Immutable, decentralized, content-addressed |
| Event details (title, date, image) | MongoDB | Fast queries, full-text searchable |
| Contract address per event | MongoDB | Allows frontend to find the right contract |
| User profiles (name, role) | MongoDB | Off-chain, mutable, queryable |
| Transaction history | MongoDB (mirrored from on-chain) | Fast loading for UI display |
| JWT session tokens | Browser localStorage | Stateless auth without blockchain call per page |

### Why MongoDB in addition to blockchain?

Blockchain queries are slow (require RPC calls to a node). For displaying events on the home page or listing all concerts, querying MongoDB is **100x faster**. The blockchain is the **source of truth for ownership and validity** — MongoDB is the **index for efficient discovery**.

---

## 16. Hardhat — Local Development Blockchain

**Hardhat** is a local Ethereum development environment. Running `npx hardhat node` starts a full Ethereum-compatible blockchain on your machine that:

- Mines blocks instantly (no 12-second wait)
- Pre-funds 20 accounts with 10,000 ETH each (for testing)
- Provides full `console.log()` support in Solidity
- Resets cleanly on restart

### Chain ID 1337

The hardhat config sets `chainId: 1337`. MetaMask uses this ID to distinguish networks. The frontend reads it:

```js
// addresses.js
export const CHAIN_ID = 1337;
```

And enforces it on checkout:
```js
// Checkout.jsx
const metamaskChainId = parseInt(await window.ethereum.request({ method: 'eth_chainId' }), 16);
if (metamaskChainId !== CHAIN_ID) {
    setToast({ status: 'error', message: 'Wrong network. Switch to Hardhat Local.' });
    return;
}
```

### The Deploy Script

```js
// blockchain/scripts/deploy.js
const Marketplace = await ethers.deployContract("TicketMarketplace", [2]); // 2% fee
await Marketplace.waitForDeployment();

const Factory = await ethers.deployContract("EventFactory", [Marketplace.target]);
await Factory.waitForDeployment();

// Auto-writes addresses to frontend
const addresses = {
    TicketNFT: "0x856e4424...",   // default/fallback
    TicketMarketplace: Marketplace.target,
    EventFactory: Factory.target,
};
fs.writeFileSync('../src/contracts/addresses.js', ...);
```

This automation means you never manually copy-paste contract addresses between terminals.

---

## Summary: The Complete Blockchain Journey

```
ACCOUNT CREATION
  User registers → wallet address is their identity
  SIWE: signs a message → backend verifies → JWT issued

EVENT CREATION
  Organizer fills form → EventFactory.createEvent() → new TicketNFT deployed
  New contract address saved to MongoDB

TICKET PURCHASE
  Buyer selects seat → metadata uploaded to IPFS → tokenURI created
  mintTicket(tokenURI, {value: price}) → NFT minted on-chain
  MongoDB records: tokenId, owner, eventId, seat, txHash

TICKET DOWNLOAD
  QR code encodes: BLOCKTICKET:contractAddress:tokenId:ownerAddress
  html2canvas renders ticket card → downloaded as PNG

RESALE LISTING
  NFT.approve(marketplace, tokenId) → marketplace.listTicket(contract, id, price)
  On-chain price cap enforced → listing active in marketplace

RESALE PURCHASE
  marketplace.buyTicket(contract, tokenId, {value: price})
  NFT transfers on-chain: seller → buyer
  MongoDB updates owner field

GATE SCAN
  Organizer scans QR → parses contractAddress + tokenId + claimedOwner
  verifyTicket(tokenId) → checks actual on-chain owner + isUsed
  If valid: burnTicket(tokenId) → NFT permanently destroyed
  Ticket can never be scanned again
```

---

*Built with Solidity, Hardhat, Ethers.js, React, Node.js, MongoDB, and IPFS — forming a complete, trustless event ticketing ecosystem.*
