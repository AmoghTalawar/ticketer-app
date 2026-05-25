# BlockTicket — End-to-End Testing Guide & Role-Based Access Control (RBAC)

This guide describes how to test all flows, functions, and scenarios for two different user profiles: **Event Organizer** and **Standard User (Buyer/Seller)**. It includes clear steps for setting up MetaMask from scratch and verifying role-based access control.

---

## 📋 Prerequisites & Setup

Before running the scenarios, ensure your environment is set up:

### 1. Smart Contract & Local Chain Setup
1. **Start Local Blockchain:**
   Open a terminal in `ticketer-app/blockchain` and run:
   ```bash
   npx hardhat node
   ```
   *Keep this terminal running. It starts a local blockchain at `http://127.0.0.1:8545` and prints 20 funded test accounts.*

2. **Deploy Contracts:**
   Open a second terminal in `ticketer-app/blockchain` and run:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
   *This deploys the global TicketMarketplace and EventFactory, deploys a default dynamic event contract, and auto-generates the contract addresses/ABIs for the frontend.*

### 2. Backend API Setup
Open a terminal in `ticketer-app/backend` and run:
   ```bash
   npm run dev
   ```
   *Starts the server at `http://localhost:5000` and establishes connections with MongoDB and Pinata IPFS.*

### 3. Frontend App Setup
Open a terminal in `ticketer-app` and run:
   ```bash
   npm run dev
   ```
   *Starts the Vite dev server at `http://localhost:5173/`.*

---

## 🦊 MetaMask Reset & Account Import (From Scratch)

Whenever you restart a local Hardhat blockchain, your local MetaMask transaction history and nonce counters will be out of sync. Follow these steps to reset MetaMask:

### Step A: Reset MetaMask Local Account Data
1. Open the MetaMask extension.
2. Click the three dots in the upper-right corner and select **Settings**.
3. Navigate to **Advanced**.
4. Scroll down and click **Clear activity tab data** (or **Reset Account** depending on version).
5. Click **Clear** to confirm. This resets the transaction counter (nonce) for the local RPC network.

### Step B: Configure the Hardhat Local Network
1. Click the network dropdown in MetaMask (top-left) and select **Add Network** -> **Add a network manually**.
2. Enter these settings:
   - **Network Name:** `Hardhat Local`
   - **New RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `1337`
   - **Currency Symbol:** `ETH`
3. Click **Save** and switch to `Hardhat Local`.

### Step C: Import Test Accounts
1. Click the account dropdown circle at the top of MetaMask and select **Add account or hardware wallet** -> **Import account**.
2. **Import Account #0 (Event Organizer):**
   - **Private Key:** `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - Rename this account in MetaMask to `Alice Organizer` (to keep track).
3. **Import Account #1 (Standard User / Bob Buyer):**
   - **Private Key:** `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
   - Rename this account to `Bob Buyer`.
4. **Import Account #2 (Secondary Buyer / Charlie Trader):**
   - **Private Key:** `0x5de4111e5913c58274621c1629574c10cf45f415248637819fe33018431fc334`
   - Rename this account to `Charlie Trader`.

---

## 👤 Scenario 1: Event Organizer Flow

This scenario tests registering as an organizer, verifying that access to buyer pages is blocked, deploying a new event contract dynamically, and managing the ticket sale.

