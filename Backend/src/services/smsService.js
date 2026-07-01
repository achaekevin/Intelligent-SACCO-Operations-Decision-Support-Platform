import axios from 'axios';
import logger from '../utils/logger.js';

/**
 * SMS Service using Africa's Talking API
 * Alternative providers: Twilio, Infobip, BulkSMS
 */
class SMSService {
  constructor() {
    this.apiKey = process.env.SMS_API_KEY || '';
    this.username = process.env.SMS_USERNAME || 'sandbox';
    this.senderId = process.env.SMS_SENDER_ID || 'AMANA';
    this.enabled = process.env.SMS_ENABLED === 'true';
    this.provider = process.env.SMS_PROVIDER || 'africas_talking'; // africas_talking, twilio, infobip
    
    // Africa's Talking configuration
    this.africasTalkingUrl = process.env.SMS_API_URL || 'https://api.africastalking.com/version1/messaging';
    
    // Twilio configuration (alternative)
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';
  }

  /**
   * Send SMS using configured provider
   * @param {Object} options
   * @param {string} options.to - Phone number (e.g., +254712345678)
   * @param {string} options.message - SMS message content
   */
  async send({ to, message }) {
    if (!this.enabled) {
      logger.warn('SMS service is disabled. Set SMS_ENABLED=true in .env');
      return { success: false, message: 'SMS service disabled' };
    }

    // Validate phone number format
    const cleanPhone = this._formatPhoneNumber(to);
    if (!cleanPhone) {
      throw new Error('Invalid phone number format');
    }

    // Truncate message if too long (most providers limit to 160 characters)
    const truncatedMessage = message.length > 160 ? `${message.substring(0, 157)}...` : message;

    try {
      let result;
      
      switch (this.provider) {
        case 'africas_talking':
          result = await this._sendViaAfricasTalking(cleanPhone, truncatedMessage);
          break;
        case 'twilio':
          result = await this._sendViaTwilio(cleanPhone, truncatedMessage);
          break;
        default:
          logger.warn(`Unknown SMS provider: ${this.provider}, using mock mode`);
          result = this._sendMock(cleanPhone, truncatedMessage);
      }

      logger.info(`SMS sent to ${cleanPhone}: ${result.messageId || 'mock'}`);
      return result;
    } catch (error) {
      logger.error(`SMS send failed to ${cleanPhone}:`, error.message);
      throw error;
    }
  }

  /**
   * Send SMS via Africa's Talking
   */
  async _sendViaAfricasTalking(to, message) {
    try {
      const response = await axios.post(
        this.africasTalkingUrl,
        new URLSearchParams({
          username: this.username,
          to,
          message,
          from: this.senderId,
        }).toString(),
        {
          headers: {
            'apiKey': this.apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
        }
      );

      if (response.data.SMSMessageData.Recipients.length > 0) {
        const recipient = response.data.SMSMessageData.Recipients[0];
        return {
          success: recipient.status === 'Success',
          messageId: recipient.messageId,
          status: recipient.status,
          cost: recipient.cost,
        };
      }

      throw new Error('No recipients in response');
    } catch (error) {
      throw new Error(`Africa's Talking API error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Send SMS via Twilio (alternative provider)
   */
  async _sendViaTwilio(to, message) {
    try {
      const auth = Buffer.from(`${this.twilioAccountSid}:${this.twilioAuthToken}`).toString('base64');
      
      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`,
        new URLSearchParams({
          To: to,
          From: this.twilioPhoneNumber,
          Body: message,
        }).toString(),
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        success: true,
        messageId: response.data.sid,
        status: response.data.status,
        cost: response.data.price,
      };
    } catch (error) {
      throw new Error(`Twilio API error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Mock SMS sending for development/testing
   */
  _sendMock(to, message) {
    logger.info(`[MOCK SMS] To: ${to}, Message: ${message}`);
    return {
      success: true,
      messageId: `mock-${Date.now()}`,
      status: 'Success',
      cost: 'KES 0.00',
      mock: true,
    };
  }

  /**
   * Send bulk SMS to multiple recipients
   */
  async sendBulk(recipients) {
    const promises = recipients.map((recipient) =>
      this.send({ to: recipient.phone, message: recipient.message })
    );

    const results = await Promise.allSettled(promises);
    
    return {
      total: results.length,
      successful: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
      results,
    };
  }

  /**
   * Format phone number to international format
   * Supports Kenya format (07XX, 01XX, +254, 254)
   */
  _formatPhoneNumber(phone) {
    if (!phone) return null;

    // Remove all non-digit characters except +
    let clean = phone.replace(/[^\d+]/g, '');

    // Kenya phone number formats
    if (clean.startsWith('07') || clean.startsWith('01')) {
      // 07XXXXXXXX or 01XXXXXXXX -> +2547XXXXXXXX or +2541XXXXXXXX
      clean = `+254${clean.substring(1)}`;
    } else if (clean.startsWith('254')) {
      // 254XXXXXXXXX -> +254XXXXXXXXX
      clean = `+${clean}`;
    } else if (!clean.startsWith('+')) {
      // Assume Kenya country code
      clean = `+254${clean}`;
    }

    // Validate format: +254XXXXXXXXX (12 characters)
    if (clean.match(/^\+254\d{9}$/)) {
      return clean;
    }

    // Generic international format validation
    if (clean.match(/^\+\d{10,15}$/)) {
      return clean;
    }

    return null;
  }

  /**
   * Check SMS balance (provider-specific)
   */
  async getBalance() {
    if (!this.enabled) {
      return { balance: 0, currency: 'KES', error: 'SMS service disabled' };
    }

    try {
      if (this.provider === 'africas_talking') {
        const response = await axios.get(
          `https://api.africastalking.com/version1/user?username=${this.username}`,
          {
            headers: {
              'apiKey': this.apiKey,
              'Accept': 'application/json',
            },
          }
        );

        return {
          balance: response.data.UserData.balance,
          currency: 'KES',
        };
      }

      return { balance: 0, currency: 'KES', message: 'Balance check not implemented for this provider' };
    } catch (error) {
      logger.error('SMS balance check failed:', error.message);
      return { balance: 0, currency: 'KES', error: error.message };
    }
  }
}

export default new SMSService();
