import express from 'express';
import jwt      from 'jsonwebtoken';
import bcrypt   from 'bcryptjs';
import mongoose from 'mongoose';
import User     from '../models/User.js';

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'aura_luxury_secret_123', { expiresIn: '30d' });

// ── Hardcoded admin credentials (development / fallback) ──────────────────────
const ADMIN_EMAIL    = 'admin@aura.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_FALLBACK = {
  _id:   'fallback_admin_id',
  name:  'Aura Admin',
  email: ADMIN_EMAIL,
  role:  'admin',
};

const isDBConnected = () => mongoose.connection.readyState === 1;

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required.' });

    // Offline fallback — can't create users without DB
    if (!isDBConnected())
      return res.status(503).json({ message: 'Database unavailable. Please try again shortly.' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'An account with this email already exists.' });

    const user = await User.create({ name, email, password, role: 'customer' });
    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    // ── Fast admin fallback — works even without MongoDB ─────────────────────
    // Handles both DB-connected and offline scenarios so login is never blocked
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      if (!isDBConnected()) {
        // DB offline — return hardcoded admin immediately, no DB call
        console.log('🔑 Admin login via fallback (DB offline)');
        return res.json({
          ...ADMIN_FALLBACK,
          token: generateToken(ADMIN_FALLBACK._id),
        });
      }

      // DB online — try to find the real admin record
      try {
        const adminUser = await User.findOne({ email: ADMIN_EMAIL, role: 'admin' });
        if (adminUser) {
          const match = await adminUser.comparePassword(password);
          if (match) {
            console.log('✅ Admin login success (DB)');
            return res.json({
              _id:   adminUser._id,
              name:  adminUser.name,
              email: adminUser.email,
              role:  adminUser.role,
              token: generateToken(adminUser._id),
            });
          }
        }
      } catch (dbErr) {
        console.warn('Admin DB lookup failed, using fallback:', dbErr.message);
      }

      // Admin record not found in DB yet (first boot before seed ran) — use fallback
      console.log('🔑 Admin login via credential fallback');
      return res.json({
        ...ADMIN_FALLBACK,
        token: generateToken(ADMIN_FALLBACK._id),
      });
    }

    // ── Regular user login ────────────────────────────────────────────────────
    if (!isDBConnected())
      return res.status(503).json({ message: 'Database unavailable. Please try again shortly.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password.' });

    console.log(`✅ User login: ${user.email}`);
    res.json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/auth/me — validate token ────────────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer '))
      return res.status(401).json({ message: 'Not authenticated.' });

    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET || 'aura_luxury_secret_123');

    // Handle fallback admin token
    if (decoded.id === 'fallback_admin_id' || decoded.id === 'default_admin_id') {
      return res.json(ADMIN_FALLBACK);
    }

    if (!isDBConnected())
      return res.status(503).json({ message: 'Database unavailable.' });

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
});

export default router;
