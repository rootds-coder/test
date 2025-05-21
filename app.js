const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const config = require('./config');

// Import routes
const newsRoutes = require('./routes/newsRoutes');

const app = express();

// Connect to MongoDB
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  next();
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://fund-taupe.vercel.app'
      'http://localhost:3000'
    ];
    console.log('Request origin:', origin);
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Add headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://fund-taupe.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use('/api/', apiLimiter); // Apply to all API routes

// Routes
app.use('/api/news', newsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Only start the server if we're not in a test environment
if (config.env !== 'test') {
  app.listen(config.port, () => {
    console.log(`Server is running in ${config.env} mode on port ${config.port}`);
    console.log('CORS enabled for origins:', corsOptions.origin);
  });
}

module.exports = app; 
