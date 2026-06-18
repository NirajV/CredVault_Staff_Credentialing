import express from 'express';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../config/database.js';
import { authorize } from '../middleware/authenticate.js';

const router = express.Router();

const safeUser = (u) => ({
  id: u.id, email: u.email,
  firstName: u.firstName, lastName: u.lastName,
  role: u.role, department: u.department,
  phone: u.phone, status: u.status, lastLogin: u.lastLogin,
  createdAt: u.createdAt
});

// GET /users — list all (admin only)
router.get('/', authorize('admin'), async (req, res, next) => {
  try {
    const { User } = getDatabase().models;
    const users = await User.findAll({ order: [['createdAt', 'ASC']] });
    res.json({
      success: true,
      data: users.map(u => safeUser(u.toJSON())),
      timestamp: new Date().toISOString()
    });
  } catch (err) { next(err); }
});

// POST /users — create (admin only)
router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, department, phone } = req.body;
    if (!email || !password || !firstName || !lastName)
      return res.status(400).json({ success: false, error: { message: 'email, password, firstName and lastName are required' } });
    if (password.length < 8)
      return res.status(400).json({ success: false, error: { message: 'Password must be at least 8 characters' } });

    const { User } = getDatabase().models;
    const exists = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (exists)
      return res.status(409).json({ success: false, error: { message: 'Email already registered' } });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email.toLowerCase().trim(), passwordHash,
      firstName, lastName,
      role: role || 'coordinator',
      department: department || null,
      phone: phone || null
    });
    res.status(201).json({ success: true, data: safeUser(user.toJSON()), timestamp: new Date().toISOString() });
  } catch (err) { next(err); }
});

// PATCH /users/:id — update (admin only)
router.patch('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const { User } = getDatabase().models;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    const { firstName, lastName, role, department, phone, status, password } = req.body;
    const updates = {};
    if (firstName)   updates.firstName   = firstName;
    if (lastName)    updates.lastName    = lastName;
    if (role)        updates.role        = role;
    if (department !== undefined) updates.department = department;
    if (phone !== undefined)      updates.phone      = phone;
    if (status)      updates.status      = status;
    if (password) {
      if (password.length < 8)
        return res.status(400).json({ success: false, error: { message: 'Password must be at least 8 characters' } });
      updates.passwordHash = await bcrypt.hash(password, 12);
    }

    await user.update(updates);
    res.json({ success: true, data: safeUser(user.toJSON()), timestamp: new Date().toISOString() });
  } catch (err) { next(err); }
});

// DELETE /users/:id — deactivate (admin only, cannot delete self)
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ success: false, error: { message: 'You cannot deactivate your own account' } });

    const { User } = getDatabase().models;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    await user.update({ status: user.status === 'active' ? 'inactive' : 'active' });
    res.json({ success: true, data: safeUser(user.toJSON()), timestamp: new Date().toISOString() });
  } catch (err) { next(err); }
});

export default router;
