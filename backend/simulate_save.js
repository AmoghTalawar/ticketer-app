require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const User = require('./models/User');
const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const walletAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
    const existingWallet = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (!existingWallet) {
      console.log("No existing wallet found!");
      return;
    }

    console.log("Found existing wallet document before save:", existingWallet);

    // Mimic the fields that the user entered in the form
    existingWallet.username = "Alice Organizer Test";
    existingWallet.email = "alice_test_" + Date.now() + "@organizer.com";
    existingWallet.password = "password123";
    existingWallet.role = "organizer";

    console.log("Attempting to save...");
    await existingWallet.save();
    console.log("Save successful!");
    
    // Clean up
    console.log("Saved document:", existingWallet);
  } catch (err) {
    console.error("Error occurred during save:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
