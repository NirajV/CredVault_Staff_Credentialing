import nodemailer from 'nodemailer';

// ─── Transporter ──────────────────────────────────────────────────────────────
export function createTransporter() {
  const enabled = process.env.EMAIL_ENABLED === 'true';
  if (enabled && process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host:       process.env.SMTP_HOST,
      port:       parseInt(process.env.SMTP_PORT || '587'),
      secure:     false,           // STARTTLS on 587
      requireTLS: process.env.SMTP_USE_TLS === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }
  // Dev fallback — log to console
  return {
    sendMail: async (opts) => {
      console.log('\n📧 [DEV EMAIL]');
      console.log(`   To:      ${opts.to}`);
      console.log(`   Subject: ${opts.subject}`);
      console.log('   (Set EMAIL_ENABLED=true + SMTP_* vars to send real emails)');
      return { messageId: `dev-${Date.now()}` };
    }
  };
}

const FROM = () =>
  `"${process.env.SENDER_NAME || 'NexaCred Team'}" <${process.env.SMTP_FROM || 'noreply@nexacred.com'}>`;

// ─── Alert urgency helpers ─────────────────────────────────────────────────────
function alertColor(days) {
  if (days == null) return '#6b7280';
  if (days <= 0)   return '#991b1b';
  if (days <= 15)  return '#dc2626';
  if (days <= 45)  return '#ef4444';
  if (days <= 90)  return '#f97316';
  if (days <= 180) return '#f59e0b';
  return '#10b981';
}

function urgencyLabel(days) {
  if (days == null) return 'UNKNOWN';
  if (days <= 0)   return 'EXPIRED';
  if (days <= 15)  return 'CRITICAL';
  if (days <= 30)  return 'URGENT';
  if (days <= 45)  return 'ALERT';
  if (days <= 90)  return 'CAUTION';
  if (days <= 180) return 'WATCH';
  return 'OK';
}

