import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

console.log('Testing SMTP connection...');
console.log('SMTP Host:', process.env.SMTP_HOST);
console.log('SMTP Port:', process.env.SMTP_PORT);
console.log('SMTP User:', process.env.SMTP_USER);
console.log('SMTP Password:', process.env.SMTP_PASSWORD ? '***' + process.env.SMTP_PASSWORD.slice(-4) : 'NOT SET');

transporter.verify(function (error, success) {
  if (error) {
    console.error('SMTP Connection Error:', error);
    process.exit(1);
  } else {
    console.log('✅ SMTP Server is ready to send emails');
    
    // Send test email
    transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'Test Email from SACCO System',
      html: '<h1>Test Email</h1><p>If you receive this, email service is working!</p>',
    }, (err, info) => {
      if (err) {
        console.error('Test email failed:', err);
        process.exit(1);
      } else {
        console.log('✅ Test email sent successfully!', info.messageId);
        process.exit(0);
      }
    });
  }
});
