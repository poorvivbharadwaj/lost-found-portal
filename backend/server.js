const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

// Required for Render and Vercel proxies
app.set('trust proxy', 1);

// CORS
app.use(cors({
  origin: (process.env.FRONTEND_URL || 'http://localhost:3000').trim(),
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Reuse MongoDB connection between Vercel function calls
let mongoConnectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => {
        console.log('✅ MongoDB Atlas connected successfully');
      })
      .catch((error) => {
        mongoConnectionPromise = null;
        throw error;
      });
  }

  await mongoConnectionPromise;
};

// Connect before processing API requests
app.use('/api', async (req, res, next) => {
  // Allow health check without MongoDB
  if (req.path === '/health') {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);

    res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please try again.'
    });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lost', require('./routes/lostItems'));
app.use('/api/found', require('./routes/foundItems'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/search', require('./routes/search'));
app.use('/api/verification', require('./routes/verification'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Lost & Found Portal API running'
  });
});

// Start server locally or on Render
if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      const PORT = process.env.PORT || 5000;

      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error.message);
    });
}

// Vercel imports this Express application
module.exports = app;