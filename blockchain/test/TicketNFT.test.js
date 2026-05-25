const { expect } = require("chai");
const { ethers }  = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

// ──────────────────────────────────────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────────────────────────────────────

async function deployTicketNFTFixture() {
  const [owner, organizer, buyer1, buyer2, gate] = await ethers.getSigners();

  const TICKET_PRICE    = ethers.parseEther("0.01");
  const MAX_SUPPLY      = 100;
  const RESALE_CAP      = 110; // 110%
  const SAMPLE_URI      = "ipfs://QmSampleTokenURI123";

  const TicketNFT = await ethers.getContractFactory("TicketNFT");
  const nft = await TicketNFT.deploy(
    "BlockTicket Test",
    "BTK",
    MAX_SUPPLY,
    TICKET_PRICE,
    RESALE_CAP,
    organizer.address
  );

  return { nft, owner, organizer, buyer1, buyer2, gate, TICKET_PRICE, MAX_SUPPLY, RESALE_CAP, SAMPLE_URI };
}

async function deployBothFixture() {
  const base = await deployTicketNFTFixture();
  const { owner } = base;

  const TicketMarketplace = await ethers.getContractFactory("TicketMarketplace");
  const marketplace = await TicketMarketplace.deploy(2);

  return { ...base, marketplace };
}

// ──────────────────────────────────────────────────────────────────────────────
// TicketNFT Tests
// ──────────────────────────────────────────────────────────────────────────────

