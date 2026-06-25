import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ── Load env FIRST before anything else ──────────────────────────────────────
dotenv.config();

const PORT         = process.env.PORT        || 10000;
const MONGODB_URI  = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/luxury-cafe';
const GEMINI_KEY   = process.env.GEMINI_API_KEY;
const JWT_SECRET   = process.env.JWT_SECRET  || 'aura_luxury_secret_123';

// ── Express + HTTP + Socket.io setup ─────────────────────────────────────────
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      'https://luxury-cafe-platform-1.onrender.com',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  },
});
app.set('io', io);

app.use(cors({
  origin: [
    'https://luxury-cafe-platform-1.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Gemini AI ─────────────────────────────────────────────────────────────────
let genAI = null;
if (GEMINI_KEY) {
  genAI  = new GoogleGenerativeAI(GEMINI_KEY);
  console.log('✅ Gemini AI initialized');
} else {
  console.log('⚠️  GEMINI_API_KEY not set — AI features disabled');
}
app.set('genAI', genAI);

// ── Routes ────────────────────────────────────────────────────────────────────
import authRoutes        from './routes/auth.js';
import menuRoutes        from './routes/menu.js';
import orderRoutes       from './routes/orders.js';
import chatRoutes        from './routes/chat.js';
import reservationRoutes from './routes/reservations.js';
import paymentRoutes     from './routes/payment.js';
import tableRoutes       from './routes/tables.js';
import analyticsRoutes   from './routes/analytics.js';

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    message: 'Aura Reserve Backend is running.',
  });
});

