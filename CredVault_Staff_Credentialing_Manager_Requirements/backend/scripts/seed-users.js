import bcrypt from 'bcryptjs';
import { initDatabase, getDatabase } from '../src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const users = [
  { email: 'admin@credvault.com',       password: 'Admin@1234',       firstName: 'System',    lastName: 'Admin',       role: 'admin',       department: 'IT' },
  { email: 'coordinator@credvault.com', password: 'Coord@1234',       firstName: 'Sarah',     lastName: 'Mitchell',    role: 'coordinator', department: 'Credentialing' },
  { email: 'director@credvault.com',    password: 'Director@1234',    firstName: 'Dr. James', lastName: 'Harrison',    role: 'director',    department: 'Medical Affairs' },
  { email: 'hr@credvault.com',          password: 'HR@Admin1234',     firstName: 'Linda',     lastName: 'Nguyen',      role: 'hr',          department: 'Human Resources' },
  { email: 'auditor@credvault.com',     password: 'Audit@1234',       firstName: 'Robert',    lastName: 'Chen',        role: 'auditor',     department: 'Compliance' },
];

const seed = async () => {
  try {
    await initDatabase();
    const { User } = getDatabase().models;

    for (const u of users) {
      const exists = await User.findOne({ where: { email: u.email } });
      if (exists) { console.log(`  skip  ${u.email} (already exists)`); continue; }

      const passwordHash = await bcrypt.hash(u.password, 12);
      await User.create({ ...u, passwordHash });
      console.log(`  created  ${u.role.padEnd(12)} ${u.email}`);
    }

    console.log('\nDefault credentials:');
    users.forEach(u => console.log(`  ${u.role.padEnd(12)} ${u.email.padEnd(35)} ${u.password}`));
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
