import express from 'express';
import { getDatabase } from '../config/database.js';

const router = express.Router();

const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const daysFromNow = (n) => { const d = today(); d.setDate(d.getDate() + n); return d; };

const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return 'unknown';
  const d = new Date(expiryDate);
  const t = today();
  if (d < t) return 'expired';
  const days = Math.ceil((d - t) / 86400000);
  if (days <= 30) return 'critical';
  if (days <= 90) return 'upcoming';
  return 'active';
};

router.get('/summary', async (req, res, next) => {
  try {
    const sequelize = getDatabase();
    const { Provider, License, Certification, DEA, Malpractice, Privilege } = sequelize.models;

    const [providers, licenses, certs, deas, mals, privs] = await Promise.all([
      Provider.findAll({ where: { deletedAt: null } }),
      License.findAll(),
      Certification.findAll(),
      DEA.findAll(),
      Malpractice.findAll(),
      Privilege.findAll()
    ]);

    const allCredentials = [
      ...licenses.map(l => ({ ...l.toJSON(), credType: 'license' })),
      ...certs.map(c =>    ({ ...c.toJSON(), credType: 'certification' })),
      ...deas.map(d =>     ({ ...d.toJSON(), credType: 'dea' })),
      ...mals.map(m =>     ({ ...m.toJSON(), credType: 'malpractice' })),
      ...privs.map(p =>    ({ ...p.toJSON(), credType: 'privilege' })),
    ];

    const t         = today();
    const in30      = daysFromNow(30);
    const in90      = daysFromNow(90);

    const totalProviders  = providers.length;
    const activeProviders = providers.filter(p => p.status === 'active').length;

    // Credentials expiring within 30 days (not yet expired)
    const expiringThisMonth = allCredentials.filter(c => {
      if (!c.expiryDate) return false;
      const d = new Date(c.expiryDate);
      return d >= t && d <= in30;
    }).length;

    // Already expired
    const expiredCount = allCredentials.filter(c => {
      if (!c.expiryDate) return false;
      return new Date(c.expiryDate) < t;
    }).length;

    // Expiring in 90 days (for upcoming alerts)
    const expiringIn90 = allCredentials.filter(c => {
      if (!c.expiryDate) return false;
      const d = new Date(c.expiryDate);
      return d >= t && d <= in90;
    }).length;

    // Per-provider compliance: a provider is "compliant" if they have no expired credentials
    const providerCompliance = providers.map(p => {
      const pid = p.id;
      const myCredentials = allCredentials.filter(c => c.providerId === pid);
      const hasExpired = myCredentials.some(c => c.expiryDate && new Date(c.expiryDate) < t);
      return !hasExpired;
    });

    const compliantCount = providerCompliance.filter(Boolean).length;
    const compliantPercentage = totalProviders > 0
      ? Math.round((compliantCount / totalProviders) * 100)
      : 0;

    // Avg compliance score from providers table
    const avgScore = totalProviders > 0
      ? Math.round(providers.reduce((sum, p) => sum + (p.complianceScore || 0), 0) / totalProviders)
      : 0;

    // Specialty breakdown
    const specialtyMap = {};
    providers.forEach(p => {
      const s = p.specialty || 'Unspecified';
      specialtyMap[s] = (specialtyMap[s] || 0) + 1;
    });
    const bySpecialty = Object.entries(specialtyMap)
      .map(([specialty, count]) => ({ specialty, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Status breakdown
    const statusMap = { active: 0, inactive: 0, suspended: 0, terminated: 0 };
    providers.forEach(p => { statusMap[p.status] = (statusMap[p.status] || 0) + 1; });

    // Credential type breakdown
    const credTypeMap = {
      license: licenses.length,
      certification: certs.length,
      dea: deas.length,
      malpractice: mals.length,
      privilege: privs.length,
    };

    // Recent activity: credentials expiring soonest
    const urgentAlerts = allCredentials
      .filter(c => {
        if (!c.expiryDate) return false;
        const d = new Date(c.expiryDate);
        return d < in30;
      })
      .map(c => {
        const provider = providers.find(p => p.id === c.providerId);
        return {
          providerId:      c.providerId,
          providerName:    provider ? `${provider.firstName} ${provider.lastName}` : 'Unknown',
          credType:        c.credType,
          expiryDate:      c.expiryDate,
          status:          getExpiryStatus(c.expiryDate),
          daysUntilExpiry: Math.ceil((new Date(c.expiryDate) - t) / 86400000),
        };
      })
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        totalProviders,
        activeProviders,
        expiringThisMonth,
        expiringIn90,
        expiredCount,
        compliantCount,
        compliantPercentage,
        avgComplianceScore: avgScore,
        totalCredentials: allCredentials.length,
        bySpecialty,
        byStatus: statusMap,
        byCredentialType: credTypeMap,
        urgentAlerts,
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

export default router;
