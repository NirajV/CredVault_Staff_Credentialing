import express from 'express';
import nodemailer from 'nodemailer';
import { getDatabase } from '../config/database.js';

const router = express.Router();

// Simple dev transporter — logs email to console; swap with real SMTP in production
const createTransporter = () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }
  // Dev fallback: print to console instead of sending
  return {
    sendMail: async (opts) => {
      console.log('\n📧 [DEV EMAIL]');
      console.log(`   To:      ${opts.to}`);
      console.log(`   Subject: ${opts.subject}`);
      console.log(`   Body:\n${opts.text}`);
      return { messageId: `dev-${Date.now()}` };
    }
  };
};

// ---------- CRUD ----------

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
      thresholds:     req.body.thresholds     || [7, 30, 60, 90],
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

// ---------- EMAIL TRIGGER ----------

router.post('/send-alerts', async (req, res, next) => {
  try {
    const db = getDatabase();
    const { AlertRule, Provider, License, Certification, DEA, Malpractice, Privilege } = db.models;

    const rules = await AlertRule.findAll({ where: { enabled: true } });
    if (!rules.length) {
      return res.json({ success: true, message: 'No active alert rules', sent: 0 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDays = Math.max(...rules.flatMap(r => r.thresholds));
    const cutoff  = new Date(today.getTime() + maxDays * 86400000);

    const providers = await Provider.findAll({ where: { deletedAt: null } });
    const providerMap = Object.fromEntries(providers.map(p => {
      const j = p.toJSON();
      return [j.id, j];
    }));

    const credentialSets = await Promise.all([
      License.findAll(),
      Certification.findAll(),
      DEA.findAll(),
      Malpractice.findAll(),
      Privilege.findAll()
    ]);

    const typeNames = ['license', 'certification', 'dea', 'malpractice', 'privilege'];
    const nameFields = ['licenseNumber', 'certName', 'deaNumber', 'carrier', 'privilegeType'];

    // Build expiring items list
    const expiringItems = [];
    credentialSets.forEach((items, idx) => {
      const type      = typeNames[idx];
      const nameField = nameFields[idx];
      for (const raw of items) {
        const item = raw.toJSON();
        if (!item.expiryDate) continue;
        const expiry = new Date(item.expiryDate);
        if (expiry > cutoff || expiry < today) continue; // skip not-yet-relevant or already expired
        const daysLeft = Math.ceil((expiry - today) / 86400000);
        const provider = providerMap[item.providerId];
        if (!provider) continue;
        expiringItems.push({ type, name: item[nameField] || type, daysLeft, expiry: item.expiryDate, provider });
      }
    });

    if (!expiringItems.length) {
      return res.json({ success: true, message: 'No credentials expiring within alert window', sent: 0 });
    }

    const transporter = createTransporter();
    const fromAddr = process.env.SMTP_FROM || 'noreply@credvault.com';
    let emailsSent = 0;

    for (const rule of rules) {
      const thresholds = rule.thresholds;

      // Filter items matching this rule's credential type and thresholds
      const matching = expiringItems.filter(item => {
        const typeMatch = rule.credentialType === 'all' || item.type === rule.credentialType;
        const dayMatch  = thresholds.some(d => item.daysLeft <= d && item.daysLeft > (
          // next lower threshold or 0
          [...thresholds].sort((a,b) => a-b).find(t => t < d) ?? 0
        ));
        return typeMatch && dayMatch;
      });

      if (!matching.length) continue;

      // Group by provider → one email per provider per rule
      const byProvider = {};
      for (const item of matching) {
        const key = item.provider.id;
        if (!byProvider[key]) byProvider[key] = { provider: item.provider, items: [] };
        byProvider[key].items.push(item);
      }

      for (const { provider, items } of Object.values(byProvider)) {
        const providerEmail = provider.email;
        const recipients = [
          providerEmail,
          rule.notifyEmail
        ].filter(Boolean).join(', ');

        if (!recipients) continue;

        const itemLines = items.map(i =>
          `  • ${i.type.charAt(0).toUpperCase() + i.type.slice(1)}: ${i.name} — expires ${i.expiry} (${i.daysLeft} days left)`
        ).join('\n');

        const subject = `[CredVault] Credential Expiration Alert — ${provider.firstName} ${provider.lastName}`;
        const text = [
          `Dear ${provider.firstName} ${provider.lastName},`,
          '',
          'The following credentials are expiring soon and require your attention:',
          '',
          itemLines,
          '',
          'Please log in to CredVault to update or renew these credentials before they expire.',
          '',
          'This is an automated message from CredVault Credentialing Manager.',
        ].join('\n');

        await transporter.sendMail({ from: fromAddr, to: recipients, subject, text });
        emailsSent++;
      }
    }

    res.json({ success: true, message: `Alert emails processed`, sent: emailsSent, itemsChecked: expiringItems.length });
  } catch (err) { next(err); }
});

// Test a single rule immediately
router.post('/test/:id', async (req, res, next) => {
  try {
    const { AlertRule } = getDatabase().models;
    const rule = await AlertRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json({ success: false, error: { message: 'Rule not found' } });

    const to = rule.notifyEmail || req.body.testEmail;
    if (!to) return res.status(400).json({ success: false, error: { message: 'No email address configured for this rule' } });

    const transporter = createTransporter();
    const fromAddr = process.env.SMTP_FROM || 'noreply@credvault.com';

    await transporter.sendMail({
      from: fromAddr,
      to,
      subject: '[CredVault] Test Alert — Rule Working Correctly',
      text: [
        'This is a test alert from CredVault.',
        '',
        `Rule: ${rule.credentialType === 'all' ? 'All Credentials' : rule.credentialType}`,
        `Thresholds: ${rule.thresholds.join(', ')} days before expiry`,
        `Notify Email: ${rule.notifyEmail || '(none)'}`,
        '',
        'If you received this, your alert rule is configured correctly.'
      ].join('\n')
    });

    res.json({ success: true, message: `Test alert sent to ${to}` });
  } catch (err) { next(err); }
});

export default router;
