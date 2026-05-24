# BlockTicket — Implementation Progress

> Blockchain-based NFT concert ticket system on Polygon/Hardhat  
> Stack: React + Vite · Node.js + Express · Solidity · MongoDB · Pinata IPFS · Ethers.js v6 · MetaMask

---

## How It Works — Full Flow

```
User visits site
      │
      ▼
Connect MetaMask (Login page)
      │  wallet_requestAccounts → JWT session
      ▼
Browse Concerts → Select Event
      │
      ▼
Reservation page — pick seats from seat map
      │  selectedSeats[] passed via router state
      ▼
Checkout page
      │  1. Upload metadata JSON → Pinata → ipfs://CID
      │  2. Call mintTicket(tokenURI, { value: 0.01 ETH }) on TicketNFT contract
      │  3. MetaMask confirms → tx mined → TicketMinted event parsed → tokenId
      │  4. Record { tokenId, owner, txHash, seat, ipfsCID } → MongoDB
      ▼
MintSuccess page — shows tokenId, txHash, IPFS link
      │
      ▼
My Tickets page
      │  tokensByOwner(wallet) → on-chain token list
      │  tokenURI(id) → fetch IPFS metadata
      │  Render ticket cards with QR codes (BLOCKTICKET:tokenId:address)
      │  Download PNG via html2canvas
      │  List for resale → approve marketplace → listTicket(tokenId, price)
      ▼
Resale Market page
      │  getActiveListings() → marketplace contract
      │  buyTicket(tokenId, { value: price }) → NFT transferred, payment split
      ▼
Gate Verification (Organizer)
      │  Enter QR value → verifyTicket(tokenId) on-chain
      │  Check: owner match + not used
      │  Grant entry → burnTicket(tokenId) → NFT destroyed permanently
      ▼
Organizer Dashboard
      │  Live stats: totalSupply, maxSupply, ticketPrice, saleActive, balance
      │  Toggle sale on/off → toggleSale()
      │  Withdraw revenue → withdrawFunds()
```

---

## Commands to Run

### Prerequisites
- Node.js (v18–v22 recommended, v25 works with warnings)
- MetaMask browser extension
- MongoDB Atlas account (already configured)
- Pinata account (already configured)

---

### Terminal 1 — Hardhat Node (keep running)
```bash
cd E:\Blockchain\Blockchain\ticketer-app\blockchain
npx hardhat node
```
Starts local blockchain at `http://127.0.0.1:8545` with 20 funded accounts.

---

### Terminal 2 — Deploy Contracts (run after every node restart)
```bash
cd E:\Blockchain\Blockchain\ticketer-app\blockchain
npx hardhat run scripts/deploy.js --network localhost
```
Deploys TicketNFT + TicketMarketplace, activates sale, writes ABIs + addresses to `src/contracts/`.

---

### Terminal 3 — Backend API
```bash
cd E:\Blockchain\Blockchain\ticketer-app\backend
npm run dev
```
Starts Express server at `http://localhost:5000`  
On startup prints: `📌 Pinata: Connected ✅` if JWT is valid.

---

### Terminal 4 — Frontend
```bash
cd E:\Blockchain\Blockchain\ticketer-app
npm run dev
```
Starts Vite dev server at `http://localhost:5173`

---

### MetaMask Setup (one-time)
1. Add custom network:
   - Network name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency: `ETH`
2. Import test account (has 10,000 ETH):
   - Private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - This is Hardhat Account #0 (deployer)

---

### Useful Test Commands
```bash
# Run smart contract tests
cd blockchain
npx hardhat test

# Check Pinata connection
curl http://localhost:5000/api/ipfs/test

# Check backend health
curl http://localhost:5000/health

# Compile contracts
npx hardhat compile
```

---

## What Is Implemented ✅

### Day 1 — Smart Contracts + Backend Foundation

#### Smart Contracts (`blockchain/contracts/`)
- [x] **TicketNFT.sol** — ERC-721 with:
  - `mintTicket(tokenURI)` — payable, enforces price + supply cap
  - `burnTicket(tokenId)` — destroys NFT on gate entry (irreversible)
  - `verifyTicket(tokenId)` — returns owner, used status, metadata URI
  - `markUsed(tokenId)` — soft invalidation (keeps NFT)
  - `tokensByOwner(address)` — enumerate all tokens for a wallet
  - `toggleSale()` — organizer can pause/resume minting
  - `withdrawFunds()` — pull ETH to organizer wallet
  - `maxResalePrice(tokenId)` — enforces resale price cap
  - Inherits: ERC721Enumerable, ERC721URIStorage, Ownable, Pausable, ReentrancyGuard

