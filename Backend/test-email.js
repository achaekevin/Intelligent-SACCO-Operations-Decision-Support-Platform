/**
 * Email Configuration Test Script
 * 
 * This script tests if your SMTP email configuration is working correctly.
 * Run this to verify emails can be sent before testing member registration.
 * 
 * Usage: node test-email.js
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

console.log('🔍 Email Configuration Test\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Display configuration
console.log('📧 SMTP Configuration:');
console.log(`   Host: ${process.env.SMTP_HOST}`);
console.log(`   Port: ${process.env.SMTP_PORT}`);
console.log(`   Secure: ${process.env.SMTP_SECURE}`);
console.log(`   User: ${process.env.SMTP_USER}`);
console.log(`   Password: ${process.env.SMTP_PASSWORD ? '✅ Set' : '❌ Not Set'}`);
console.log(`   From: ${process.env.EMAIL_FROM}`);
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Test email details
const testEmail = {
  from: process.env.EMAIL_FROM,
  to: process.env.SMTP_USER, // Send to yourself
  subject: 'Imara SACCO - Email Configuration Test',
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb">
      <div style="background:#fff;padding:30px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
        <div style="text-align:center;margin-bottom:20px">
          <h1 style="color:#0B4F4A;margin:0">✅ Email Test Successful!</h1>
        </div>
        <p style="font-size:16px;color:#374151">
          Congratulations! Your Imara SACCO email system is working correctly.
        </p>
        <div style="background:#f0fdfa;padding:20px;border-radius:6px;margin:20px 0;border-left:4px solid #0B4F4A">
          <p style="margin:0;font-size:14px;color:#374151"><strong>Test Details:</strong></p>
          <p style="margin:8px 0 0 0;font-size:14px;color:#374151">Sent at: ${new Date().toLocaleString('en-KE')}</p>
          <p style="margin:8px 0 0 0;font-size:14px;color:#374151">From: ${process.env.EMAIL_FROM}</p>
          <p style="margin:8px 0 0 0;font-size:14px;color:#374151">SMTP Server: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}</p>
        </div>
        <p style="font-size:16px;color:#374151">
          Your system is ready to send member registration emails, login credentials, and notifications.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0">
        <p style="font-size:14px;color:#6b7280;text-align:center;margin:0">
          Imara SACCO Management System<br>
          Email Configuration Test
        </p>
      </div>
    </div>
  `,
};

console.log('📤 Sending test email...\n');

// Send test email
transporter.sendMail(testEmail, (error, info) => {
  if (error) {
    console.log('❌ Email sending failed!\n');
    console.log('Error details:');
    console.log(`   ${error.message}`);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your .env file has correct SMTP credentials');
    console.log('   2. Verify SMTP_PASSWORD is a Gmail App Password (not regular password)');
    console.log('   3. Make sure "Less secure app access" is enabled in Gmail');
    console.log('   4. Check if Gmail is blocking the login attempt');
    console.log('   5. Verify internet connection');
    console.log('\n📖 Gmail App Password Guide:');
    console.log('   1. Go to: https://myaccount.google.com/apppasswords');
    console.log('   2. Create a new app password');
    console.log('   3. Copy the password to .env file (SMTP_PASSWORD)');
    process.exit(1);
  } else {
    console.log('✅ Email sent successfully!\n');
    console.log('📨 Message Details:');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    console.log(`   Sent to: ${testEmail.to}`);
    console.log('\n🎉 Your email configuration is working perfectly!');
    console.log('\n📧 Check your inbox:');
    console.log(`   ${testEmail.to}`);
    console.log('\n✨ Member registration emails will now be sent automatically.');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
  }
});
