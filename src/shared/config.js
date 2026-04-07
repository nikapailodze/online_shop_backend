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
  port:
    parsePortFromAspNetCoreUrls(process.env.ASPNETCORE_URLS) ||
    Number(process.env.PORT || 5001),
  databasePath:
    process.env.DB_SQLITE_PATH || path.join(process.cwd(), 'shop.db'),
  jwtSecret:
    process.env.JWT_SECRET_KEY ||
    process.env.JWT_SECRET ||
    'a7b8c973d2f944368f47f965975de97cf2e00c6e043d4f07a8e0c7219d25cf4d',
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

module.exports = { config };
