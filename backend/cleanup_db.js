require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const User = require('./models/User');
const Event = require('./models/Event');
const MONGODB_URI = process.env.MONGODB_URI;

async function clean() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear test accounts
    const delResult = await User.deleteMany({
      $or: [
        { email: /alice/i },
        { username: /alice/i },
        { email: /bob/i },
        { username: /bob/i }
      ]
    });
    console.log(`Deleted ${delResult.deletedCount} test accounts.`);

    // Clear all events
    const delEvents = await Event.deleteMany({});
    console.log(`Deleted ${delEvents.deletedCount} events from database.`);

    // If there is a wallet placeholder user, reset it
    const walletAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (user) {
      await User.updateOne({ _id: user._id }, {
        $unset: { username: "", email: "", password: "" },
        $set: { role: 'user', nonce: '123456' }
      });
      console.log(`Reset wallet user ${walletAddress} to clean placeholder state.`);
    } else {
      await User.create({ walletAddress: walletAddress.toLowerCase(), nonce: '123456' });
      console.log(`Created new clean placeholder wallet user for ${walletAddress}.`);
    }

    const users = await User.find({});
    console.log("Users in DB now:", users.map(u => ({
      id: u._id,
      username: u.username,
      email: u.email,
      walletAddress: u.walletAddress,
      role: u.role
    })));

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

clean();
