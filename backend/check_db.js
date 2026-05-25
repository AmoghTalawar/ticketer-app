require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const User = require('./models/User');
const MONGODB_URI = process.env.MONGODB_URI;

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully!");

    const users = await User.find({});
    console.log(`Total users in DB: ${users.length}`);
    for (let u of users) {
      console.log({
        id: u._id,
        username: u.username,
        email: u.email,
        walletAddress: u.walletAddress,
        role: u.role
      });
    }

    const walletToCheck = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
    const found = await User.find({ walletAddress: walletToCheck });
    console.log(`\nFound by exact walletAddress lowercase: ${found.length}`);
    for (let u of found) {
      console.log(u);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
