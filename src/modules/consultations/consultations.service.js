const { Injectable, Logger } = require('@nestjs/common');
const nodemailer = require('nodemailer');
const { config } = require('../../shared/config');
const { run } = require('../../shared/database');

class ConsultationsService {
  constructor() {
    this.logger = new Logger('ConsultationsService');
  }

  async onModuleInit() {
    return;
  }

  async create(userId, body) {
    const createdAtUtc = new Date().toISOString();

    await run(
      `
        INSERT INTO "Consultations"
          ("UserId", "Name", "Surname", "Email", "PhoneNumber", "IdNumber", "Reason", "Date", "Time", "CreatedAtUtc")
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        String(body.name || '').trim(),
        String(body.surname || '').trim(),
        String(body.email || '').trim().toLowerCase(),
        String(body.phoneNumber || '').trim(),
        body.idNumber ? String(body.idNumber).trim() : null,
        String(body.reason || '').trim(),
        String(body.date || '').trim(),
        String(body.time || '').trim(),
        createdAtUtc,
      ],
    );

    await this.sendNotification(body);

    return {
      message: 'Consultation scheduled successfully.',
      createdAtUtc,
    };
  }

  async getAll() {
    const { all } = require('../../shared/database');
    return all(
      `
        SELECT
          c."Id" AS id,
          c."UserId" AS userId,
          c."Name" AS name,
          c."Surname" AS surname,
          c."Email" AS email,
          c."PhoneNumber" AS phoneNumber,
          c."IdNumber" AS idNumber,
          c."Reason" AS reason,
          c."Date" AS date,
          c."Time" AS time,
          c."CreatedAtUtc" AS createdAtUtc
        FROM "Consultations" c
        ORDER BY c."CreatedAtUtc" DESC
      `,
    );
  }

  async sendNotification(body) {
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

    try {
      await transporter.sendMail({
        from: settings.fromEmail,
        to: settings.notifyEmail,
        replyTo: body.email,
        subject: 'New consultation request',
        text: [
          `Name: ${body.name} ${body.surname}`,
          `Email: ${body.email}`,
          `Phone: ${body.phoneNumber}`,
          `ID Number: ${body.idNumber || 'n/a'}`,
          `Date: ${body.date}`,
          `Time: ${body.time}`,
          '',
          body.reason,
        ].join('\n'),
      });
    } catch (error) {
      this.logger.warn(
        `Failed to send consultation notification: ${String(error)}`,
      );
    }
  }
}

Injectable()(ConsultationsService);

module.exports = { ConsultationsService };