- [x] **TicketMarketplace.sol** — Resale market with:
  - `listTicket(tokenId, price)` — enforces price cap on-chain
  - `buyTicket(tokenId)` — transfers NFT, splits payment (seller + platform fee)
  - `delistTicket(tokenId)` — seller removes listing
  - `updatePrice(tokenId, newPrice)` — still capped
  - `getActiveListings()` — returns all active token IDs
  - `getListing(tokenId)` — returns seller, price, active status
  - 2% platform fee, configurable

- [x] **Hardhat deploy script** — deploys both contracts, activates sale, copies ABIs + addresses to frontend automatically
- [x] **Deployed to localhost** — Chain ID 1337, deterministic addresses

#### Backend (`backend/`)
- [x] Express server with CORS, JSON middleware, error handling
- [x] MongoDB Atlas connected (blockticket database)
- [x] **Pinata IPFS** — JWT auth, `uploadMetadata()`, `uploadFile()`, `testConnection()`
- [x] **Models**: `User.js`, `Event.js`, `Ticket.js` (tokenId, owner, txHash, seat, ipfsCID, isUsed, isListed)
- [x] **Auth routes** (`/api/auth`) — nonce, verify signature, register, JWT middleware
- [x] **Event routes** (`/api/events`) — CRUD, availability
- [x] **Ticket routes** (`/api/tickets`):
  - `POST /mint` — record mint after on-chain confirmation
  - `GET /my?wallet=` — get tickets by wallet
  - `GET /resale` — all active listings
  - `POST /list-resale` — mark listed in DB
  - `POST /buy-resale` — transfer ownership in DB
  - `POST /mark-used` — gate scanner marks burned
  - `DELETE /delist/:tokenId`
- [x] **IPFS routes** (`/api/ipfs`):
  - `GET /test` — verify Pinata credentials
  - `POST /upload-image` — upload image file to Pinata
  - `POST /upload-metadata` — upload NFT metadata JSON to Pinata → returns `ipfs://CID`
  - `GET /metadata/:cid` — fetch metadata from IPFS gateway
- [x] **Verify routes** (`/api/verify`) — scan QR, check on-chain status
- [x] Wallet middleware, JWT middleware

---

### Day 2 — Frontend Blockchain Integration

#### Global State & Hooks
- [x] **`WalletContext.jsx`** — MetaMask connect/disconnect, auto-reconnect on page load, account/chainId/signer state, `accountsChanged` + `chainChanged` event listeners
- [x] **`useContract.js`** — Ethers.js v6 contract instances (nftRead, nftWrite, marketplaceRead, marketplaceWrite) using provider/signer
- [x] **`WalletGuard.jsx`** — redirects unauthenticated users to `/login` with return path
- [x] **`TransactionToast.jsx`** — animated pending/success/error toast with tx hash link, auto-dismiss

#### Pages Updated
- [x] **`App.jsx`** — wrapped with `WalletProvider`, protected routes via `WalletGuard`
- [x] **`Navbar.jsx`** — live wallet address display, network warning banner (orange), dropdown menu (My Tickets / Account / Organizer / Disconnect), `switchNetwork` button
- [x] **`Login.jsx`** — real `window.ethereum` connect, error display, MetaMask install prompt, redirects to intended page after login
- [x] **`Checkout.jsx`** — full mint flow:
  1. Network check via `eth_chainId`
  2. Contract existence pre-flight (`getCode`)
  3. Upload metadata to Pinata → `ipfs://CID`
  4. Call `mintTicket(tokenURI, { value: priceWei })`
  5. Parse `TicketMinted` event for tokenId
  6. Record in MongoDB
  7. Navigate to MintSuccess
- [x] **`MintSuccess.jsx`** — shows real tokenId, txHash, seat, IPFS CID with Pinata gateway link
- [x] **`MyTickets.jsx`** — fetches tokens via `tokensByOwner()`, decodes IPFS/data-URI metadata, renders QR codes (`QRCodeSVG`), resale listing flow (approve + listTicket)
- [x] **`DownloadTicket.jsx`** — real `QRCodeSVG` with `BLOCKTICKET:tokenId:address` value, `html2canvas` PNG download
- [x] **`Account.jsx`** — live ETH balance, NFT count from contract, network name, quick action grid, disconnect button

