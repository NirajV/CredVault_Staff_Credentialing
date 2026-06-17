import express from 'express';
import { getDatabase } from '../config/database.js';

const router = express.Router();

const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };

const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return 'unknown';
  const d = new Date(expiryDate);
  const t = today();
  if (d < t) return 'expired';
  const days = Math.ceil((d - t) / 86400000);
  if (days <= 30)  return 'critical';
  if (days <= 90)  return 'upcoming';
  return 'active';
};

const getProviderCompliance = (licenses, certs, deas, mals, privs) => {
  let score = 0, max = 0;

  const credScore = (items, points) => {
    max += points;
    if (!items.length) return 0;
    const active = items.filter(i => getExpiryStatus(i.expiryDate) !== 'expired');
    if (!active.length) return 0;
    const expiring = active.filter(i => getExpiryStatus(i.expiryDate) === 'critical');
    return expiring.length ? Math.round(points * 0.4) : points;
  };

  score += credScore(licenses, 25);
  score += credScore(certs,    20);
  score += credScore(deas,     20);
  score += credScore(mals,     20);
  score += credScore(privs,    15);

  if (max === 0) return 0;
  return Math.round((score / max) * 100);
};

// GET /api/v1/reports/compliance
router.get('/compliance', async (req, res, next) => {
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

    const data = providers.map(p => {
      const pj = p.toJSON();
      const pLic  = licenses.filter(l => l.providerId === pj.id).map(l => l.toJSON());
      const pCert = certs.filter(c => c.providerId === pj.id).map(c => c.toJSON());
      const pDea  = deas.filter(d => d.providerId === pj.id).map(d => d.toJSON());
      const pMal  = mals.filter(m => m.providerId === pj.id).map(m => m.toJSON());
      const pPriv = privs.filter(pr => pr.providerId === pj.id).map(pr => pr.toJSON());

      return {
        id: pj.id,
        name: `${pj.firstName} ${pj.lastName}`,
        npi: pj.npi,
        specialty: pj.specialty || '—',
        department: pj.specialty || '—',
        status: pj.status,
        employmentType: pj.employmentType,
        hireDate: pj.hireDate,
        compliance: getProviderCompliance(pLic, pCert, pDea, pMal, pPriv),
        licenseCount: pLic.length,
        certCount: pCert.length,
        deaCount: pDea.length,
        malCount: pMal.length,
        privCount: pPriv.length,
        expiredCount: [
          ...pLic, ...pCert, ...pDea, ...pMal, ...pPriv
        ].filter(i => getExpiryStatus(i.expiryDate) === 'expired').length
      };
    });

    // sort by compliance asc (worst first)
    data.sort((a, b) => a.compliance - b.compliance);

    res.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/reports/calendar
router.get('/calendar', async (req, res, next) => {
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

    const providerMap = Object.fromEntries(
      providers.map(p => {
        const j = p.toJSON();
        return [j.id, `${j.firstName} ${j.lastName}`];
      })
    );

    const items = [
      ...licenses.map(l => { const j = l.toJSON(); return { type: 'License',       name: `${j.licenseType} - ${j.state}`, date: j.expiryDate, providerId: j.providerId }; }),
      ...certs.map(c =>    { const j = c.toJSON(); return { type: 'Certification', name: j.certName,                       date: j.expiryDate, providerId: j.providerId }; }),
      ...deas.map(d =>     { const j = d.toJSON(); return { type: 'DEA',           name: j.deaNumber,                      date: j.expiryDate, providerId: j.providerId }; }),
      ...mals.map(m =>     { const j = m.toJSON(); return { type: 'Malpractice',   name: j.carrier,                        date: j.expiryDate, providerId: j.providerId }; }),
      ...privs.map(p =>    { const j = p.toJSON(); return { type: 'Privilege',     name: j.privilegeType,                  date: j.expiryDate, providerId: j.providerId }; }),
    ]
      .filter(i => i.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        ...item,
        providerName: providerMap[item.providerId] || 'Unknown',
        status: getExpiryStatus(item.date)
      }));

    res.json({ success: true, data: items, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
});

export default router;
