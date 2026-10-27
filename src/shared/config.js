const path = require('path');

function parsePortFromAspNetCoreUrls(value) {
  if (!value) return null;

  try {
    const parsed = new URL(value);
    return Number(parsed.port) || null;
  } catch {
    return null;
  }
}

const config = {
  host: process.env.HOST || '0.0.0.0',
  port:
    parsePortFromAspNetCoreUrls(process.env.ASPNETCORE_URLS) ||
    Number(process.env.PORT || 5001),
  databasePath:
    process.env.DB_SQLITE_PATH || path.join(process.cwd(), 'shop.db'),
  // No fallback on purpose: a secret committed to the repo lets anyone forge
  // admin tokens. Set JWT_SECRET_KEY in .env.local and in Render's dashboard.
  jwtSecret: process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || '',
  jwtIssuer: process.env.JWT_ISSUER || 'OnlineShopBackend',
  jwtAudience: process.env.JWT_AUDIENCE || 'OnlineShopFrontend',
  jwtExpiresInMinutes: Number(process.env.JWT_EXPIRES_IN_MINUTES || 60),
  adminEmails: (
    process.env.ADMIN_EMAILS || 'nikapaila01@gmail.com'
  )
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
  emailSettings: {
    smtpHost: process.env.EmailSettings__SmtpHost || process.env.SMTP_HOST || '',
    smtpPort: Number(
      process.env.EmailSettings__SmtpPort || process.env.SMTP_PORT || 587,
    ),
    enableSsl:
      (process.env.EmailSettings__EnableSsl ||
        process.env.SMTP_ENABLE_SSL ||
        'true') === 'true',
    userName:
      process.env.EmailSettings__UserName || process.env.SMTP_USERNAME || '',
    password:
      process.env.EmailSettings__Password || process.env.SMTP_PASSWORD || '',
    fromEmail:
      process.env.EmailSettings__FromEmail ||
      process.env.SMTP_FROM_EMAIL ||
      'no-reply@yourshop.com',
    notifyEmail:
      process.env.EmailSettings__NotifyEmail ||
      process.env.SMTP_NOTIFY_EMAIL ||
      '',
  },
};

function assertRequiredConfig() {
  if (!config.jwtSecret || config.jwtSecret.length < 32) {
    throw new Error(
      'JWT_SECRET_KEY is missing or too short (need at least 32 characters). ' +
        'Set it in .env.local for local runs and in the Render dashboard for production.',
    );
  }
}

module.exports = { config, assertRequiredConfig };