// ─── Base HTML wrapper ─────────────────────────────────────────────────────────
function baseTemplate(bodyHtml, previewText = '') {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>NexaCred</title>
  <style>
    body{margin:0;padding:0;background:#E8EDE8;font-family:'Segoe UI',Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;}
    table{border-collapse:collapse;}
    img{border:0;display:block;}
    a{color:#1E7A66;text-decoration:none;}
    a:hover{text-decoration:underline;}
    @media(max-width:600px){
      .wrap{width:100%!important;padding:16px!important;}
      .card{border-radius:8px!important;}
      .body{padding:24px 20px!important;}
      .banner{padding:20px 22px!important;}
    }
  </style>
</head>
<body>
  <div style="display:none;max-height:0;overflow:hidden;color:#E8EDE8;">${previewText}&nbsp;&zwnj;&nbsp;</div>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="background:#E8EDE8;padding:40px 20px;" class="wrap">
        <table width="560" cellpadding="0" cellspacing="0" class="card"
               style="background:#FBFCF8;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(17,48,42,0.13);">

          <!-- ── BANNER ── -->
          <tr>
            <td class="banner" style="background:linear-gradient(135deg,#0D2018 0%,#1B4332 100%);padding:26px 36px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:10px;vertical-align:middle;">
                    <table cellpadding="0" cellspacing="0"
                           style="width:36px;height:36px;background:rgba(255,255,255,0.13);border-radius:8px;">
                      <tr>
                        <td align="center" style="vertical-align:middle;">
                          <span style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:rgba(255,255,255,0.92);line-height:1;">&#9646;</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-family:Georgia,'Times New Roman',serif;font-size:21px;font-weight:600;color:#ffffff;letter-spacing:0.01em;">NexaCred</span>
                    <span style="display:block;font-size:10px;color:rgba(255,255,255,0.45);letter-spacing:0.12em;text-transform:uppercase;margin-top:1px;">Healthcare Credentialing</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── BODY ── -->
          ${bodyHtml}

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background:#E4E8E0;padding:18px 36px;border-top:1px solid rgba(17,48,42,0.10);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:12px;color:#5C6F67;line-height:1.5;">
                      — The NexaCred Team<br>
                      <span style="color:#8F9E98;font-size:11px;">Automated message · Do not reply to this email</span>
                    </p>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <p style="margin:0;font-size:11px;color:#8F9E98;">© ${year} NexaCred</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Credential box (monospace email+password block) ──────────────────────────
function credentialBox(rows) {
  const lines = rows.map(([label, value, isLink]) => `
    <tr>
      <td style="padding:3px 0;">
        <span style="font-family:'Courier New',Courier,monospace;font-size:13px;color:#8F9E98;">${label.padEnd(20, ' ')}</span>
        ${isLink
          ? `<a href="mailto:${value}" style="font-family:'Courier New',Courier,monospace;font-size:13px;color:#1E7A66;font-weight:600;">${value}</a>`
          : `<strong style="font-family:'Courier New',Courier,monospace;font-size:13px;color:#11302A;letter-spacing:0.03em;">${value}</strong>`
        }
      </td>
    </tr>`).join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#E8EDE8;border:1px solid rgba(17,48,42,0.14);border-radius:8px;margin:0 0 24px;">
      <tr><td style="padding:18px 20px;">
        <table cellpadding="0" cellspacing="0">${lines}</table>
      </td></tr>
    </table>`;
}

// ─── CTA button ───────────────────────────────────────────────────────────────
function ctaButton(label, url) {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:#1E7A66;border-radius:8px;">
          <a href="${url}"
             style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.01em;">
            ${label} &rarr;
          </a>
        </td>
      </tr>
    </table>`;
}

// ─── Alert notice box ─────────────────────────────────────────────────────────
function noticeBox(text, level = 'amber') {
  const styles = {
    amber: { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E' },
    red:   { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B' },
  };
  const s = styles[level] || styles.amber;
  return `
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:${s.bg};border:1px solid ${s.border};border-radius:8px;">
      <tr><td style="padding:14px 16px;">
        <p style="margin:0;font-size:13px;color:${s.text};line-height:1.5;">${text}</p>
      </td></tr>
    </table>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. WELCOME — New account created
// ═══════════════════════════════════════════════════════════════════════════════
export async function sendWelcomeEmail(user, temporaryPassword) {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';

  const body = `
    <tr>
      <td class="body" style="padding:36px 36px 28px;">
        <h1 style="margin:0 0 6px;font-size:24px;font-weight:700;color:#11302A;line-height:1.2;">Welcome to NexaCred</h1>
        <p style="margin:0 0 20px;font-size:14px;color:#5C6F67;">Hello ${user.firstName} ${user.lastName},</p>
        <p style="margin:0 0 20px;font-size:14px;color:#405F55;line-height:1.65;">
          A System Administrator has created your <strong>NexaCred</strong> credentialing account.
          Use the credentials below to sign in for the first time.
        </p>

        ${credentialBox([
          ['Email:', user.email, true],
          ['Temporary password:', temporaryPassword, false],
        ])}

        <p style="margin:0 0 8px;font-size:14px;color:#405F55;">Sign in here:</p>
        ${ctaButton('Sign In to NexaCred', `${appUrl}/login`)}

        <p style="margin:0 0 20px;font-size:13px;color:#5C6F67;line-height:1.65;">
          For your security, please <strong style="color:#11302A;">sign in with this password and change it immediately</strong>
          from <em>Profile &rarr; Change Password</em>. You will be guided through this step automatically on first sign-in.
        </p>

        ${noticeBox('<strong>Didn\'t expect this email?</strong> You can safely ignore it — the account will only become active if you sign in. If you suspect misuse, please contact your administrator.')}
      </td>
    </tr>`;

  const html = baseTemplate(body, `Welcome to NexaCred — your credentialing account is ready.`);

  await createTransporter().sendMail({
    from:    FROM(),
    to:      user.email,
    subject: `Welcome to NexaCred — Your Account Is Ready`,
    text: [
      `Welcome to NexaCred, ${user.firstName} ${user.lastName}!`,
      '',
      'Your credentialing account has been created by a System Administrator.',
      '',
      `Email:              ${user.email}`,
      `Temporary password: ${temporaryPassword}`,
      '',
      `Sign in at: ${appUrl}/login`,
      '',
      'Please change your password immediately after signing in.',
      '',
      "Didn't expect this? Contact your administrator.",
      '',
      '— The NexaCred Team'
    ].join('\n'),
    html
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. PASSWORD RESET
// ═══════════════════════════════════════════════════════════════════════════════
export async function sendPasswordResetEmail(user, temporaryPassword) {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';

  const body = `
    <tr>
      <td class="body" style="padding:36px 36px 28px;">
        <h1 style="margin:0 0 6px;font-size:24px;font-weight:700;color:#11302A;line-height:1.2;">Password Reset</h1>
        <p style="margin:0 0 20px;font-size:14px;color:#5C6F67;">Hello ${user.firstName},</p>
        <p style="margin:0 0 20px;font-size:14px;color:#405F55;line-height:1.65;">
          A password reset was requested for your <strong>NexaCred</strong> account.
          Use the temporary password below to sign in, then update it immediately from your profile.
        </p>

        ${credentialBox([
          ['Email:', user.email, true],
          ['New password:', temporaryPassword, false],
        ])}

        ${ctaButton('Sign In Now', `${appUrl}/login`)}

        <p style="margin:0 0 20px;font-size:13px;color:#5C6F67;line-height:1.65;">
          This temporary password is valid for <strong>24 hours</strong>. Please sign in and update
          your password from <em>Profile &rarr; Change Password</em>.
        </p>

        ${noticeBox('<strong>Didn\'t request this?</strong> If you did not request a password reset, please contact your administrator immediately — your account may be at risk.', 'red')}
      </td>
    </tr>`;

  const html = baseTemplate(body, 'Your NexaCred password has been reset.');

  await createTransporter().sendMail({
    from:    FROM(),
    to:      user.email,
    subject: `NexaCred — Your Password Has Been Reset`,
    text: [
      `Hello ${user.firstName},`,
      '',
      'A password reset was requested for your NexaCred account.',
      '',
      `Email:          ${user.email}`,
      `New password:   ${temporaryPassword}`,
      '',
      `Sign in at: ${appUrl}/login`,
      '',
      'Please update your password immediately after signing in.',
      '',
      "Didn't request this? Contact your administrator immediately.",
      '',
      '— The NexaCred Team'
    ].join('\n'),
    html
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. CREDENTIAL ALERT — per provider, multiple credentials
//    alerts = [{ type, name, daysLeft, expiry }]
// ═══════════════════════════════════════════════════════════════════════════════
export async function sendCredentialAlertEmail(provider, alerts, extraRecipients = []) {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';

  const TYPE_LABELS = {
    license:       'License',
    certification: 'Certification',
    dea:           'DEA Registration',
    malpractice:   'Malpractice Insurance',
    privilege:     'Privilege',
    task:          'Task',
  };

  // Sort most urgent first
  const sorted = [...alerts].sort((a, b) => (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999));
  const expiredCount  = sorted.filter(a => a.daysLeft != null && a.daysLeft <= 0).length;
  const criticalCount = sorted.filter(a => a.daysLeft != null && a.daysLeft > 0 && a.daysLeft <= 15).length;

  // Build per-credential alert cards
  const alertCards = sorted.map(alert => {
    const color   = alertColor(alert.daysLeft);
    const urgency = urgencyLabel(alert.daysLeft);
    const label   = TYPE_LABELS[alert.type] || alert.type;
    const expDate = alert.expiry
      ? new Date(alert.expiry).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'N/A';
    const daysStr = alert.daysLeft == null ? 'No expiry'
      : alert.daysLeft <= 0
        ? `Expired ${Math.abs(alert.daysLeft)} day${Math.abs(alert.daysLeft) !== 1 ? 's' : ''} ago`
        : `${alert.daysLeft} day${alert.daysLeft !== 1 ? 's' : ''} remaining`;

    return `
      <tr>
        <td style="padding-bottom:10px;">
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="border:1px solid ${color}40;border-left:5px solid ${color};border-radius:6px;background:${color}0D;">
            <tr>
              <td style="padding:14px 16px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:top;">
                      <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.08em;">
                        ${urgency} &nbsp;·&nbsp; ${label}
                      </p>
                      <p style="margin:0;font-size:14px;font-weight:600;color:#11302A;">${alert.name}</p>
                    </td>
                    <td align="right" style="vertical-align:top;padding-left:16px;white-space:nowrap;">
                      <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:${color};">${daysStr}</p>
                      <p style="margin:0;font-size:11px;color:#8F9E98;">Expires ${expDate}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }).join('');

  const summaryText = expiredCount > 0
    ? `${expiredCount} credential${expiredCount !== 1 ? 's have' : ' has'} expired — immediate action required`
    : criticalCount > 0
    ? `${criticalCount} credential${criticalCount !== 1 ? 's are' : ' is'} expiring within 15 days`
    : `${sorted.length} credential${sorted.length !== 1 ? 's are' : ' is'} expiring — action needed`;

  const summaryLevel = expiredCount > 0 ? 'red' : 'amber';

  const body = `
    <tr>
      <td class="body" style="padding:36px 36px 28px;">
        <h1 style="margin:0 0 6px;font-size:24px;font-weight:700;color:#11302A;line-height:1.2;">
          Credential Expiration Alert
        </h1>
        <p style="margin:0 0 4px;font-size:14px;color:#5C6F67;">
          Hello Dr. ${provider.firstName} ${provider.lastName},
        </p>
        <p style="margin:0 0 24px;font-size:12px;color:#8F9E98;">
          ${[provider.specialty, provider.npi ? `NPI: ${provider.npi}` : null].filter(Boolean).join(' &nbsp;·&nbsp; ')}
        </p>

        ${noticeBox(`<strong>&#9888;&nbsp; ${summaryText}</strong>`, summaryLevel)}
        <div style="height:20px;"></div>

        <p style="margin:0 0 14px;font-size:13px;font-weight:600;color:#405F55;text-transform:uppercase;letter-spacing:0.06em;">
          Credentials requiring attention
        </p>

        <table width="100%" cellpadding="0" cellspacing="0">
          ${alertCards}
        </table>

        ${ctaButton('Log In to Renew Credentials', appUrl)}

        <p style="margin:0;font-size:12px;color:#8F9E98;line-height:1.65;">
          Please verify and renew these credentials with the issuing authority and update NexaCred
          to maintain your compliance record. Contact your credentialing coordinator if you need assistance.
        </p>
      </td>
    </tr>`;

  const subject = expiredCount > 0
    ? `[NexaCred] ⚠ EXPIRED — ${expiredCount} Credential${expiredCount !== 1 ? 's' : ''} · ${provider.firstName} ${provider.lastName}`
    : `[NexaCred] Credential Alert — ${sorted.length} Item${sorted.length !== 1 ? 's' : ''} Expiring · ${provider.firstName} ${provider.lastName}`;

  const html = baseTemplate(body, summaryText);

  const toAddrs = [provider.email, ...extraRecipients].filter(Boolean).join(', ');

  await createTransporter().sendMail({
    from:    FROM(),
    to:      toAddrs,
    subject,
    text: [
      `Credential Expiration Alert — ${provider.firstName} ${provider.lastName}`,
      summaryText,
      '',
      ...sorted.map(a =>
        `  • ${TYPE_LABELS[a.type] || a.type}: ${a.name} [${urgencyLabel(a.daysLeft)}] — ${
          a.daysLeft <= 0 ? `Expired ${Math.abs(a.daysLeft)}d ago` : `${a.daysLeft}d remaining`
        }`
      ),
      '',
      `Log in: ${appUrl}`,
      '',
      '— The NexaCred Team'
    ].join('\n'),
    html
  });
}
