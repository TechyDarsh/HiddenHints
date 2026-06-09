/**
 * Quick script to create / reset admin users
 * Run: node create-admin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const createAdmins = async () => {
  try {
    await connectDB();
    console.log('\n👥 Creating admin users...\n');

    const admins = [
      { username: 'admin', email: 'admin@spis.com', password: 'admin123', role: 'admin' },
      { username: 'darsh', email: 'darsh@spis.com', password: 'darsh',    role: 'admin' },
    ];

    for (const adminData of admins) {
      // Delete existing user with same username or email, then re-create fresh
      await User.deleteOne({ $or: [{ username: adminData.username }, { email: adminData.email }] });
      const user = await User.create(adminData);
      console.log(`✅ Admin created: ${user.username}`);
      console.log(`   Email   : ${adminData.email}`);
      console.log(`   Password: ${adminData.password}`);
      console.log(`   Role    : ${user.role}\n`);
    }

    console.log('🎉 Done! You can now log in with the credentials above.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmins();
