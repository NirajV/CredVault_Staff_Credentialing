import { Sequelize } from 'sequelize';
import { createUserModel } from '../models/User.js';
import { createProviderModel } from '../models/Provider.js';
import { createLicenseModel } from '../models/License.js';
import { createCertificationModel } from '../models/Certification.js';
import { createDEAModel } from '../models/DEA.js';
import { createMalpracticeModel } from '../models/Malpractice.js';
import { createPrivilegeModel } from '../models/Privilege.js';
import { createTaskModel } from '../models/Task.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbFilePath = 'C:\\Users\\niraj\\Project_Gen_AI\\CredVault_Staff_Credentialing_Manager_Requirements\\backend\\credvault.db';
let sequelize;

export const initDatabase = async () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const dbUrl = process.env.DATABASE_URL;

  let sequelizeConfig;

  if (isDevelopment && !dbUrl) {
    // Use SQLite for local development
    sequelizeConfig = new Sequelize({
      dialect: 'sqlite',
      storage: dbFilePath,
      logging: process.env.LOG_LEVEL === 'debug' ? console.log : false
    });
  } else if (dbUrl) {
    // Use PostgreSQL if DATABASE_URL is provided
    sequelizeConfig = new Sequelize(dbUrl, {
      logging: process.env.LOG_LEVEL === 'debug' ? console.log : false,
      dialect: 'postgres',
      pool: {
        max: 30,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
  } else {
    // Fallback to SQLite in-memory
    sequelizeConfig = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: process.env.LOG_LEVEL === 'debug' ? console.log : false
    });
  }

  sequelize = sequelizeConfig;

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }

  // Define models
  const models = {
    User: createUserModel(sequelize, sequelize.Sequelize.DataTypes),
    Provider: createProviderModel(sequelize, sequelize.Sequelize.DataTypes),
    License: createLicenseModel(sequelize, sequelize.Sequelize.DataTypes),
    Certification: createCertificationModel(sequelize, sequelize.Sequelize.DataTypes),
    DEA: createDEAModel(sequelize, sequelize.Sequelize.DataTypes),
    Malpractice: createMalpracticeModel(sequelize, sequelize.Sequelize.DataTypes),
    Privilege: createPrivilegeModel(sequelize, sequelize.Sequelize.DataTypes),
    Task: createTaskModel(sequelize, sequelize.Sequelize.DataTypes)
  };

  // Set up associations
  const { Provider, License, Certification, DEA, Malpractice, Privilege, Task } = models;

  Provider.hasMany(License, { foreignKey: 'providerId', as: 'licenses' });
  License.belongsTo(Provider, { foreignKey: 'providerId' });

  Provider.hasMany(Certification, { foreignKey: 'providerId', as: 'certifications' });
  Certification.belongsTo(Provider, { foreignKey: 'providerId' });

  Provider.hasMany(DEA, { foreignKey: 'providerId', as: 'deas' });
  DEA.belongsTo(Provider, { foreignKey: 'providerId' });

  Provider.hasMany(Malpractice, { foreignKey: 'providerId', as: 'malpractices' });
  Malpractice.belongsTo(Provider, { foreignKey: 'providerId' });

  Provider.hasMany(Privilege, { foreignKey: 'providerId', as: 'privileges' });
  Privilege.belongsTo(Provider, { foreignKey: 'providerId' });

  Provider.hasMany(Task, { foreignKey: 'providerId', as: 'tasks' });
  Task.belongsTo(Provider, { foreignKey: 'providerId' });

  // Sync database (creates tables if they don't exist)
  try {
    await sequelize.sync({ alter: false });
    console.log('✅ Database tables synced');
  } catch (error) {
    console.error('⚠️  Database sync warning:', error.message);
  }

  return models;
};

export const getDatabase = () => sequelize;
export const closeDatabase = async () => {
  if (sequelize) {
    await sequelize.close();
  }
};
