/**
 * seed.js — Run once to set up initial data
 * Usage: node seed.js
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/luxury-cafe';

async function seed() {
  try {
    console.log('\n🌱 Starting seed script...');
    console.log(`   Connecting to: ${MONGODB_URI.replace(/:([^@]+)@/, ':***@')}`);

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ Connected to MongoDB\n');

    const { default: User } = await import('./models/User.js');

    // ── Admin user ───────────────────────────────────────────────────────────
    const existingAdmin = await User.findOne({ email: 'admin@aura.com' });
    if (existingAdmin) {
      // Use mongoose model update so pre-save hook doesn't double-hash
      existingAdmin.password = 'admin123';  // plain text — pre-save hook will hash it
      await existingAdmin.save();
      console.log('🔑 Admin password reset: admin@aura.com / admin123');
    } else {
      await User.create({
        name:     'Aura Admin',
        email:    'admin@aura.com',
        password: 'admin123',   // plain text — pre-save hook will hash it
        role:     'admin',
      });
      console.log('👤 Admin created:        admin@aura.com / admin123');
    }

    // ── Staff user ───────────────────────────────────────────────────────────
    const existingStaff = await User.findOne({ email: 'staff@aura.com' });
    if (!existingStaff) {
      await User.create({
        name:     'Aura Staff',
        email:    'staff@aura.com',
        password: 'staff123',   // plain text — pre-save hook will hash it
        role:     'staff',
      });
      console.log('👤 Staff created:        staff@aura.com / staff123');
    }

    console.log('\n✅ Seed complete!\n');
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
