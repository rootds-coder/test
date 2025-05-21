import mongoose from 'mongoose';
import Admin from '../models/Admin';
import { config } from '../config';

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB Atlas');

    // Create admin user
    const adminData = {
      username: 'admin',
      password: 'admin123', // This will be hashed automatically by the model
      email: 'admin@example.com',
      role: 'super-admin'
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: adminData.username });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create new admin
    const admin = new Admin(adminData);
    await admin.save();
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin(); 