### Step 1.1: Registration & Wallet Linkage
1. Open your browser to **[http://localhost:5173/register](http://localhost:5173/register)**.
2. Select **Alice Organizer (Account #0)** in MetaMask.
3. Click the orange **Link MetaMask Wallet** button. Confirm the popup connection in MetaMask. The button should turn green and show `Linked: 0xf39f...2266`.
4. Provide registration details:
   - **Full Name:** `Alice Organizer`
   - **Email:** `alice@organizer.com`
   - **Password:** `password123`
   - **Role Type:** Select **Event Organizer**
5. Click **Sign Up**. You will be redirected directly to the **Organizer Dashboard** (`/organizer-dashboard`).

### Step 1.2: Verify Role-Based Access Control (Redirection Check)
1. While logged in as `Alice Organizer`, try to manually enter `http://localhost:5173/account` in your address bar.
2. Press Enter. You should be **automatically redirected** back to `/organizer-dashboard` because organizers are restricted from buyer profile pages.
3. Open the user dropdown menu in the navbar (top-right next to wallet address). Verify that you **do not see** "My Tickets", "Account", or "Transaction History". You should only see:
   - `Organizer Dashboard`
   - `Create Event`
   - `Gate Scanner`
   - `Disconnect`

### Step 1.3: Dynamic Event Creation & Deployment
1. On the Organizer Dashboard, click **Create New Event** (takes you to `/create-event`).
2. Enter the event parameters:
   - **Event Title:** `Bruno Mars Live in Mumbai`
   - **Category:** `Concert`
   - **Description:** `Bruno Mars is coming to DY Patil Stadium for a historic night of funk and pop!`
   - **Date & Time:** Set a future date/time
   - **Venue:** `DY Patil Stadium`
   - **Total Supply:** `500`
   - **Ticket Price (ETH):** `0.02`
   - **Resale Cap (%):** `110` (keeps resales capped at 110% of 0.02, which is 0.022 ETH)
   - **Event Banner Image:** Select any image from your computer.
3. Click **Create Event & Deploy Smart Contract**.
4. The page will upload the image to IPFS, and prompt MetaMask to deploy the TicketNFT contract. **Confirm the transaction in MetaMask.**
5. Once the contract deploys, the page will automatically toggle the ticket sale active and save the event in MongoDB. You'll be redirected back to the dashboard showing your new event!

### Step 1.4: Multi-Contract Selection & Sale Controls
1. On the Organizer Dashboard, look at the **Select Event to Manage** dropdown at the top.
2. Select your newly created event `Bruno Mars Live in Mumbai`.
3. Notice that the stats cards automatically fetch information (Tickets Sold: `0 / 500`, Price: `0.02 ETH`, Contract Address: `0x...`) for that specific contract dynamically from the blockchain.
4. Click **Pause Sale**. Confirm the transaction in MetaMask.
5. The status will update on-chain and display **PAUSED** (buyers will not be able to mint tickets while paused). Click **Activate Sale** and confirm to re-enable minting.

---

## 👤 Scenario 2: Standard User (Buyer/Seller) Flow

This scenario tests registering as a standard user, purchasing a ticket, listing it on the secondary market, and trading within the price cap.

### Step 2.1: Register a Buyer Account
1. Click **Disconnect** in the navbar profile dropdown to log out.
2. Switch MetaMask to **Bob Buyer (Account #1)**.
3. Go to `/register` and click **Link MetaMask Wallet**.
4. Register a buyer account:
   - **Full Name:** `Bob Buyer`
   - **Email:** `bob@buyer.com`
   - **Password:** `password123`
   - **Role Type:** Select **Standard User (Buyer/Seller)**
5. Click **Sign Up**. You will be logged in and redirected to your **Account Hub** (`/account`).

### Step 2.2: Verify Buyer Access Control (Redirection Check)
1. While logged in as `Bob Buyer`, try to manually enter `http://localhost:5173/organizer-dashboard` or `http://localhost:5173/create-event` in the address bar.
2. Verify that you are **automatically redirected** back to `/account`.
3. Open the user dropdown menu in the navbar. Verify that you **do not see** "Organizer Dashboard", "Create Event", or "Gate Scanner". You should only see:
   - `My Tickets`
   - `Account`
   - `Transaction History`

### Step 2.3: Browse & Purchase (Mint) Ticket
1. Click **Concerts** in the navbar.
2. Click on the event created by the organizer (`Bruno Mars Live in Mumbai`).
3. Verify that the price and remaining supply are loaded dynamically.
4. Click **Select Seats & Book** (takes you to `/reservation`).
5. Select a seat on the map and click **Checkout**.
6. Check the terms box and click **Mint NFT Ticket**.
7. Confirm the transaction in MetaMask.
8. Upon transaction confirmation, you will be redirected to the **Mint Success** screen displaying the real Token ID, Transaction Hash, and Pinata IPFS metadata link.

### Step 2.4: Secondary Resale Market Listing (Price Cap Test)
1. Go to **My Tickets** via the navbar dropdown.
2. Click **List for Resale** on your ticket.
3. Enter a resale price:
   - **Price Cap Violation:** Enter `0.05` ETH (exceeds the 110% cap of `0.02` ETH). Click **Submit**. The contract will revert the transaction on-chain.
   - **Valid Price:** Enter `0.021` ETH (within the 110% cap). Click **Submit**.
4. MetaMask will ask you to approve the Marketplace contract to transfer your NFT. **Confirm the Approval transaction.**
5. Confirm the Listing transaction in MetaMask. The ticket is now listed for resale.

### Step 2.5: Resale Purchase (Secondary Trader)
1. Disconnect your session in the profile dropdown.
2. Switch MetaMask to **Charlie Trader (Account #2)**.
3. Go to `/login`. Click **Connect MetaMask Wallet** and sign the SIWE challenge to log in.
4. Click **Resale Market** in the navbar.
5. Locate the listed ticket for `Bruno Mars Live in Mumbai` and click **Buy Ticket**.
6. Confirm the purchase transaction in MetaMask.
7. Verify that the NFT has successfully transferred to Charlie, the listing is removed, and Bob (Account #1) has received the payment.

---

## 👤 Scenario 3: Gate Scanning & Verification Loop

This scenario tests the event organizer scanning and burning a ticket to grant entry.

### Step 3.1: Get the Ticket QR Code
1. While logged in as **Charlie Trader (Account #2)**, go to **My Tickets**.
2. Find the purchased ticket and click **Download Ticket**.
3. A ticket pass with a QR code will be visible. The QR code contains the string format: `BLOCKTICKET:<contractAddress>:<tokenId>:<ownerAddress>`.
4. Copy the QR code text or keep it visible on screen.

### Step 3.2: Verify & Burn Ticket
1. Log out of Charlie's account. Switch MetaMask to **Alice Organizer (Account #0)**.
2. Log in. Go to **Gate Scanner** (`/ticket-verification`) via the header button.
3. You can either use your webcam by clicking **Start Camera Scan** or paste the QR code string manually into the text input field.
4. Click **Verify**. The gate scanner fetches the contract address and token ID directly from the QR code and queries the blockchain.
5. A green **VALID TICKET** result will show.
6. Click **🔥 Grant Entry & Burn Ticket**.
7. Confirm the transaction in MetaMask. The ticket NFT is burned permanently, preventing reuse fraud.
8. Scan or submit the same QR code again. Verify it now displays **INVALID TICKET (already used)**.