---

### Day 3 — Resale Market + Gate Verification + Organizer

- [x] **`ResaleMarket.jsx`** — reads `getActiveListings()` from marketplace contract, fetches IPFS metadata per token, buy flow with MetaMask, records in MongoDB
- [x] **`TicketVerification.jsx`** — gate scanner:
  - Parse QR: `BLOCKTICKET:tokenId:ownerAddress`
  - Call `verifyTicket(tokenId)` on-chain
  - Check ownership match + not used
  - Green/red result display
  - `burnTicket(tokenId)` with confirmation dialog → irreversible entry
  - Records burn in MongoDB
- [x] **`OrganizerDashboard.jsx`** — live contract stats (totalSupply, maxSupply, ticketPrice, saleActive, contract ETH balance), progress bar, toggle sale, withdraw revenue
- [x] **`TransactionHistory.jsx`** — pulls mint records from MongoDB by wallet address, shows tokenId, seat, status badge, tx hash

---

## What Is Remaining ❌

### High Priority (needed for production)

| Feature | File | Notes |
|---|---|---|
| **Auth — Sign-In with Ethereum** | `auth.controller.js` | Nonce + MetaMask signature → JWT. Currently routes exist but frontend skips auth |
| **Register page wired** | `Register.jsx` | Needs wallet address capture + backend `POST /api/auth/register` |
| **Event creation UI** | `CreateEvent.jsx` | Form to create event, upload image to Pinata, set contract params |
| **EventDetail page** | `EventDetail.jsx` | Full event info, remaining supply from contract, mint button |
| **Camera QR scanner** | `TicketVerification.jsx` | Replace manual input with `react-qr-reader` or `html5-qrcode` |
| **Multi-event support** | `EventFactory.sol` | One TicketNFT contract per event (currently single contract) |

### Medium Priority

| Feature | Notes |
|---|---|
| **Polygon Amoy testnet deploy** | Change `CHAIN_ID` to `80002`, fund wallet from faucet, run deploy script |
| **Real event images on IPFS** | Currently uses placeholder image URL in metadata |
| **Resale delist from UI** | MyTickets page needs "Remove Listing" button |
| **Search & filter** | Concerts page search, filter by date/venue/price |
| **Email notifications** | Nodemailer on mint/resale events |
| **Mobile responsive** | CSS media queries for mobile layout |

### Low Priority / Polish

| Feature | Notes |
|---|---|
| **Loading skeletons** | Replace spinners with skeleton cards |
| **Error boundaries** | React error boundary components |
| **Singers page** | Wire to real artist data |
| **Blog system** | Wire to real CMS or markdown files |
| **FAQ / Contact** | Wire contact form to backend |
| **Polygonscan verification** | `npx hardhat verify` on Amoy |
| **Code splitting** | Vite chunk size warning — split ethers.js into separate chunk |

---

## Architecture Overview

