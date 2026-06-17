import express from 'express';
import { getDatabase } from '../config/database.js';

const router = express.Router();

// Get all credentials for a provider
router.get('/provider/:providerId', async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const sequelize = getDatabase();
    const { License, Certification, DEA, Malpractice, Privilege, Task } = sequelize.models;

    const [licenses, certifications, deas, malpractices, privileges, tasks] = await Promise.all([
      License.findAll({ where: { providerId } }),
      Certification.findAll({ where: { providerId } }),
      DEA.findAll({ where: { providerId } }),
      Malpractice.findAll({ where: { providerId } }),
      Privilege.findAll({ where: { providerId } }),
      Task.findAll({ where: { providerId } })
    ]);

    res.json({
      success: true,
      data: {
        licenses: licenses.map(l => l.toJSON()),
        certifications: certifications.map(c => c.toJSON()),
        deas: deas.map(d => d.toJSON()),
        malpractices: malpractices.map(m => m.toJSON()),
        privileges: privileges.map(p => p.toJSON()),
        tasks: tasks.map(t => t.toJSON())
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// License endpoints
router.post('/licenses', async (req, res, next) => {
  try {
    const sequelize = getDatabase();
    const { License } = sequelize.models;
    const license = await License.create(req.body);
    res.status(201).json({ success: true, data: license.toJSON() });
  } catch (error) {
    next(error);
  }
});

router.patch('/licenses/:id', async (req, res, next) => {
  try {
    const sequelize = getDatabase();
    const { License } = sequelize.models;
    const license = await License.findByPk(req.params.id);
    if (!license) return res.status(404).json({ success: false, error: { message: 'License not found' } });
    await license.update(req.body);
    res.json({ success: true, data: license.toJSON() });
  } catch (error) {
    next(error);
  }
});

router.delete('/licenses/:id', async (req, res, next) => {
  try {
    const sequelize = getDatabase();
    const { License } = sequelize.models;
    await License.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Certification endpoints
router.post('/certifications', async (req, res, next) => {
  try {
    const sequelize = getDatabase();
    const { Certification } = sequelize.models;
    const cert = await Certification.create(req.body);
    res.status(201).json({ success: true, data: cert.toJSON() });
  } catch (error) {
    next(error);
  }
});

router.patch('/certifications/:id', async (req, res, next) => {
  try {
    const sequelize = getDatabase();
    const { Certification } = sequelize.models;
    const cert = await Certification.findByPk(req.params.id);
    if (!cert) return res.status(404).json({ success: false, error: { message: 'Certification not found' } });
    await cert.update(req.body);
    res.json({ success: true, data: cert.toJSON() });
  } catch (error) {
    next(error);
  }
});

router.delete('/certifications/:id', async (req, res, next) => {
  try {
    const sequelize = getDatabase();
    const { Certification } = sequelize.models;
    await Certification.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// DEA endpoints
router.post('/dea', async (req, res, next) => {
  try {
    const sequelize = getDatabase();
    const { DEA } = sequelize.models;
    const dea = await DEA.create(req.body);
    res.status(201).json({ success: true, data: dea.toJSON() });
  } catch (error) {
    next(error);
  }
});

router.patch('/dea/:id', async (req, res, next) => {
  try {
    const sequelize = getDatabase();
    const { DEA } = sequelize.models;
    const dea = await DEA.findByPk(req.params.id);
    if (!dea) return res.status(404).json({ success: false, error: { message: 'DEA not found' } });
    await dea.update(req.body);
    res.json({ success: true, data: dea.toJSON() });
  } catch (error) {
    next(error);
  }
});

router.delete('/dea/:id', async (req, res, next) => {
  try {
    const sequelize = getDatabase();
    const { DEA } = sequelize.models;
    await DEA.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Malpractice endpoints
router.post('/malpractice', async (req, res, next) => {
  try {
    const sequelize = getDatabase();
    const { Malpractice } = sequelize.models;
    const mal = await Malpractice.create(req.body);
    res.status(201).json({ success: true, data: mal.toJSON() });
  } catch (error) {
    next(error);
  }
});

router.patch('/malpractice/:id', async (req, res, next) => {
  try {
    const sequelize = getDatabase();
    const { Malpractice } = sequelize.models;
    const mal = await Malpractice.findByPk(req.params.id);
    if (!mal) return res.status(404).json({ success: false, error: { message: 'Malpractice not found' } });
    await mal.update(req.body);
    res.json({ success: true, data: mal.toJSON() });
  } catch (error) {
    next(error);
  }
});

router.delete('/malpractice/:id', async (req, res, next) => {
  try {
    const sequelize = getDatabase();
    const { Malpractice } = sequelize.models;
    await Malpractice.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Privilege endpoints
router.post('/privileges', async (req, res, next) => {
  try {
    const sequelize = getDatabase();
    const { Privilege } = sequelize.models;
    const priv = await Privilege.create(req.body);
    res.status(201).json({ success: true, data: priv.toJSON() });
  } catch (error) {
    next(error);
  }
});

router.patch('/privileges/:id', async (req, res, next) => {
  try {
    const sequelize = getDatabase();
    const { Privilege } = sequelize.models;
    const priv = await Privilege.findByPk(req.params.id);
    if (!priv) return res.status(404).json({ success: false, error: { message: 'Privilege not found' } });
    await priv.update(req.body);
    res.json({ success: true, data: priv.toJSON() });
  } catch (error) {
    next(error);
  }
});

router.delete('/privileges/:id', async (req, res, next) => {
  try {
    const sequelize = getDatabase();
    const { Privilege } = sequelize.models;
    await Privilege.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Task endpoints
router.post('/tasks', async (req, res, next) => {
  try {
    const sequelize = getDatabase();
    const { Task } = sequelize.models;
    const task = await Task.create(req.body);
    res.status(201).json({ success: true, data: task.toJSON() });
  } catch (error) {
    next(error);
  }
});

router.patch('/tasks/:id', async (req, res, next) => {
  try {
    const sequelize = getDatabase();
    const { Task } = sequelize.models;
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: { message: 'Task not found' } });
    await task.update(req.body);
    res.json({ success: true, data: task.toJSON() });
  } catch (error) {
    next(error);
  }
});

router.delete('/tasks/:id', async (req, res, next) => {
  try {
    const sequelize = getDatabase();
    const { Task } = sequelize.models;
    await Task.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
