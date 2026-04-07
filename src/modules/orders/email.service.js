const { Injectable, Logger } = require('@nestjs/common');
const nodemailer = require('nodemailer');
const { config } = require('../../shared/config');

class EmailService {
  constructor() {
    this.logger = new Logger('EmailService');
  }

  async sendPurchaseNotification(email, items, totalPrice) {
    const settings = config.emailSettings;
    if (!settings.smtpHost || !settings.notifyEmail) {
      return;
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.enableSsl,
      auth:
        settings.userName && settings.password
          ? { user: settings.userName, pass: settings.password }
          : undefined,
    });

    const text = [
      `Customer: ${email}`,
      `Total: ${Number(totalPrice).toFixed(2)} GEL`,
      '',
      ...items.map(
        (item) =>
          `${item.productName} x${item.quantity} @ ${Number(item.unitPrice).toFixed(2)} GEL | Color: ${item.color || 'n/a'} | Size: ${item.size || 'n/a'}`,
      ),
    ].join('\n');

    try {
      await transporter.sendMail({
        from: settings.fromEmail,
        to: settings.notifyEmail,
        replyTo: email,
        subject: 'New online shop order',
        text,
      });
    } catch (error) {
      this.logger.warn(`Failed to send purchase notification: ${String(error)}`);
    }
  }
}

Injectable()(EmailService);

module.exports = { EmailService };