describe("TicketNFT", function () {

  describe("Deployment", function () {
    it("should set correct name and symbol", async function () {
      const { nft } = await loadFixture(deployTicketNFTFixture);
      expect(await nft.name()).to.equal("BlockTicket Test");
      expect(await nft.symbol()).to.equal("BTK");
    });

    it("should set correct max supply and ticket price", async function () {
      const { nft, TICKET_PRICE, MAX_SUPPLY } = await loadFixture(deployTicketNFTFixture);
      expect(await nft.maxSupply()).to.equal(MAX_SUPPLY);
      expect(await nft.ticketPrice()).to.equal(TICKET_PRICE);
    });

    it("should start with sale inactive", async function () {
      const { nft } = await loadFixture(deployTicketNFTFixture);
      expect(await nft.saleActive()).to.equal(false);
    });

    it("should set organizer correctly", async function () {
      const { nft, organizer } = await loadFixture(deployTicketNFTFixture);
      expect(await nft.organizer()).to.equal(organizer.address);
    });
  });

  describe("Sale Toggle", function () {
    it("organizer can toggle sale on", async function () {
      const { nft, organizer } = await loadFixture(deployTicketNFTFixture);
      await nft.connect(organizer).toggleSale();
      expect(await nft.saleActive()).to.equal(true);
    });

    it("non-organizer cannot toggle sale", async function () {
      const { nft, buyer1 } = await loadFixture(deployTicketNFTFixture);
      await expect(nft.connect(buyer1).toggleSale()).to.be.revertedWith("Not authorized");
    });

    it("should emit SaleToggled event", async function () {
      const { nft, organizer } = await loadFixture(deployTicketNFTFixture);
      await expect(nft.connect(organizer).toggleSale())
        .to.emit(nft, "SaleToggled")
        .withArgs(true);
    });
  });

  describe("Minting", function () {
    async function readyToMint() {
      const fixture = await loadFixture(deployTicketNFTFixture);
      await fixture.nft.connect(fixture.organizer).toggleSale();
      return fixture;
    }

    it("should mint a ticket with exact payment", async function () {
      const { nft, buyer1, TICKET_PRICE, SAMPLE_URI } = await readyToMint();
      await nft.connect(buyer1).mintTicket(SAMPLE_URI, { value: TICKET_PRICE });
      expect(await nft.ownerOf(0)).to.equal(buyer1.address);
      expect(await nft.totalSupply()).to.equal(1);
    });

    it("should set the correct token URI", async function () {
      const { nft, buyer1, TICKET_PRICE, SAMPLE_URI } = await readyToMint();
      await nft.connect(buyer1).mintTicket(SAMPLE_URI, { value: TICKET_PRICE });
      expect(await nft.tokenURI(0)).to.equal(SAMPLE_URI);
    });

    it("should emit TicketMinted event", async function () {
      const { nft, buyer1, TICKET_PRICE, SAMPLE_URI } = await readyToMint();
      await expect(
        nft.connect(buyer1).mintTicket(SAMPLE_URI, { value: TICKET_PRICE })
      )
        .to.emit(nft, "TicketMinted")
        .withArgs(buyer1.address, 0, SAMPLE_URI, TICKET_PRICE);
    });

    it("should store mint price per token", async function () {
      const { nft, buyer1, TICKET_PRICE, SAMPLE_URI } = await readyToMint();
      await nft.connect(buyer1).mintTicket(SAMPLE_URI, { value: TICKET_PRICE });
      expect(await nft.mintPrice(0)).to.equal(TICKET_PRICE);
    });

    it("should refund excess MATIC", async function () {
      const { nft, buyer1, TICKET_PRICE, SAMPLE_URI } = await readyToMint();
      const excess     = ethers.parseEther("0.05");
      const overpay    = TICKET_PRICE + excess;
      const before     = await ethers.provider.getBalance(buyer1.address);
      const tx         = await nft.connect(buyer1).mintTicket(SAMPLE_URI, { value: overpay });
      const receipt    = await tx.wait();
      const gasCost    = receipt.gasUsed * tx.gasPrice;
      const after      = await ethers.provider.getBalance(buyer1.address);
      expect(before - after).to.be.closeTo(TICKET_PRICE + gasCost, ethers.parseEther("0.001"));
    });

    it("should revert if sale not active", async function () {
      const { nft, buyer1, TICKET_PRICE, SAMPLE_URI } = await loadFixture(deployTicketNFTFixture);
      await expect(
        nft.connect(buyer1).mintTicket(SAMPLE_URI, { value: TICKET_PRICE })
      ).to.be.revertedWith("Sale is not active");
    });

    it("should revert if insufficient MATIC", async function () {
      const { nft, buyer1, TICKET_PRICE, SAMPLE_URI } = await readyToMint();
      await expect(
        nft.connect(buyer1).mintTicket(SAMPLE_URI, { value: TICKET_PRICE - 1n })
      ).to.be.revertedWith("Insufficient MATIC sent");
    });

    it("should revert after max supply reached", async function () {
      const [owner, organizer, ...buyers] = await ethers.getSigners();
      const TicketNFT = await ethers.getContractFactory("TicketNFT");
      const nft = await TicketNFT.deploy(
        "Small Event", "SE", 2, ethers.parseEther("0.01"), 110, organizer.address
      );
      await nft.connect(organizer).toggleSale();
      const price = ethers.parseEther("0.01");
      await nft.connect(buyers[0]).mintTicket("ipfs://1", { value: price });
      await nft.connect(buyers[1]).mintTicket("ipfs://2", { value: price });
      await expect(
        nft.connect(buyers[2]).mintTicket("ipfs://3", { value: price })
      ).to.be.revertedWith("All tickets sold out");
    });
  });

  describe("Burn Ticket", function () {
    async function mintedTicket() {
      const fixture = await loadFixture(deployTicketNFTFixture);
      await fixture.nft.connect(fixture.organizer).toggleSale();
      await fixture.nft.connect(fixture.buyer1).mintTicket(fixture.SAMPLE_URI, { value: fixture.TICKET_PRICE });
      return fixture;
    }

    it("owner can burn their ticket", async function () {
      const { nft, buyer1 } = await mintedTicket();
      await nft.connect(buyer1).burnTicket(0);
      await expect(nft.ownerOf(0)).to.be.revertedWithCustomError(nft, "ERC721NonexistentToken");
    });

    it("organizer can burn a ticket", async function () {
      const { nft, organizer } = await mintedTicket();
      await nft.connect(organizer).burnTicket(0);
      await expect(nft.ownerOf(0)).to.be.revertedWithCustomError(nft, "ERC721NonexistentToken");
    });

    it("should emit TicketBurned event", async function () {
      const { nft, buyer1 } = await mintedTicket();
      await expect(nft.connect(buyer1).burnTicket(0))
        .to.emit(nft, "TicketBurned")
        .withArgs(0, buyer1.address);
    });

    it("cannot burn an already-used ticket", async function () {
      const { nft, buyer1, organizer } = await mintedTicket();
      await nft.connect(buyer1).burnTicket(0);
      await expect(nft.connect(organizer).markUsed(0)).to.be.reverted;
    });

    it("non-owner/non-organizer cannot burn", async function () {
      const { nft, buyer2 } = await mintedTicket();
      await expect(nft.connect(buyer2).burnTicket(0)).to.be.revertedWith("Not authorized to burn");
    });
  });

  describe("Verify Ticket", function () {
    it("should return correct owner and used status", async function () {
      const { nft, buyer1, organizer, TICKET_PRICE, SAMPLE_URI } = await loadFixture(deployTicketNFTFixture);
      await nft.connect(organizer).toggleSale();
      await nft.connect(buyer1).mintTicket(SAMPLE_URI, { value: TICKET_PRICE });

      const [tokenOwner, isUsed, uri] = await nft.verifyTicket(0);
      expect(tokenOwner).to.equal(buyer1.address);
      expect(isUsed).to.equal(false);
      expect(uri).to.equal(SAMPLE_URI);
    });
  });

  describe("tokensByOwner", function () {
    it("should return all token IDs for an address", async function () {
      const { nft, buyer1, organizer, TICKET_PRICE } = await loadFixture(deployTicketNFTFixture);
      await nft.connect(organizer).toggleSale();
      await nft.connect(buyer1).mintTicket("ipfs://1", { value: TICKET_PRICE });
      await nft.connect(buyer1).mintTicket("ipfs://2", { value: TICKET_PRICE });

      const tokens = await nft.tokensByOwner(buyer1.address);
      expect(tokens.length).to.equal(2);
      expect(tokens[0]).to.equal(0n);
      expect(tokens[1]).to.equal(1n);
    });
  });

  describe("Mark Used", function () {
    it("organizer can mark ticket as used", async function () {
      const { nft, buyer1, organizer, TICKET_PRICE, SAMPLE_URI } = await loadFixture(deployTicketNFTFixture);
      await nft.connect(organizer).toggleSale();
      await nft.connect(buyer1).mintTicket(SAMPLE_URI, { value: TICKET_PRICE });
      await nft.connect(organizer).markUsed(0);
      expect(await nft.ticketUsed(0)).to.equal(true);
    });

    it("buyer cannot mark used", async function () {
      const { nft, buyer1, organizer, TICKET_PRICE, SAMPLE_URI } = await loadFixture(deployTicketNFTFixture);
      await nft.connect(organizer).toggleSale();
      await nft.connect(buyer1).mintTicket(SAMPLE_URI, { value: TICKET_PRICE });
      await expect(nft.connect(buyer1).markUsed(0)).to.be.revertedWith("Not authorized");
    });
  });

  describe("Withdraw Funds", function () {
    it("organizer can withdraw contract balance", async function () {
      const { nft, buyer1, organizer, TICKET_PRICE, SAMPLE_URI } = await loadFixture(deployTicketNFTFixture);
      await nft.connect(organizer).toggleSale();
      await nft.connect(buyer1).mintTicket(SAMPLE_URI, { value: TICKET_PRICE });

      const before = await ethers.provider.getBalance(organizer.address);
      const tx = await nft.connect(organizer).withdrawFunds();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * tx.gasPrice;
      const after = await ethers.provider.getBalance(organizer.address);

      expect(after).to.be.closeTo(before + TICKET_PRICE - gasCost, ethers.parseEther("0.001"));
    });

    it("non-organizer cannot withdraw", async function () {
      const { nft, buyer1 } = await loadFixture(deployTicketNFTFixture);
      await expect(nft.connect(buyer1).withdrawFunds()).to.be.revertedWith("Not authorized");
    });
  });

  describe("maxResalePrice", function () {
    it("returns 110% of mint price", async function () {
      const { nft, buyer1, organizer, TICKET_PRICE, SAMPLE_URI } = await loadFixture(deployTicketNFTFixture);
      await nft.connect(organizer).toggleSale();
      await nft.connect(buyer1).mintTicket(SAMPLE_URI, { value: TICKET_PRICE });
      const cap = await nft.maxResalePrice(0);
      expect(cap).to.equal((TICKET_PRICE * 110n) / 100n);
    });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// TicketMarketplace Tests
// ──────────────────────────────────────────────────────────────────────────────

describe("TicketMarketplace", function () {

  async function listedTicketFixture() {
    const { nft, marketplace, owner, organizer, buyer1, buyer2, TICKET_PRICE, SAMPLE_URI } =
      await loadFixture(deployBothFixture);

    await nft.connect(organizer).toggleSale();
    await nft.connect(buyer1).mintTicket(SAMPLE_URI, { value: TICKET_PRICE });

    const marketplaceAddress = await marketplace.getAddress();
    await nft.connect(buyer1).approve(marketplaceAddress, 0);

    const listPrice = (TICKET_PRICE * 105n) / 100n; // 105% — under cap
    await marketplace.connect(buyer1).listTicket(await nft.getAddress(), 0, listPrice);

    return { nft, marketplace, owner, organizer, buyer1, buyer2, TICKET_PRICE, SAMPLE_URI, listPrice };
  }

  describe("Deployment", function () {
    it("sets platform fee", async function () {
      const { marketplace } = await loadFixture(deployBothFixture);
      expect(await marketplace.platformFeePercent()).to.equal(2);
    });
  });

  describe("Listing", function () {
    it("should list a ticket successfully", async function () {
      const { nft, marketplace } = await listedTicketFixture();
      const listing = await marketplace.getListing(await nft.getAddress(), 0);
      expect(listing.active).to.equal(true);
    });

    it("should emit TicketListed event", async function () {
      const { nft, marketplace, organizer, buyer1, TICKET_PRICE, SAMPLE_URI } =
        await loadFixture(deployBothFixture);

      await nft.connect(organizer).toggleSale();
      await nft.connect(buyer1).mintTicket(SAMPLE_URI, { value: TICKET_PRICE });
      await nft.connect(buyer1).approve(await marketplace.getAddress(), 0);

      const listPrice = (TICKET_PRICE * 105n) / 100n;
      await expect(marketplace.connect(buyer1).listTicket(await nft.getAddress(), 0, listPrice))
        .to.emit(marketplace, "TicketListed")
        .withArgs(await nft.getAddress(), 0, buyer1.address, listPrice);
    });

    it("should revert if price exceeds cap", async function () {
      const { nft, marketplace, organizer, buyer1, TICKET_PRICE, SAMPLE_URI } =
        await loadFixture(deployBothFixture);

      await nft.connect(organizer).toggleSale();
      await nft.connect(buyer1).mintTicket(SAMPLE_URI, { value: TICKET_PRICE });
      await nft.connect(buyer1).approve(await marketplace.getAddress(), 0);

      const overPrice = (TICKET_PRICE * 120n) / 100n; // 120% — over cap
      await expect(
        marketplace.connect(buyer1).listTicket(await nft.getAddress(), 0, overPrice)
      ).to.be.revertedWith("Price exceeds resale cap");
    });

    it("non-owner cannot list", async function () {
      const { nft, marketplace, organizer, buyer1, buyer2, TICKET_PRICE, SAMPLE_URI } =
        await loadFixture(deployBothFixture);

      await nft.connect(organizer).toggleSale();
      await nft.connect(buyer1).mintTicket(SAMPLE_URI, { value: TICKET_PRICE });
      await nft.connect(buyer1).approve(await marketplace.getAddress(), 0);

      await expect(
        marketplace.connect(buyer2).listTicket(await nft.getAddress(), 0, TICKET_PRICE)
      ).to.be.revertedWith("You don't own this ticket");
    });
  });

  describe("Buying", function () {
    it("should transfer NFT to buyer on purchase", async function () {
      const { nft, marketplace, buyer2, listPrice } = await listedTicketFixture();
      await marketplace.connect(buyer2).buyTicket(await nft.getAddress(), 0, { value: listPrice });
      expect(await nft.ownerOf(0)).to.equal(buyer2.address);
    });

    it("should pay seller (minus platform fee)", async function () {
      const { nft, marketplace, buyer1, buyer2, listPrice } = await listedTicketFixture();
      const before = await ethers.provider.getBalance(buyer1.address);
      await marketplace.connect(buyer2).buyTicket(await nft.getAddress(), 0, { value: listPrice });
      const after = await ethers.provider.getBalance(buyer1.address);
      const fee = (listPrice * 2n) / 100n;
      expect(after - before).to.equal(listPrice - fee);
    });

    it("should emit TicketSold event", async function () {
      const { nft, marketplace, buyer1, buyer2, listPrice } = await listedTicketFixture();
      await expect(marketplace.connect(buyer2).buyTicket(await nft.getAddress(), 0, { value: listPrice }))
        .to.emit(marketplace, "TicketSold")
        .withArgs(await nft.getAddress(), 0, buyer2.address, buyer1.address, listPrice);
    });

    it("should remove listing after sale", async function () {
      const { nft, marketplace, buyer2, listPrice } = await listedTicketFixture();
      await marketplace.connect(buyer2).buyTicket(await nft.getAddress(), 0, { value: listPrice });
      const listing = await marketplace.getListing(await nft.getAddress(), 0);
      expect(listing.active).to.equal(false);
    });

    it("seller cannot buy own listing", async function () {
      const { nft, marketplace, buyer1, listPrice } = await listedTicketFixture();
      await expect(
        marketplace.connect(buyer1).buyTicket(await nft.getAddress(), 0, { value: listPrice })
      ).to.be.revertedWith("Cannot buy your own ticket");
    });

    it("should revert if insufficient MATIC", async function () {
      const { nft, marketplace, buyer2, listPrice } = await listedTicketFixture();
      await expect(
        marketplace.connect(buyer2).buyTicket(await nft.getAddress(), 0, { value: listPrice - 1n })
      ).to.be.revertedWith("Insufficient MATIC sent");
    });
  });

  describe("Delisting", function () {
    it("seller can delist", async function () {
      const { nft, marketplace, buyer1 } = await listedTicketFixture();
      await marketplace.connect(buyer1).delistTicket(await nft.getAddress(), 0);
      const listing = await marketplace.getListing(await nft.getAddress(), 0);
      expect(listing.active).to.equal(false);
    });

    it("should emit TicketDelisted event", async function () {
      const { nft, marketplace, buyer1 } = await listedTicketFixture();
      await expect(marketplace.connect(buyer1).delistTicket(await nft.getAddress(), 0))
        .to.emit(marketplace, "TicketDelisted")
        .withArgs(await nft.getAddress(), 0, buyer1.address);
    });

    it("non-seller cannot delist", async function () {
      const { nft, marketplace, buyer2 } = await listedTicketFixture();
      await expect(marketplace.connect(buyer2).delistTicket(await nft.getAddress(), 0)).to.be.revertedWith("Not authorized");
    });
  });

  describe("Update Price", function () {
    it("seller can update price within cap", async function () {
      const { nft, marketplace, buyer1, TICKET_PRICE } = await listedTicketFixture();
      const newPrice = (TICKET_PRICE * 108n) / 100n;
      await marketplace.connect(buyer1).updatePrice(await nft.getAddress(), 0, newPrice);
      const listing = await marketplace.getListing(await nft.getAddress(), 0);
      expect(listing.price).to.equal(newPrice);
    });

    it("cannot set price above cap", async function () {
      const { nft, marketplace, buyer1, TICKET_PRICE } = await listedTicketFixture();
      const overPrice = (TICKET_PRICE * 115n) / 100n;
      await expect(
        marketplace.connect(buyer1).updatePrice(await nft.getAddress(), 0, overPrice)
      ).to.be.revertedWith("Price exceeds resale cap");
    });
  });

  describe("Active Listings", function () {
    it("getActiveListings returns listed token IDs", async function () {
      const { nft, marketplace } = await listedTicketFixture();
      const active = await marketplace.getActiveListings(await nft.getAddress());
      expect(active.length).to.equal(1);
      expect(active[0]).to.equal(0n);
    });

    it("removes token from active listings after sale", async function () {
      const { nft, marketplace, buyer2, listPrice } = await listedTicketFixture();
      await marketplace.connect(buyer2).buyTicket(await nft.getAddress(), 0, { value: listPrice });
      const active = await marketplace.getActiveListings(await nft.getAddress());
      expect(active.length).to.equal(0);
    });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// EventFactory Tests
// ──────────────────────────────────────────────────────────────────────────────

describe("EventFactory", function () {
  async function deployFactoryFixture() {
    const [owner, organizer, buyer] = await ethers.getSigners();
    const TicketMarketplace = await ethers.getContractFactory("TicketMarketplace");
    const marketplace = await TicketMarketplace.deploy(2);
    
    const EventFactory = await ethers.getContractFactory("EventFactory");
    const factory = await EventFactory.deploy(await marketplace.getAddress());
    
    return { factory, marketplace, owner, organizer, buyer };
  }

  it("should deploy and set marketplace", async function () {
    const { factory, marketplace } = await loadFixture(deployFactoryFixture);
    expect(await factory.marketplace()).to.equal(await marketplace.getAddress());
  });

  it("should deploy a new TicketNFT contract via createEvent", async function () {
    const { factory, organizer } = await loadFixture(deployFactoryFixture);
    const tx = await factory.createEvent(
      "Factory Event",
      "FE",
      1000,
      ethers.parseEther("0.01"),
      110,
      organizer.address
    );
    const receipt = await tx.wait();
    
    const events = await factory.getDeployedEvents();
    expect(events.length).to.equal(1);
    
    const eventAddress = events[0];
    const TicketNFT = await ethers.getContractFactory("TicketNFT");
    const nft = TicketNFT.attach(eventAddress);
    
    expect(await nft.name()).to.equal("Factory Event");
    expect(await nft.owner()).to.equal(organizer.address); // ownership transferred to organizer
  });
});
