import { Op } from 'sequelize';
import { getDatabase } from '../config/database.js';

export const getProviderMeta = async (req, res, next) => {
  try {
    const sequelize = getDatabase();
    const Provider = sequelize.models.Provider;
    const rows = await Provider.findAll({
      where: { deletedAt: null },
      attributes: ['specialty', 'status'],
      raw: true
    });
    const specialties = [...new Set(rows.map(r => r.specialty).filter(Boolean))].sort();
    const statuses    = [...new Set(rows.map(r => r.status).filter(Boolean))].sort();
    res.json({ success: true, data: { specialties, statuses } });
  } catch (err) { next(err); }
};

export const getProviders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, specialty, status } = req.query;
    const offset = (page - 1) * limit;
    const sequelize = getDatabase();
    const Provider = sequelize.models.Provider;

    const where = { deletedAt: null };

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { npi: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (specialty) where.specialty = specialty;
    if (status) where.status = status;

    const { rows, count } = await Provider.findAndCountAll({
      where,
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['lastName', 'ASC'], ['firstName', 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export const createProvider = async (req, res, next) => {
  try {
    const { npi, firstName, lastName, specialty, email, phone, employmentType, status, hireDate } = req.body;
    const sequelize = getDatabase();
    const Provider = sequelize.models.Provider;

    if (!npi || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'npi, firstName, and lastName are required',
          statusCode: 400
        }
      });
    }

    const existingProvider = await Provider.findOne({ where: { npi } });
    if (existingProvider) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_NPI',
          message: 'A provider with this NPI already exists',
          statusCode: 409
        }
      });
    }

    const provider = await Provider.create({
      npi,
      firstName,
      lastName,
      specialty: specialty || null,
      email: email || null,
      phone: phone || null,
      employmentType: employmentType || 'full_time',
      status: status || 'active',
      hireDate: hireDate || null,
      complianceScore: 0
    });

    res.status(201).json({
      success: true,
      data: provider.toJSON(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export const getProviderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sequelize = getDatabase();
    const Provider = sequelize.models.Provider;

    const provider = await Provider.findOne({
      where: { id, deletedAt: null }
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROVIDER_NOT_FOUND',
          message: 'Provider not found',
          statusCode: 404
        }
      });
    }

    res.json({
      success: true,
      data: provider.toJSON(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export const updateProvider = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sequelize = getDatabase();
    const Provider = sequelize.models.Provider;

    const provider = await Provider.findOne({
      where: { id, deletedAt: null }
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROVIDER_NOT_FOUND',
          message: 'Provider not found',
          statusCode: 404
        }
      });
    }

    await provider.update(req.body);

    res.json({
      success: true,
      data: provider.toJSON(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProvider = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sequelize = getDatabase();
    const Provider = sequelize.models.Provider;

    const provider = await Provider.findOne({
      where: { id, deletedAt: null }
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROVIDER_NOT_FOUND',
          message: 'Provider not found',
          statusCode: 404
        }
      });
    }

    await provider.update({ deletedAt: new Date() });

    res.json({
      success: true,
      data: { message: 'Provider deleted successfully' },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};
