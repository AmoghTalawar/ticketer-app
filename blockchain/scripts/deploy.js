const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("\n🚀 BlockTicket Deployment");
  console.log("══════════════════════════════════════════");
  console.log(`📍 Network:   ${network.name}`);
  console.log(`👤 Deployer:  ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance:   ${ethers.formatEther(balance)} MATIC\n`);

  // ── 1. Deploy TicketMarketplace ───────────────────────────────────────────
  console.log("📄 Deploying TicketMarketplace...");

  const TicketMarketplace = await ethers.getContractFactory("TicketMarketplace");
  const marketplace = await TicketMarketplace.deploy(
    2 // 2% platform fee
  );

  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log(`✅ TicketMarketplace deployed: ${marketplaceAddress}`);

  // ── 2. Deploy EventFactory ────────────────────────────────────────────────
  console.log("\n📄 Deploying EventFactory...");

  const EventFactory = await ethers.getContractFactory("EventFactory");
  const eventFactory = await EventFactory.deploy(
    marketplaceAddress
  );

  await eventFactory.waitForDeployment();
  const factoryAddress = await eventFactory.getAddress();
  console.log(`✅ EventFactory deployed:     ${factoryAddress}`);

  // ── 3. Deploy Default Event via Factory ───────────────────────────────────
  console.log("\n⚙️  Deploying default TicketNFT event via factory...");
  const tx = await eventFactory.createEvent(
    "BlockTicket - Taylor Swift Concert", // name
    "TS-BTKT",                             // symbol
    1000,                                  // maxSupply
    ethers.parseEther("0.01"),             // ticketPrice (0.01 MATIC / ETH)
    110,                                   // resalePriceCap (110%)
    deployer.address                       // organizer
  );
  const receipt = await tx.wait();

  // Parse event to extract deployed TicketNFT address
  const iface = eventFactory.interface;
  let nftAddress;
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed && parsed.name === 'EventCreated') {
        nftAddress = parsed.args.eventAddress;
        break;
      }
    } catch (_) {}
  }

  if (!nftAddress) {
    throw new Error("Failed to deploy default TicketNFT event via factory");
  }
  console.log(`✅ Default TicketNFT deployed at: ${nftAddress}`);

  // Activate sale on default event
  const ticketNFT = await ethers.getContractAt("TicketNFT", nftAddress);
  await ticketNFT.toggleSale();
  console.log("✅ Sale is now ACTIVE on default event");

  // ── 4. Save deployment info ───────────────────────────────────────────────
  const deploymentInfo = {
    network: network.name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      TicketMarketplace: {
        address: marketplaceAddress,
        platformFeePercent: 2,
      },
      EventFactory: {
        address: factoryAddress,
      },
      DefaultTicketNFT: {
        address: nftAddress,
        name: "BlockTicket - Taylor Swift Concert",
        maxSupply: 1000,
        ticketPrice: "0.01",
        resalePriceCap: 110,
      }
    },
  };

  const deployDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deployDir)) fs.mkdirSync(deployDir, { recursive: true });

  const deployFile = path.join(deployDir, `${network.name}.json`);
  fs.writeFileSync(deployFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment saved: deployments/${network.name}.json`);

  // ── 5. Copy ABIs + addresses to frontend ──────────────────────────────────
  console.log("\n📋 Copying ABIs to frontend...");

  const frontendContractsDir = path.join(__dirname, "../../src/contracts");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  // Copy TicketNFT ABI
  const nftArtifact = require("../artifacts/contracts/TicketNFT.sol/TicketNFT.json");
  fs.writeFileSync(
    path.join(frontendContractsDir, "TicketNFT.json"),
    JSON.stringify({ abi: nftArtifact.abi, bytecode: nftArtifact.bytecode }, null, 2)
  );

  // Copy TicketMarketplace ABI
  const marketArtifact = require("../artifacts/contracts/TicketMarketplace.sol/TicketMarketplace.json");
  fs.writeFileSync(
    path.join(frontendContractsDir, "TicketMarketplace.json"),
    JSON.stringify({ abi: marketArtifact.abi }, null, 2)
  );

  // Copy EventFactory ABI
  const factoryArtifact = require("../artifacts/contracts/EventFactory.sol/EventFactory.json");
  fs.writeFileSync(
    path.join(frontendContractsDir, "EventFactory.json"),
    JSON.stringify({ abi: factoryArtifact.abi }, null, 2)
  );

  // Write addresses.js for frontend
  const addressesContent = `// Auto-generated by deploy.js — DO NOT EDIT MANUALLY
// Network: ${network.name} | Deployed: ${new Date().toISOString()}

export const CONTRACT_ADDRESSES = {
  TicketNFT: "${nftAddress}", // default/fallback
  TicketMarketplace: "${marketplaceAddress}",
  EventFactory: "${factoryAddress}",
};

export const CHAIN_ID = ${(await ethers.provider.getNetwork()).chainId};
`;
  fs.writeFileSync(
    path.join(frontendContractsDir, "addresses.js"),
    addressesContent
  );

  console.log("✅ ABIs and bytecode copied to ticketer-app/src/contracts/");
  console.log("✅ addresses.js written\n");

  console.log("══════════════════════════════════════════");
  console.log("🎉 Deployment Complete!");
  console.log("══════════════════════════════════════════");
  console.log(`  TicketMarketplace: ${marketplaceAddress}`);
  console.log(`  EventFactory:      ${factoryAddress}`);
  console.log(`  Default TicketNFT: ${nftAddress}`);
  console.log("══════════════════════════════════════════\n");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
