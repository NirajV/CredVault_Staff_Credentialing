import express from 'express';
import { getDatabase } from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { type, itemType } = req.query;
    const sequelize = getDatabase();
    const { Provider, License, Certification, DEA, Malpractice, Privilege } = sequelize.models;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ninetyDays = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

    const getAlertType = (expiry) => {
      const d = new Date(expiry);
      if (d < today) return 'expired';
      const days = Math.ceil((d - today) / 86400000);
      return days <= 30 ? 'critical' : 'upcoming';
    };

    const getDays = (expiry) => Math.ceil((new Date(expiry) - today) / 86400000);

    // Use toJSON() instead of raw:true to always get camelCase
    const [providerRows, licenses, certifications, deas, malpractices, privileges] = await Promise.all([
      Provider.findAll({ where: { deletedAt: null } }),
      License.findAll(),
      Certification.findAll(),
      DEA.findAll(),
      Malpractice.findAll(),
      Privilege.findAll()
    ]);

    const providerMap = Object.fromEntries(providerRows.map(p => {
      const j = p.toJSON();
      return [j.id, j];
    }));

    const alerts = [];

    const addAlerts = (items, credType, nameField) => {
      for (const raw of items) {
        const item = raw.toJSON();
        const expiryDate = item.expiryDate;
        if (!expiryDate) continue;
        const expiry = new Date(expiryDate);
        if (expiry > ninetyDays) continue;

        const provider = providerMap[item.providerId];
        if (!provider) continue;

        alerts.push({
          id: `${credType}-${item.id}`,
          credentialId: item.id,
          alert_type: getAlertType(expiryDate),
          item_type: credType,
          item_name: item[nameField] || 'Unknown',
          expiry_date: expiryDate,
          days_until_expiry: getDays(expiryDate),
          provider_id: provider.id,
          provider_name: `${provider.firstName} ${provider.lastName}`,
          provider_npi: provider.npi,
          provider_specialty: provider.specialty,
          acknowledged: false
        });
      }
    };

    addAlerts(licenses,       'license',       'licenseNumber');
    addAlerts(certifications, 'certification', 'certName');
    addAlerts(deas,           'dea',           'deaNumber');
    addAlerts(malpractices,   'malpractice',   'carrier');
    addAlerts(privileges,     'privilege',     'privilegeType');

    const order = { expired: 0, critical: 1, upcoming: 2 };
    alerts.sort((a, b) => {
      const diff = (order[a.alert_type] ?? 3) - (order[b.alert_type] ?? 3);
      return diff !== 0 ? diff : a.days_until_expiry - b.days_until_expiry;
    });

    const counts = {
      expired:  alerts.filter(a => a.alert_type === 'expired').length,
      critical: alerts.filter(a => a.alert_type === 'critical').length,
      upcoming: alerts.filter(a => a.alert_type === 'upcoming').length,
      total:    alerts.length
    };

    let filtered = alerts;
    if (type && type !== 'all')     filtered = filtered.filter(a => a.alert_type === type);
    if (itemType && itemType !== 'all') filtered = filtered.filter(a => a.item_type === itemType);

    res.json({ success: true, data: filtered, counts, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
});

export default router;
