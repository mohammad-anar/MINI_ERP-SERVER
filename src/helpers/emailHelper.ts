import nodemailer from 'nodemailer';
import config from '../config';
import { errorLogger, logger } from '../shared/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ISendEmail {
  to: string;
  subject: string;
  html: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Transporter (singleton)
// ─────────────────────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: Number(config.email.port),
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
  tls: {
    // Allow self-signed certs in development
    rejectUnauthorized: config.node_env === 'production',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates an email address format without any external library.
 */
const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Sends an email via the configured SMTP transporter.
 * Silently logs failures — does not throw — so email errors never crash
 * the main request flow.
 */
const sendEmail = async (values: ISendEmail): Promise<void> => {
  if (!isValidEmail(values.to)) {
    errorLogger.error(`[Email] Invalid recipient address: "${values.to}"`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Mongoose Template" <${config.email.from}>`,
      to: values.to,
      subject: values.subject,
      html: values.html,
    });

    logger.info(`[Email] ✅ Sent to ${values.to} — MessageId: ${info.messageId}`);
  } catch (error) {
    errorLogger.error(`[Email] ❌ Failed to send to ${values.to}:`, error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const emailHelper = {
  sendEmail,
  isValidEmail,
};