app.use('/api/auth',         authRoutes);
app.use('/api/menu',         menuRoutes);
app.use('/api/orders',       orderRoutes);
app.use('/api/chat',         chatRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/payments',     paymentRoutes);
app.use('/api/tables',       tableRoutes);
app.use('/api/analytics',    analyticsRoutes);


// 404 catch-all
app.use((req,res)=>{
 res.status(404).json({
   message:'Route not found'
 });
});

// Global error handler
app.use((err,req,res,next)=>{
 console.error('🔴 Unhandled error:',err.message);

 res.status(500).json({
   message:err.message || 'Internal server error'
 });
});
// ── Socket.io ─────────────────────────────────────────────────────────────────
app.set('io', io);

let activeUsers = 0;

io.on('connection', (socket) => {
  console.log(`🔗 Socket connected: ${socket.id}`);
  activeUsers++;
  io.emit('active_users_update', activeUsers);

  socket.on('disconnect', () => {
    console.log(`↩️  Socket disconnected: ${socket.id}`);
    activeUsers = Math.max(0, activeUsers - 1);
    io.emit('active_users_update', activeUsers);
  });
  
  socket.on('order_status_update', (data) => io.emit('delivery_update', data));
});

// ── Seed admin user ───────────────────────────────────────────────────────────
async function seedAdmin() {
  try {
    const { default: User } = await import('./models/User.js');

    const existing = await User.findOne({ email: 'admin@aura.com' });
    if (!existing) {
      // Plain text — mongoose pre-save hook will bcrypt hash it
      await User.create({
        name:     'Aura Admin',
        email:    'admin@aura.com',
        password: 'admin123',
        role:     'admin',
      });
      console.log('👤 Default admin created  →  admin@aura.com / admin123');
    } else {
      // Verify password works; if not, reset it via mongoose (pre-save will rehash)
      const { default: bcrypt } = await import('bcryptjs');
      const match = await bcrypt.compare('admin123', existing.password);
      if (!match) {
        existing.password = 'admin123';  // plain text — pre-save hook will hash
        await existing.save();
        console.log('🔑 Admin password reset  →  admin123');
      } else {
        console.log('✅ Admin account verified →  admin@aura.com / admin123');
      }
    }
  } catch (err) {
    console.error('⚠️  Seed admin error:', err.message);
  }
}

// ── Seed default tables ───────────────────────────────────────────────────────
async function seedTables() {
  try {
    const { default: Table } = await import('./models/Table.js');
    
    // Always refresh the default tables to ensure the exact 8 tables are present
    await Table.deleteMany({});
    
    const defaultTables = [
      { number: "1", area: "Main Floor", name: "Table 1", capacity: 2, type: "Standard", status: "Available", location: { x: 20, y: 30 } },
      { number: "2", area: "Main Floor", name: "Table 2", capacity: 2, type: "Standard", status: "Available", location: { x: 35, y: 30 } },
      { number: "3", area: "Main Floor", name: "Table 3", capacity: 4, type: "Standard", status: "Available", location: { x: 50, y: 30 } },
      { number: "4", area: "Main Floor", name: "Table 4", capacity: 4, type: "Standard", status: "Available", location: { x: 65, y: 30 } },
      { number: "5", area: "Main Floor", name: "Table 5", capacity: 6, type: "Standard", status: "Available", location: { x: 25, y: 60 } },
      { number: "6", area: "Family Zone", name: "Table 6", capacity: 8, type: "Family", status: "Available", location: { x: 45, y: 60 } },
      { number: "VIP-1", area: "VIP Area", name: "VIP Table 1", capacity: 10, type: "VIP", status: "Available", location: { x: 65, y: 60 } }
    ];
    await Table.insertMany(defaultTables);
    console.log(`🪑 Tables seeded successfully (8 tables loaded)`);
  } catch (err) {
    console.error('⚠️  Seed tables error:', err.message);
  }
}

// ── MongoDB connection with retry ─────────────────────────────────────────────
const MONGO_OPTS = {
  serverSelectionTimeoutMS: 5000,   // fail fast if server not reachable
  socketTimeoutMS:          45000,
  connectTimeoutMS:         10000,
  maxPoolSize:              10,
};

let retryCount = 0;
const MAX_RETRIES = 5;

async function connectDB() {
  try {
    console.log(`\n🔄 Connecting to MongoDB (attempt ${retryCount + 1}/${MAX_RETRIES})…`);
    console.log(`   URI: ${MONGODB_URI.replace(/:([^@]+)@/, ':***@')}`);  // hide password

    await mongoose.connect(MONGODB_URI, MONGO_OPTS);

    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║   ✅  MongoDB Connected Successfully       ║');
    console.log(`║   DB: ${mongoose.connection.name.padEnd(35)}║`);
    console.log('╚══════════════════════════════════════════╝\n');

    retryCount = 0;
    await seedAdmin();
    await seedTables();
  } catch (err) {
    retryCount++;
    console.error(`\n❌ MongoDB connection failed (attempt ${retryCount}/${MAX_RETRIES})`);
    console.error(`   Reason: ${err.message}`);

    if (retryCount < MAX_RETRIES) {
      const delay = Math.min(retryCount * 2000, 10000); // exponential back-off up to 10s
      console.log(`⏳ Retrying in ${delay / 1000}s…\n`);
      setTimeout(connectDB, delay);
    } else {
      console.error('\n⚠️  Could not connect to MongoDB after maximum retries.');
      console.error('   The backend will continue running with IN-MEMORY mock data.');
      console.error('   → Admin login, reservations, orders will use fallback mode.\n');
    }
  }
}

// ── Mongoose event listeners ──────────────────────────────────────────────────
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected — will retry…');
  if (retryCount < MAX_RETRIES) setTimeout(connectDB, 3000);
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose error:', err.message);
});

// ── Start server then connect DB ──────────────────────────────────────────────
// Important: start HTTP server first so health checks work even while DB is connecting
httpServer.listen(PORT, "0.0.0.0", async () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║  🚀  Aura Reserve Backend Started         ║');
  console.log(`║  Port: ${String(PORT).padEnd(34)}║`);
  console.log('╚══════════════════════════════════════════╝');
  console.log(`\n   Health: http://localhost:${PORT}/api/health\n`);

  // Connect to MongoDB after server is listening
  await connectDB();
});


