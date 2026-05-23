# BlockTicket — Blockchain-Based Event Ticket Fraud Prevention System

A decentralized event ticketing platform that uses ERC-721 NFT tickets on the Polygon blockchain to eliminate fake tickets, duplication, unauthorized resale, and ticket reuse fraud.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Current Project Status](#3-current-project-status)
4. [Frontend — Existing Pages](#4-frontend--existing-pages)
5. [Frontend — Missing Pages & Features](#5-frontend--missing-pages--features)
6. [Backend — Required Modules & APIs](#6-backend--required-modules--apis)
7. [Smart Contracts — Solidity Implementation](#7-smart-contracts--solidity-implementation)
8. [IPFS & Metadata Architecture](#8-ipfs--metadata-architecture)
9. [3-Day Phased Implementation Plan](#9-3-day-phased-implementation-plan)
10. [Folder Structure (Target)](#10-folder-structure-target)
11. [Environment Variables](#11-environment-variables)
12. [Getting Started](#12-getting-started)

---

## 1. Project Overview

BlockTicket prevents ticket fraud by representing every ticket as a non-fungible token (NFT) on the Polygon blockchain. Each ticket has:

- A unique on-chain identity (ERC-721 token) that cannot be duplicated
- Metadata stored immutably on IPFS via Pinata
- A QR code that resolves to on-chain ownership for gate verification
- A burn mechanism that invalidates the ticket upon entry
- A capped resale market to prevent scalping beyond a configurable price ceiling

**Fraud vectors eliminated:**

| Fraud Type | How BlockTicket Prevents It |
|---|---|
| Fake tickets | Every ticket is minted on-chain; fakes fail ownership check |
| Duplicate tickets | Token ID is unique; burning on entry prevents reuse |
| Unauthorized resale | Resale only via smart contract with price cap enforcement |
| Ticket reuse | Token is burned (destroyed) after gate scan |

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), React Router, Ethers.js, QRCode.react |
| Authentication | MetaMask wallet login + JWT (for off-chain session) |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Smart Contracts | Solidity ^0.8.20 (ERC-721, OpenZeppelin) |
| Blockchain Network | Polygon Amoy Testnet → Polygon Mainnet |
| IPFS Storage | Pinata (ticket metadata + images) |
| Wallet | MetaMask |
| Contract Dev Tools | Hardhat, Ethers.js |
| Image/QR | QRCode.react, html2canvas |

---

## 3. Current Project Status

### What is Done

- Complete frontend UI design (React + Vite)
- 15 page components covering the full user journey
- Routing via React Router
- Static UI for: Home, Concerts, Reservation, Checkout, Account, Login, Register, Download Ticket, Search, Blogs, FAQ, Contact

### What is NOT Yet Done

- No MetaMask / wallet integration
- No Ethers.js connection to blockchain
- No smart contracts written or deployed
- No backend (Node.js / Express) exists
- No MongoDB models or API routes
- No IPFS / Pinata integration
- No QR code generation or scanning
- No NFT minting flow
- No resale marketplace logic
- No burn-on-entry mechanism
- No JWT authentication wired up

---

## 4. Frontend — Existing Pages

| Page | File | Purpose |
|---|---|---|
| Home | `Home.jsx` | Landing page, event highlights, hero section |
| Concerts | `Concerts.jsx` | Browse all events/concerts |
| Singers | `Singers.jsx` | Artist/performer directory |
| Search Results | `SearchResults.jsx` | Event search output |
| Reservation | `Reservation.jsx` | Select seats and ticket quantity |
| Checkout | `Checkout.jsx` | Payment and mint confirmation UI |
| Download Ticket | `DownloadTicket.jsx` | Post-purchase ticket download |
| Account | `Account.jsx` | User profile and owned tickets |
| Login | `Login.jsx` | Login form (needs MetaMask integration) |
| Register | `Register.jsx` | Register form (needs wallet linkage) |
| Blogs | `Blogs.jsx` | Blog listing |
| Blog Detail | `BlogDetail.jsx` | Individual blog post |
| FAQ | `FAQ.jsx` | Frequently asked questions |
| Contact Us | `ContactUs.jsx` | Contact form |
| Not Found | `NotFound.jsx` | 404 page |

---

## 5. Frontend — Missing Pages & Features

### Missing Pages

| Page | Purpose |
|---|---|
| `OrganizerDashboard.jsx` | Event creation, ticket supply management, sales analytics |
| `CreateEvent.jsx` | Form for organizer to create a new event + IPFS upload |
| `MyTickets.jsx` | User's NFT tickets with QR codes and resale options |
| `ResaleMarket.jsx` | Marketplace for reselling tickets within price cap |
| `TicketVerification.jsx` | Gate scanner page — scan QR, verify on-chain, burn ticket |
| `MintSuccess.jsx` | Post-mint success screen showing NFT token ID |
| `TransactionHistory.jsx` | User's on-chain transaction log |
| `EventDetail.jsx` | Full event info, remaining supply, mint button |

### Missing Features in Existing Pages

| Page | What Needs to Be Added |
|---|---|
| `Login.jsx` | MetaMask connect button, `window.ethereum` detection, wallet address display |
| `Register.jsx` | Wallet address capture, link wallet to user profile via backend |
| `Checkout.jsx` | Ethers.js contract call to `mintTicket()`, transaction status, gas estimate |
| `Account.jsx` | Fetch owned NFTs via contract `balanceOf()` / `tokenOfOwnerByIndex()` |
| `DownloadTicket.jsx` | Generate QR code from token ID + owner address, downloadable PNG |
| `Reservation.jsx` | Live seat availability from contract, enforce supply limits |

### Missing Global Features

- `useWallet.js` hook — MetaMask connection, account state, network switching to Polygon
- `useContract.js` hook — Ethers.js contract instance (read + write)
- `WalletGuard.jsx` — Route protection for wallet-required pages
- `TransactionToast.jsx` — Pending / confirmed / failed tx notifications
- Network check banner — warn user if not on Polygon
- IPFS image loader component

---

## 6. Backend — Required Modules & APIs

### Architecture

```
backend/
├── server.js               # Express entry point
├── config/
│   ├── db.js               # MongoDB connection
│   └── pinata.js           # Pinata SDK setup
├── models/
│   ├── User.js             # User schema
│   ├── Event.js            # Event schema
│   └── Ticket.js           # Off-chain ticket record schema
├── routes/
│   ├── auth.routes.js      # Auth endpoints
│   ├── event.routes.js     # Event CRUD
│   ├── ticket.routes.js    # Ticket minting + resale
│   ├── ipfs.routes.js      # IPFS upload
│   └── verify.routes.js    # Gate verification
├── controllers/            # Business logic (one per route file)
├── middleware/
│   ├── auth.middleware.js  # JWT verification
│   └── wallet.middleware.js# Wallet signature verification
└── utils/
    ├── qrcode.js           # QR generation helper
    └── blockchain.js       # Ethers.js read-only helpers
```

### API Endpoints

#### Auth (`/api/auth`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/nonce` | Generate nonce for wallet signature challenge |
| POST | `/verify` | Verify MetaMask signature, return JWT |
| POST | `/register` | Create user profile linked to wallet address |
| GET | `/me` | Get current authenticated user |

#### Events (`/api/events`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List all events (with filters) |
| GET | `/:id` | Get single event details |
| POST | `/` | Create event (organizer only) |
| PUT | `/:id` | Update event (organizer only) |
| DELETE | `/:id` | Cancel event (organizer only) |
| GET | `/:id/availability` | Remaining ticket supply from contract |

#### Tickets (`/api/tickets`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/mint` | Record mint in DB after on-chain tx confirmed |
| GET | `/my` | Get user's tickets (by wallet address) |
| GET | `/:tokenId` | Get single ticket by NFT token ID |
| POST | `/list-resale` | List ticket for resale |
| POST | `/buy-resale` | Purchase resale ticket |
| DELETE | `/delist/:tokenId` | Remove from resale marketplace |

#### IPFS (`/api/ipfs`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload-image` | Upload ticket/event image to Pinata |
| POST | `/upload-metadata` | Upload NFT metadata JSON to Pinata |
| GET | `/metadata/:cid` | Fetch metadata by IPFS CID |

#### Verification (`/api/verify`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/scan` | Verify ticket ownership on-chain, initiate burn |
| GET | `/status/:tokenId` | Check if ticket has been burned/used |

### MongoDB Schemas

#### User
```js
{
  walletAddress: String (unique, lowercase),
  username: String,
  email: String,
  role: { type: String, enum: ['user', 'organizer', 'admin'] },
  createdAt: Date
}
```

#### Event
```js
{
  title: String,
  description: String,
  date: Date,
  venue: String,
  organizer: ObjectId (ref: User),
  totalSupply: Number,
  ticketPrice: String (in MATIC, stored as string for precision),
  priceCapPercent: Number (max resale % above original, e.g. 110),
  contractAddress: String,
  ipfsCID: String,
  imageUrl: String,
  category: String,
  isActive: Boolean
}
```

#### Ticket
```js
{
  tokenId: Number,
  eventId: ObjectId (ref: Event),
  owner: String (wallet address),
  mintedAt: Date,
  transactionHash: String,
  isUsed: Boolean,
  usedAt: Date,
  isListed: Boolean,
  resalePrice: String,
  ipfsMetadataCID: String
}
```

---

## 7. Smart Contracts — Solidity Implementation

### Contract 1: `TicketNFT.sol` (ERC-721 Core)

```
Inherits: ERC721, ERC721URIStorage, ERC721Enumerable, Ownable, Pausable
```

**State Variables**
```solidity
uint256 private _tokenIdCounter;
uint256 public maxSupply;
uint256 public ticketPrice;         // in wei
uint256 public resalePriceCap;      // percentage (e.g. 110 = 110% of original)
address public organizer;
bool public saleActive;
mapping(uint256 => bool) public ticketUsed;
mapping(uint256 => uint256) public mintPrice;  // original price per token
```

**Key Functions**

| Function | Visibility | Description |
|---|---|---|
| `mintTicket(string calldata tokenURI)` | external payable | Mint one NFT ticket; enforces supply cap and payment |
| `burnTicket(uint256 tokenId)` | external | Gate scanner burns ticket on entry; checks ownership |
| `verifyTicket(uint256 tokenId)` | external view | Returns owner, used status, and metadata URI |
| `markUsed(uint256 tokenId)` | external onlyOrganizer | Alternative to burn: mark as used without destroying |
| `setMaxSupply(uint256)` | external onlyOwner | Update max supply before sale |
| `setTicketPrice(uint256)` | external onlyOwner | Set price in wei |
| `toggleSale()` | external onlyOwner | Open or close ticket sale |
| `withdrawFunds()` | external onlyOwner | Pull Matic to organizer wallet |
| `tokensByOwner(address)` | external view | Return all token IDs owned by address |

**Events**
```solidity
event TicketMinted(address indexed buyer, uint256 indexed tokenId, string tokenURI);
event TicketBurned(uint256 indexed tokenId, address indexed burner);
event TicketUsed(uint256 indexed tokenId);
event FundsWithdrawn(address indexed organizer, uint256 amount);
```

---

### Contract 2: `TicketMarketplace.sol` (Resale Market)

**Purpose:** Enforces the price cap on secondary sales. Sellers cannot list above `originalPrice * resalePriceCap / 100`.

**State Variables**
```solidity
struct Listing {
    address seller;
    uint256 price;
    bool active;
}
mapping(uint256 => Listing) public listings;
TicketNFT public nftContract;
uint256 public platformFeePercent;  // e.g. 2 = 2%
```

**Key Functions**

| Function | Description |
|---|---|
| `listTicket(uint256 tokenId, uint256 price)` | List ticket for resale; enforces price cap |
| `buyTicket(uint256 tokenId)` | Purchase listed ticket; transfers NFT and distributes payment |
| `delistTicket(uint256 tokenId)` | Seller removes listing |
| `updatePrice(uint256 tokenId, uint256 newPrice)` | Seller updates price (still capped) |

**Events**
```solidity
event TicketListed(uint256 indexed tokenId, address indexed seller, uint256 price);
event TicketSold(uint256 indexed tokenId, address indexed buyer, uint256 price);
event TicketDelisted(uint256 indexed tokenId);
```

---

### Contract 3: `EventFactory.sol` (Optional — Multi-Event)

Creates a new `TicketNFT` contract per event, keeping supplies isolated.

```solidity
function createEvent(
    string calldata name,
    uint256 maxSupply,
    uint256 ticketPrice,
    uint256 resaleCap
) external returns (address)
```

---

### Deployment

- **Network:** Polygon Amoy Testnet (chainId: 80002) for dev; Polygon Mainnet (chainId: 137) for prod
- **Tool:** Hardhat with `@nomicfoundation/hardhat-toolbox`
- **OpenZeppelin:** `@openzeppelin/contracts ^5.x`
- **Verification:** Polygonscan API

---

## 8. IPFS & Metadata Architecture

### NFT Metadata Format (ERC-721 Standard)

Each ticket's IPFS metadata JSON follows the OpenSea standard:

```json
{
  "name": "BlockTicket #42 — Coldplay World Tour Mumbai",
  "description": "Official NFT ticket for Coldplay World Tour at DY Patil Stadium, Mumbai on 2026-01-18.",
  "image": "ipfs://QmXxx.../ticket-image.png",
  "external_url": "https://blockticket.app/ticket/42",
  "attributes": [
    { "trait_type": "Event", "value": "Coldplay World Tour" },
    { "trait_type": "Venue", "value": "DY Patil Stadium, Mumbai" },
    { "trait_type": "Date", "value": "2026-01-18" },
    { "trait_type": "Seat", "value": "Block A, Row 5, Seat 12" },
    { "trait_type": "Category", "value": "VIP" },
    { "trait_type": "Token ID", "value": "42" },
    { "trait_type": "Price", "value": "50 MATIC" }
  ]
}
```

### Upload Flow

```
Organizer creates event
        ↓
Upload event banner image → Pinata → returns imageHash (CID)
        ↓
Build metadata JSON with imageHash
        ↓
Upload metadata JSON → Pinata → returns metadataCID
        ↓
Store metadataCID in DB (Event.ipfsCID)
        ↓
On mint: pass "ipfs://<metadataCID>" as tokenURI to mintTicket()
        ↓
Token URI stored immutably on-chain
```

---

## 9. 3-Day Phased Implementation Plan

### Day 1 — Smart Contracts + Backend Foundation

**Goal:** Working smart contracts deployed to testnet + Express server + MongoDB connected

#### Morning (3–4 hrs): Smart Contracts

- [ ] Initialize Hardhat project inside `/blockchain` directory
- [ ] Install OpenZeppelin: `npm install @openzeppelin/contracts`
- [ ] Write `TicketNFT.sol` with mint, burn, verify, withdraw
- [ ] Write `TicketMarketplace.sol` with list, buy, delist
- [ ] Write Hardhat deploy scripts
- [ ] Write unit tests (`test/TicketNFT.test.js`)
- [ ] Deploy to Polygon Amoy testnet
- [ ] Copy ABI + contract address to frontend `src/contracts/`

#### Afternoon (3–4 hrs): Backend Setup

- [ ] Initialize Express app: `npm init`, install `express mongoose jsonwebtoken cors dotenv axios`
- [ ] Connect MongoDB (Atlas or local)
- [ ] Create `User`, `Event`, `Ticket` Mongoose models
- [ ] Setup Pinata SDK in `config/pinata.js`
- [ ] Implement auth routes: `/nonce`, `/verify` (sign-in with Ethereum pattern)
- [ ] Implement JWT middleware
- [ ] Implement event CRUD routes (`/api/events`)
- [ ] Implement IPFS upload routes (`/api/ipfs/upload-image`, `/api/ipfs/upload-metadata`)
- [ ] Test all endpoints with Postman/Thunder Client

---

### Day 2 — Frontend Blockchain Integration

**Goal:** MetaMask login working, minting flow end-to-end, QR ticket generation

#### Morning (3–4 hrs): Wallet + Contract Hooks

- [ ] Install: `npm install ethers qrcode.react html2canvas`
- [ ] Create `src/hooks/useWallet.js`
  - MetaMask connect / disconnect
  - Account state, chain ID check
  - Auto-switch to Polygon Amoy
- [ ] Create `src/hooks/useContract.js`
  - Load `TicketNFT.sol` ABI
  - Return read and write contract instances
- [ ] Wire `Login.jsx` to MetaMask: replace form login with wallet connect
- [ ] Add `WalletGuard.jsx` — redirect to login if no wallet
- [ ] Add network warning banner in `Navbar.jsx`

#### Afternoon (3–4 hrs): Minting + My Tickets

- [ ] Wire `Checkout.jsx`:
  - Call backend `/api/ipfs/upload-metadata` → get tokenURI
  - Call `mintTicket(tokenURI)` via Ethers.js with MATIC value
  - Show transaction pending spinner
  - On success, record ticket in backend (`/api/tickets/mint`)
  - Redirect to `MintSuccess.jsx`
- [ ] Build `MintSuccess.jsx` — show token ID, transaction hash, link to MyTickets
- [ ] Build `MyTickets.jsx`
  - Fetch tokens via `contract.tokensByOwner(walletAddress)`
  - For each token, fetch metadata from IPFS
  - Render ticket cards with QR codes (`<QRCode value={tokenId + ownerAddress} />`)
- [ ] Wire `DownloadTicket.jsx` — downloadable PNG of ticket with QR

---

### Day 3 — Resale Market + Gate Verification + Polish

**Goal:** Working resale marketplace, burn-on-entry scanner, full system tested

#### Morning (3–4 hrs): Resale Market + Organizer Dashboard

- [ ] Deploy `TicketMarketplace.sol` (if not done Day 1)
- [ ] Build `ResaleMarket.jsx`
  - Fetch all active listings from contract events
  - Show ticket cards with seller, price, buy button
  - Wire `buyTicket()` transaction
- [ ] Add resale listing button to `MyTickets.jsx`
  - Approve marketplace contract to transfer NFT
  - Call `listTicket(tokenId, price)` — enforce price cap UI-side
- [ ] Build `OrganizerDashboard.jsx`
  - Form to create event (calls backend + IPFS + sets contract params)
  - View sales stats: tokens minted, revenue, remaining supply

#### Afternoon (3–4 hrs): Gate Verification + Final Testing

- [ ] Build `TicketVerification.jsx` (organizer/gate-staff only)
  - QR code scanner (use `react-qr-reader` or camera API)
  - Parse tokenId + ownerAddress from QR
  - Call `contract.verifyTicket(tokenId)` — show ownership, used status
  - Call `contract.burnTicket(tokenId)` to mark entry
  - Show green/red access granted/denied UI
- [ ] Add transaction history to `Account.jsx` using backend records
- [ ] Full end-to-end test flow:
  - Register → Connect Wallet → Browse Event → Reserve → Mint → View Ticket → Scan QR → Burn
- [ ] Fix any regressions, loading states, error boundaries
- [ ] Update `.env` with production Polygon RPC and deploy contracts to mainnet

---

## 10. Folder Structure (Target)

```
ticketer-app/
├── blockchain/                     # Hardhat project
│   ├── contracts/
│   │   ├── TicketNFT.sol
│   │   └── TicketMarketplace.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── test/
│   │   └── TicketNFT.test.js
│   └── hardhat.config.js
│
├── backend/                        # Node.js + Express
│   ├── server.js
│   ├── config/
│   │   ├── db.js
│   │   └── pinata.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   └── Ticket.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── event.routes.js
│   │   ├── ticket.routes.js
│   │   ├── ipfs.routes.js
│   │   └── verify.routes.js
│   ├── controllers/
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── wallet.middleware.js
│   └── utils/
│       ├── qrcode.js
│       └── blockchain.js
│
└── src/                            # React Frontend
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Footer.jsx
    │   ├── WalletGuard.jsx         # NEW
    │   └── TransactionToast.jsx    # NEW
    ├── hooks/
    │   ├── useWallet.js            # NEW
    │   └── useContract.js          # NEW
    ├── contracts/
    │   ├── TicketNFT.json          # ABI
    │   └── addresses.js            # Deployed contract addresses
    ├── pages/
    │   ├── Home.jsx
    │   ├── Concerts.jsx
    │   ├── EventDetail.jsx         # NEW
    │   ├── Reservation.jsx
    │   ├── Checkout.jsx
    │   ├── MintSuccess.jsx         # NEW
    │   ├── MyTickets.jsx           # NEW
    │   ├── DownloadTicket.jsx
    │   ├── ResaleMarket.jsx        # NEW
    │   ├── TicketVerification.jsx  # NEW
    │   ├── OrganizerDashboard.jsx  # NEW
    │   ├── CreateEvent.jsx         # NEW
    │   ├── TransactionHistory.jsx  # NEW
    │   ├── Account.jsx
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   ├── Singers.jsx
    │   ├── SearchResults.jsx
    │   ├── Blogs.jsx
    │   ├── BlogDetail.jsx
    │   ├── FAQ.jsx
    │   ├── ContactUs.jsx
    │   └── NotFound.jsx
    └── App.jsx
```

---

## 11. Environment Variables

### Frontend (`src/.env`)

```env
VITE_POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
VITE_CHAIN_ID=80002
VITE_TICKET_NFT_ADDRESS=0x...
VITE_MARKETPLACE_ADDRESS=0x...
VITE_BACKEND_URL=http://localhost:5000
```

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret_here
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_GATEWAY=https://gateway.pinata.cloud
```

### Blockchain (`blockchain/.env`)

```env
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
DEPLOYER_PRIVATE_KEY=your_wallet_private_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

---

## 12. Getting Started

### Prerequisites

- Node.js >= 18
- MetaMask browser extension
- MongoDB Atlas account or local MongoDB
- Pinata account (free tier works)
- Polygon Amoy testnet MATIC from faucet: `faucet.polygon.technology`

### 1. Smart Contracts

```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network amoy
```

Copy deployed addresses into `src/contracts/addresses.js` and `backend/.env`.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your values
node server.js
```

Server runs at `http://localhost:5000`.

### 3. Frontend

```bash
cd ticketer-app
npm install
npm install ethers qrcode.react html2canvas react-qr-reader
cp .env.example .env   # fill in your values
npm run dev
```

App runs at `http://localhost:5173`.

---

## Key Security Considerations

- Never expose `DEPLOYER_PRIVATE_KEY` in frontend code
- Use `ethers.BrowserProvider(window.ethereum)` for user-signed transactions (never sign server-side with user keys)
- Verify `msg.sender` in all contract functions — never trust off-chain identity alone
- Store only CIDs in MongoDB; never store private data on IPFS
- JWT tokens must include wallet address claim; re-verify signature on sensitive actions
- Resale price cap must be enforced in the smart contract, not just the UI
- Burn is irreversible — add a confirmation dialog before calling `burnTicket()`

---

*Built with React, Node.js, Solidity, Polygon, and IPFS*