```
ticketer-app/
├── blockchain/                    # Hardhat project
│   ├── contracts/
│   │   ├── TicketNFT.sol          ✅ deployed
│   │   └── TicketMarketplace.sol  ✅ deployed
│   ├── scripts/deploy.js          ✅ auto-copies ABIs to frontend
│   ├── test/TicketNFT.test.js     ✅ unit tests
│   └── hardhat.config.js          chainId: 1337 (localhost)
│
├── backend/                       # Node.js + Express
│   ├── server.js                  ✅ running on :5000
│   ├── config/
│   │   ├── db.js                  ✅ MongoDB Atlas
│   │   └── pinata.js              ✅ JWT auth, upload functions
│   ├── models/
│   │   ├── User.js                ✅
│   │   ├── Event.js               ✅
│   │   └── Ticket.js              ✅ tokenId, owner, ipfsCID, isUsed, isListed
│   ├── routes/                    ✅ auth, events, tickets, ipfs, verify
│   └── controllers/               ✅ all implemented
│
└── src/                           # React + Vite frontend
    ├── context/WalletContext.jsx  ✅ MetaMask state
    ├── hooks/useContract.js       ✅ Ethers.js contract instances
    ├── components/
    │   ├── Navbar.jsx             ✅ wallet display + network warning
    │   ├── WalletGuard.jsx        ✅ route protection
    │   └── TransactionToast.jsx   ✅ tx status notifications
    ├── contracts/
    │   ├── TicketNFT.json         ✅ ABI (auto-generated)
    │   ├── TicketMarketplace.json ✅ ABI (auto-generated)
    │   └── addresses.js           ✅ deployed addresses + chainId
    └── pages/
        ├── Login.jsx              ✅ MetaMask connect
        ├── Checkout.jsx           ✅ Pinata + mintTicket()
        ├── MintSuccess.jsx        ✅ tokenId + IPFS link
        ├── MyTickets.jsx          ✅ on-chain NFTs + QR codes
        ├── DownloadTicket.jsx     ✅ QR + html2canvas download
        ├── Account.jsx            ✅ live wallet data
        ├── ResaleMarket.jsx       ✅ buy from marketplace
        ├── TicketVerification.jsx ✅ verify + burn on entry
        ├── OrganizerDashboard.jsx ✅ live stats + admin controls
        └── TransactionHistory.jsx ✅ MongoDB mint records
```

---

## Environment Variables

### `backend/.env`
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
PINATA_API_KEY=50662d2ad4fa17b1b1eb
PINATA_SECRET_KEY=8ce89dc735e1...
PINATA_JWT=eyJhbGci...
PINATA_GATEWAY=https://gateway.pinata.cloud
FRONTEND_URL=http://localhost:5173
```

### `blockchain/.env`
```
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
DEPLOYER_PRIVATE_KEY=<your_wallet_private_key>
POLYGONSCAN_API_KEY=<optional>
```

---

## Deployed Contract Addresses (Hardhat Local)

| Contract | Address |
|---|---|
| TicketNFT | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| TicketMarketplace | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` |
| Chain ID | `1337` |
| Ticket Price | `0.01 ETH` |
| Max Supply | `1000` |
| Resale Cap | `110%` |
| Platform Fee | `2%` |

> ⚠ These addresses reset every time `npx hardhat node` restarts.  
> Always run `npx hardhat run scripts/deploy.js --network localhost` after restarting the node.

---

## Git Commits Summary

```
0e60def  feat: OrganizerDashboard with live contract stats, toggle sale, withdraw
ca09b0b  feat: wire Pinata JWT, update Ticket model, simplify controllers
9620a33  feat: ResaleMarket, TicketVerification, MintSuccess with IPFS link, TransactionHistory
3b63ff5  fix: switchNetwork adds Hardhat Local not Polygon Amoy
2a6bf25  fix: change chainId from 31337 to 1337 to avoid MetaMask conflict
bc42754  fix: use eth_chainId from MetaMask directly for network check
a3d04b0  chore: sync addresses.js to fresh localhost deployment
a334bc4  fix: correct deploy.js frontend path (../../src/contracts)
6f3aeec  fix: pre-flight contract existence check, clear error if node restarted
49890ed  fix: replace btoa/atob with TextEncoder/TextDecoder for UTF-8 safe base64
11e0252  fix: use nftRead for ticketPrice, add network check, fallback to 0.01 ETH
641c48a  feat: Account shows real wallet balance, NFT count, network, quick actions
207a4a6  feat: DownloadTicket renders real QR code and downloads PNG via html2canvas
10f7c6a  feat: MyTickets fetches real NFTs from chain with QR codes and resale listing
8c1143e  feat: MintSuccess shows real tokenId, txHash, and explorer link
bc8adc7  feat: Checkout calls mintTicket() on-chain via Ethers.js with tx toast
3a3b7d5  feat: Login page wired to real MetaMask connect with error handling
bbe929d  feat: Navbar shows wallet address, network warning banner, dropdown menu
af40faf  feat: wrap App with WalletProvider and add WalletGuard to protected routes
6c568c8  feat: add WalletGuard and TransactionToast components
864fa2b  feat: add WalletContext and useContract hook
f6da405  Restructure: move backend/ and blockchain/ inside ticketer-app/
3b1961b  Day 1: Smart Contracts + Backend foundation
```

---

*Built with React, Node.js, Solidity, Hardhat, Polygon, Pinata IPFS, MongoDB*
