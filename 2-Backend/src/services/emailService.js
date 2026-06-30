import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async send({ to, subject, html, text }) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
        text,
      });
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (err) {
      logger.error(`Email send failed to ${to}:`, err.message);
      throw err;
    }
  }

  async sendVerificationEmail(user, token) {
    const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    return this.send({
      to: user.email,
      subject: `Verify your ${process.env.APP_NAME} account`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2>Welcome to ${process.env.APP_NAME}</h2>
          <p>Hi ${user.firstName},</p>
          <p>Please verify your email address by clicking the button below.</p>
          <a href="${url}" style="display:inline-block;padding:12px 24px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0">
            Verify Email
          </a>
          <p>This link expires in 48 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(user, token) {
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    return this.send({
      to: user.email,
      subject: `Reset your ${process.env.APP_NAME} password`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2>Password Reset Request</h2>
          <p>Hi ${user.firstName},</p>
          <p>You requested a password reset. Click the button below to set a new password.</p>
          <a href="${url}" style="display:inline-block;padding:12px 24px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0">
            Reset Password
          </a>
          <p>This link expires in 2 hours. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });
  }

  async sendWelcomeEmail(user, tempPassword = null) {
    return this.send({
      to: user.email,
      subject: `Welcome to ${process.env.APP_NAME}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2>Welcome aboard, ${user.firstName}!</h2>
          <p>Your account has been created on ${process.env.APP_NAME}.</p>
          ${tempPassword ? `<p><strong>Temporary Password:</strong> ${tempPassword}<br>Please change it upon first login.</p>` : ''}
          <p>Login at: <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a></p>
        </div>
      `,
    });
  }

  async sendTransactionNotification(member, transaction) {
    if (!member.email) return;
    return this.send({
      to: member.email,
      subject: `Transaction Alert — ${process.env.APP_NAME}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2>Transaction Notification</h2>
          <p>Dear ${member.firstName} ${member.lastName},</p>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Reference</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${transaction.reference}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Type</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${transaction.type}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Amount</strong></td><td style="padding:8px;border:1px solid #e5e7eb">KES ${parseFloat(transaction.amount).toLocaleString()}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Balance</strong></td><td style="padding:8px;border:1px solid #e5e7eb">KES ${parseFloat(transaction.balanceAfter).toLocaleString()}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Date</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${new Date(transaction.createdAt).toLocaleString('en-KE')}</td></tr>
          </table>
        </div>
      `,
    });
  }
}

export default new EmailService();
