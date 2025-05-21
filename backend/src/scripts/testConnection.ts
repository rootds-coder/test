import mongoose from 'mongoose';
import { config } from '../config';
import express from 'express';
import fundRoutes from '../routes/fundRoutes';

const testConnection = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB successfully');

    // Create a simple Express app to test routes
    const app = express();
    app.use('/api/funds', fundRoutes);

    // Test the /donate endpoint
    const server = app.listen(5001, () => {
      console.log('Test server running on port 5001');
      console.log('Available routes:');
      console.log('- POST /api/funds/donate');
      console.log('- GET /api/funds');
      console.log('- POST /api/funds');
      console.log('- GET /api/funds/:id');
      console.log('- PUT /api/funds/:id');
      console.log('- DELETE /api/funds/:id');
    });

    // Close the server after 5 seconds
    setTimeout(() => {
      server.close();
      mongoose.disconnect();
      console.log('Test server closed');
      console.log('Disconnected from MongoDB');
    }, 5000);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Run the test
testConnection(); 