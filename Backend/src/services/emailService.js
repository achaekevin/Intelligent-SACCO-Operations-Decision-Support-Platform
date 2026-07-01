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

  async sendMemberRegistrationEmail(member, organizationName) {
    return this.send({
      to: member.email,
      subject: `Welcome to ${organizationName} - Registration Successful`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb">
          <div style="background:#fff;padding:30px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
            <div style="text-align:center;margin-bottom:20px">
              <h1 style="color:#0B4F4A;margin:0">Welcome to ${organizationName}!</h1>
            </div>
            <p style="font-size:16px;color:#374151">Dear ${member.firstName} ${member.lastName},</p>
            <p style="font-size:16px;color:#374151;line-height:1.6">
              Congratulations! You have been successfully registered as a member of <strong>${organizationName}</strong>.
            </p>
            <div style="background:#f0fdfa;padding:20px;border-radius:6px;margin:20px 0;border-left:4px solid #0B4F4A">
              <p style="margin:0;font-size:14px;color:#374151"><strong>Member Number:</strong> ${member.memberNumber}</p>
              <p style="margin:8px 0 0 0;font-size:14px;color:#374151"><strong>Registration Date:</strong> ${new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <p style="font-size:16px;color:#374151;line-height:1.6">
              Your login credentials will be sent to you in a separate email shortly.
            </p>
            <p style="font-size:16px;color:#374151;line-height:1.6">
              We look forward to serving you!
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0">
            <p style="font-size:14px;color:#6b7280;text-align:center;margin:0">
              ${organizationName}<br>
              Empowering Community Finance
            </p>
          </div>
        </div>
      `,
    });
  }

  async sendMemberLoginCredentials(member, loginEmail, tempPassword, organizationName) {
    return this.send({
      to: member.email,
      subject: `${organizationName} - Your Login Credentials`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb">
          <div style="background:#fff;padding:30px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
            <div style="text-align:center;margin-bottom:20px">
              <h1 style="color:#0B4F4A;margin:0">Your Login Credentials</h1>
            </div>
            <p style="font-size:16px;color:#374151">Dear ${member.firstName} ${member.lastName},</p>
            <p style="font-size:16px;color:#374151;line-height:1.6">
              Below are your login credentials to access the ${organizationName} member portal:
            </p>
            <div style="background:#fef3c7;padding:20px;border-radius:6px;margin:20px 0;border-left:4px solid #D9A441">
              <p style="margin:0;font-size:16px;color:#374151"><strong>Login URL:</strong></p>
              <p style="margin:8px 0;font-size:16px">
                <a href="${process.env.FRONTEND_URL}/login" style="color:#0B4F4A;text-decoration:none;font-weight:600">${process.env.FRONTEND_URL}/login</a>
              </p>
              <p style="margin:16px 0 0 0;font-size:16px;color:#374151"><strong>Username (Email):</strong></p>
              <p style="margin:4px 0;font-size:16px;color:#374151;font-family:monospace;background:#fff;padding:8px;border-radius:4px">${loginEmail}</p>
              <p style="margin:16px 0 0 0;font-size:16px;color:#374151"><strong>Temporary Password:</strong></p>
              <p style="margin:4px 0;font-size:18px;color:#dc2626;font-family:monospace;background:#fff;padding:8px;border-radius:4px;font-weight:bold">${tempPassword}</p>
            </div>
            <div style="background:#fef2f2;padding:15px;border-radius:6px;margin:20px 0;border-left:4px solid #dc2626">
              <p style="margin:0;font-size:14px;color:#991b1b;font-weight:600">🔒 Important Security Notice:</p>
              <p style="margin:8px 0 0 0;font-size:14px;color:#991b1b">
                • You will be required to change this password on your first login<br>
                • Do not share your password with anyone<br>
                • Keep this email secure and delete it after changing your password
              </p>
            </div>
            <div style="text-align:center;margin:30px 0">
              <a href="${process.env.FRONTEND_URL}/login" style="display:inline-block;padding:14px 32px;background:#0B4F4A;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px">
                Login to Portal
              </a>
            </div>
            <p style="font-size:14px;color:#6b7280;line-height:1.6">
              If you have any questions or need assistance, please contact our support team.
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0">
            <p style="font-size:14px;color:#6b7280;text-align:center;margin:0">
              ${organizationName}<br>
              Empowering Community Finance
            </p>
          </div>
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
