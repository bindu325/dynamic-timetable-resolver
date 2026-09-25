const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const seedDatabase = require('./seed');

// 1. Load environment variables before accessing process.env
dotenv.config();

const app = express();

// Security middleware with cross-origin resource policy allowed
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'https://dynamic-timetable-resolver.vercel.app',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((u) => u.trim()) : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile, Postman, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Authorization'],
  })
);

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP logging in dev
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Root welcoming / status page for browser visits
app.get('/', (req, res) => {
  res.json({
    name: 'Dynamic Timetable Conflict Resolver API',
    status: 'ONLINE',
    version: '1.0.0',
    documentation: {
      health: '/api/health',
      auth: '/api/auth/login',
      dashboard: '/api/dashboard/stats',
    },
    message: 'Backend API is running. Access the frontend interface to interact with the system.',
    timestamp: new Date().toISOString(),
  });
});

// Dynamic Health Check endpoint (Public)
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const isConnected = dbState === 1;
  const stateLabels = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(isConnected ? 200 : 503).json({
    success: isConnected,
    server: 'running',
    database: stateLabels[dbState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

// Endpoint for manual database reset/reseed (Public utility for demo setup)
app.post('/api/seed', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database seeded with demo data successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Seeding failed', error: err.message });
  }
});

// API Sub-Routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/sections', require('./routes/sectionRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/time-slots', require('./routes/timeSlotRoutes'));
app.use('/api/timetable', require('./routes/timetableRoutes'));
app.use('/api/conflicts', require('./routes/resolverRoutes'));
app.use('/api/resolver', require('./routes/resolverRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));
app.use('/api', require('./routes/analyticsRoutes'));

// Central error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas BEFORE starting Express server
const startServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB Atlas connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(`[Fatal Startup Error] Unable to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection] ${err.message}`);
});

module.exports = app;
// Trigger restart
