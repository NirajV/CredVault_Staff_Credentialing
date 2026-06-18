import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../config/database.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

const JWT_SECRET         = process.env.JWT_SECRET          || 'dev-secret-key-not-for-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET  || 'dev-refresh-secret-not-for-production';
const JWT_EXPIRY         = process.env.JWT_EXPIRY          || '1h';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY  || '7d';

const makeTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName
  };
  const accessToken  = jwt.sign(payload, JWT_SECRET,         { expiresIn: JWT_EXPIRY });
  const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRY });
  return { accessToken, refreshToken };
};

const safeUser = (u) => ({
  id: u.id, email: u.email,
  firstName: u.firstName, lastName: u.lastName,
  role: u.role, department: u.department,
  phone: u.phone, status: u.status, lastLogin: u.lastLogin
});

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: { message: 'Email and password required' } });

    const sequelize = getDatabase();
    const { User } = sequelize.models;

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user)
      return res.status(401).json({ success: false, error: { message: 'Invalid email or password' } });

    if (user.status === 'inactive')
      return res.status(401).json({ success: false, error: { message: 'Account is inactive. Contact your administrator.' } });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({ success: false, error: { message: 'Invalid email or password' } });

    await user.update({ lastLogin: new Date() });

    const { accessToken, refreshToken } = makeTokens(user.toJSON());

    res.json({
      success: true,
      data: { user: safeUser(user.toJSON()), accessToken, refreshToken },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/register  (admin only in production — open for seeding)
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, department, phone } = req.body;

    if (!email || !password || !firstName || !lastName)
      return res.status(400).json({ success: false, error: { message: 'email, password, firstName, lastName are required' } });

    if (password.length < 8)
      return res.status(400).json({ success: false, error: { message: 'Password must be at least 8 characters' } });

    const sequelize = getDatabase();
    const { User } = sequelize.models;

    const existing = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existing)
      return res.status(409).json({ success: false, error: { message: 'Email already registered' } });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      firstName,
      lastName,
      role: role || 'coordinator',
      department: department || null,
      phone: phone || null
    });

    const { accessToken, refreshToken } = makeTokens(user.toJSON());

    res.status(201).json({
      success: true,
      data: { user: safeUser(user.toJSON()), accessToken, refreshToken },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ success: false, error: { message: 'Refresh token required' } });

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const sequelize = getDatabase();
    const { User } = sequelize.models;
    const user = await User.findByPk(decoded.id);

    if (!user || user.status === 'inactive')
      return res.status(401).json({ success: false, error: { message: 'Invalid refresh token' } });

    const { accessToken, refreshToken: newRefreshToken } = makeTokens(user.toJSON());

    res.json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')
      return res.status(401).json({ success: false, error: { message: 'Invalid or expired refresh token' } });
    next(error);
  }
});

// GET /auth/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const sequelize = getDatabase();
    const { User } = sequelize.models;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });
    res.json({ success: true, data: safeUser(user.toJSON()), timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
});

// POST /auth/logout  (client drops tokens; server can blacklist in future)
router.post('/logout', authenticate, (req, res) => {
  res.json({ success: true, data: { message: 'Logged out successfully' }, timestamp: new Date().toISOString() });
});

export default router;
