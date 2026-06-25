import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/luxury-cafe');
    
    const adminEmail = 'admin@aura.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log('Admin user already exists. Updating password...');
      adminExists.password = 'Admin@123';
      adminExists.role = 'admin';
      adminExists.name = 'Luxury Admin';
      await adminExists.save();
      console.log('Admin user updated successfully.');
    } else {
      await User.create({
        name: 'Luxury Admin',
        email: adminEmail,
        password: 'Admin@123',
        role: 'admin'
      });
      console.log('Admin user created successfully.');
    }
    
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
