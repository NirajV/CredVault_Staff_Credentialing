import express from 'express';
import { getDatabase } from '../config/database.js';
import { sendCredentialAlertEmail } from '../services/emailService.js';

const router = express.Router();

// ─── Alert threshold windows (days before expiry) ─────────────────────────────
const DEFAULT_THRESHOLDS = [180, 90, 45, 30, 15, 7, 0];

// ─── Credential type → model + name field map ─────────────────────────────────
const CRED_TYPES = [
  { type: 'license',       model: 'License',       nameField: 'licenseNumber', dateField: 'expiryDate' },
  { type: 'certification', model: 'Certification',  nameField: 'certName',      dateField: 'expiryDate' },
  { type: 'dea',           model: 'DEA',            nameField: 'deaNumber',     dateField: 'expiryDate' },
  { type: 'malpractice',   model: 'Malpractice',    nameField: 'carrier',       dateField: 'expiryDate' },
  { type: 'privilege',     model: 'Privilege',      nameField: 'privilegeType', dateField: 'expiryDate' },
  { type: 'task',          model: 'Task',           nameField: 'title',         dateField: 'dueDate'    },
];

// ─── Core alert-sending logic (shared by /send-alerts and cron job) ───────────
export async function runAlertJob(db) {
  const { AlertRule, Provider } = db.models;

  const rules = await AlertRule.findAll({ where: { enabled: true } });
  if (!rules.length) return { sent: 0, checked: 0, message: 'No active alert rules' };

  const today  = new Date();
  today.setHours(0, 0, 0, 0);

  // Use configured thresholds or fall back to defaults
  const allThresholds = [...new Set([
    ...rules.flatMap(r => r.thresholds ?? DEFAULT_THRESHOLDS),
    ...DEFAULT_THRESHOLDS,
  ])].sort((a, b) => b - a);

  const maxDays = Math.max(...allThresholds);
  const cutoff  = new Date(today.getTime() + maxDays * 86400000);

  const providers = await Provider.findAll({ where: { deletedAt: null } });
  const providerMap = Object.fromEntries(providers.map(p => [p.id, p.toJSON()]));

  // Collect all expiring credentials across all types
  const expiringItems = [];
  for (const { type, model: modelName, nameField, dateField } of CRED_TYPES) {
    const Model = db.models[modelName];
    if (!Model) continue;
    const rows = await Model.findAll();
    for (const raw of rows) {
      const item = raw.toJSON();
      const dateVal = item[dateField];
      if (!dateVal) continue;
      const expiry   = new Date(dateVal);
      const daysLeft = Math.ceil((expiry - today) / 86400000);
      // Include if within window OR already expired (daysLeft <= 0) up to -30d
      if (daysLeft > maxDays || daysLeft < -30) continue;
      const provider = providerMap[item.providerId];
      if (!provider) continue;
      expiringItems.push({ type, name: item[nameField] || type, daysLeft, expiry: dateVal, provider });
    }
  }

  if (!expiringItems.length) return { sent: 0, checked: 0, message: 'No credentials in alert window' };

  let emailsSent = 0;

  for (const rule of rules) {
    const thresholds = rule.thresholds?.length ? rule.thresholds : DEFAULT_THRESHOLDS;

    // Match items this rule covers
    const matching = expiringItems.filter(item => {
      const typeMatch = rule.credentialType === 'all' || item.type === rule.credentialType;
      const dayMatch  = thresholds.some(t => item.daysLeft <= t);
      return typeMatch && dayMatch;
    });

    if (!matching.length) continue;

    // Group by provider — one email per provider per rule
    const byProvider = {};
    for (const item of matching) {
      const key = item.provider.id;
      if (!byProvider[key]) byProvider[key] = { provider: item.provider, items: [] };
      byProvider[key].items.push(item);
    }

    for (const { provider, items } of Object.values(byProvider)) {
      if (!provider.email) continue;
      const extra = rule.notifyEmail ? [rule.notifyEmail] : [];
      try {
        await sendCredentialAlertEmail(provider, items, extra);
        emailsSent++;
      } catch (err) {
        console.error(`[Alert] Failed to send email to ${provider.email}:`, err.message);
      }
    }
  }

  return { sent: emailsSent, checked: expiringItems.length };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRUD routes for alert rules
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/', async (req, res, next) => {
  try {
    const { AlertRule } = getDatabase().models;
    const rules = await AlertRule.findAll({ order: [['createdAt', 'ASC']] });
    res.json({ success: true, data: rules.map(r => r.toJSON()) });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { AlertRule } = getDatabase().models;
    const rule = await AlertRule.create({
      credentialType: req.body.credentialType || 'all',
      thresholds:     req.body.thresholds     || DEFAULT_THRESHOLDS,
      notifyEmail:    req.body.notifyEmail     || null,
      notifyRole:     req.body.notifyRole      || null,
      enabled:        req.body.enabled !== undefined ? req.body.enabled : true
    });
    res.status(201).json({ success: true, data: rule.toJSON() });
  } catch (err) { next(err); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { AlertRule } = getDatabase().models;
    const rule = await AlertRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json({ success: false, error: { message: 'Rule not found' } });
    await rule.update(req.body);
    res.json({ success: true, data: rule.toJSON() });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { AlertRule } = getDatabase().models;
    await AlertRule.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// Manual trigger — POST /alert-settings/send-alerts
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/send-alerts', async (req, res, next) => {
  try {
    const result = await runAlertJob(getDatabase());
    res.json({
      success: true,
      message: `Alert job complete — ${result.sent} email${result.sent !== 1 ? 's' : ''} sent`,
      ...result
    });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// Test a single rule — POST /alert-settings/test/:id
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/test/:id', async (req, res, next) => {
  try {
    const { AlertRule } = getDatabase().models;
    const rule = await AlertRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json({ success: false, error: { message: 'Rule not found' } });

    const to = req.body.testEmail || rule.notifyEmail;
    if (!to) return res.status(400).json({ success: false, error: { message: 'No email address configured for this rule' } });

    // Send a realistic sample alert
    const sampleProvider = {
      firstName:  'Sample',
      lastName:   'Provider',
      email:      to,
      specialty:  'Internal Medicine',
      npi:        '1234567890',
    };

    const sampleAlerts = [
      { type: 'license',       name: 'CA Medical License #A123456',   daysLeft: 14,  expiry: new Date(Date.now() + 14  * 86400000).toISOString() },
      { type: 'certification', name: 'ABIM Board Certification',       daysLeft: 45,  expiry: new Date(Date.now() + 45  * 86400000).toISOString() },
      { type: 'dea',           name: 'DEA Registration #AB1234567',    daysLeft: 90,  expiry: new Date(Date.now() + 90  * 86400000).toISOString() },
      { type: 'malpractice',   name: 'ProAssurance Insurance Policy',  daysLeft: 180, expiry: new Date(Date.now() + 180 * 86400000).toISOString() },
      { type: 'privilege',     name: 'Clinical Surgical Privileges',   daysLeft: -3,  expiry: new Date(Date.now() - 3   * 86400000).toISOString() },
    ].filter(a =>
      rule.credentialType === 'all' || rule.credentialType === a.type
    );

    await sendCredentialAlertEmail(sampleProvider, sampleAlerts.length ? sampleAlerts : [sampleAlerts[0]], []);

    res.json({ success: true, message: `Test alert sent to ${to}` });
  } catch (err) { next(err); }
});

export default router;
