import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { apiLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import paymentRoutes from './routes/payment';
import qrRoutes from './routes/qr';
import adminRoutes from './routes/admin';
import volunteerRoutes from './routes/admin/volunteers';
import volunteerRequestRoutes from './routes/volunteer-requests';
import messageRoutes from './routes/admin/messages';
import newsRoutes from './routes/news';
import helpRequestRoutes from './routes/helpRequests';
import fundRoutes from './routes/fundRoutes';

// Connect to MongoDB with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log('MongoDB Atlas Connected Successfully');
    
    // Create indexes if they don't exist
    const db = mongoose.connection.db;
    if (db) {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ username: 1 }, { unique: true });
    }
    
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
    throw error;
  }
};

const app = express();

// Trust proxy - Add this line
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', config.corsOrigin].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/api/v1/help-requests', helpRequestRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/volunteer-requests', volunteerRequestRoutes);
app.use('/api/funds', fundRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin/volunteers', volunteerRoutes);
app.use('/api/admin/messages', messageRoutes);

// Apply rate limiting to other API routes
app.use('/api/', apiLimiter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle undefined routes
app.use((req: express.Request, res: express.Response) => {
  console.log('404 Not Found:', req.method, req.path);
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Start server only after database connection is established
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app; 