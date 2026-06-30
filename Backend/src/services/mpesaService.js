import axios from 'axios';
import logger from '../utils/logger.js';

/**
 * Safaricom Daraja API integration.
 *
 * Endpoints implemented:
 *  - STK Push (Lipa na M-Pesa Online)
 *  - Payment callback handler
 *  - Transaction status query
 *  - B2C disbursement
 *
 * Wire this into the savings/loan services to auto-reconcile incoming payments.
 */
class MpesaService {
  constructor() {
    this.baseUrl = process.env.MPESA_ENV === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
    this.shortcode = process.env.MPESA_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.callbackUrl = process.env.MPESA_CALLBACK_URL;
  }

  /**
   * Get OAuth 2.0 access token from Daraja
   */
  async getAccessToken() {
    const credentials = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    const res = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${credentials}` },
    });
    return res.data.access_token;
  }

  /**
   * Generate STK Push password (Base64 of shortcode + passkey + timestamp)
   */
  getPassword(timestamp) {
    return Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');
  }

  getTimestamp() {
    return new Date().toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14);
  }

  /**
   * Initiate STK Push (Lipa Na M-Pesa Online)
   * @param {string} phoneNumber  - 254XXXXXXXXX format
   * @param {number} amount       - Amount in KES
   * @param {string} accountRef   - Account reference (member number / loan number)
   * @param {string} description  - Transaction description
   */
  async stkPush({ phoneNumber, amount, accountRef, description = 'Payment' }) {
    const token = await this.getAccessToken();
    const timestamp = this.getTimestamp();

    const payload = {
      BusinessShortCode: this.shortcode,
      Password: this.getPassword(timestamp),
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount),
      PartyA: phoneNumber,
      PartyB: this.shortcode,
      PhoneNumber: phoneNumber,
      CallBackURL: this.callbackUrl,
      AccountReference: accountRef,
      TransactionDesc: description,
    };

    const res = await axios.post(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, payload, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });

    logger.info(`STK Push initiated for ${phoneNumber}: ${res.data.CheckoutRequestID}`);
    return res.data;
  }

  /**
   * Handle STK Push callback from Safaricom
   * Saves result and reconciles with a savings/loan transaction.
   */
  async handleCallback(organizationId, callbackData) {
    const { Body: { stkCallback } } = callbackData;
    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    const { MpesaTransaction } = await import('../models/index.js');

    const record = await MpesaTransaction.findOne({ where: { checkoutRequestId: CheckoutRequestID, organizationId } });
    if (!record) {
      logger.warn(`STK callback for unknown checkout request: ${CheckoutRequestID}`);
      return;
    }

    if (ResultCode === 0 && CallbackMetadata?.Item) {
      const meta = Object.fromEntries(CallbackMetadata.Item.map((i) => [i.Name, i.Value]));
      await record.update({
        status: 'completed',
        mpesaReceiptNumber: meta.MpesaReceiptNumber,
        resultCode: String(ResultCode),
        resultDesc: ResultDesc,
        callbackPayload: callbackData,
      });
      logger.info(`M-Pesa payment confirmed: ${meta.MpesaReceiptNumber} — KES ${meta.Amount}`);
      // TODO: Link to a savings deposit or loan repayment here
    } else {
      await record.update({
        status: 'failed',
        resultCode: String(ResultCode),
        resultDesc: ResultDesc,
        callbackPayload: callbackData,
      });
      logger.warn(`STK Push failed for ${CheckoutRequestID}: ${ResultDesc}`);
    }
  }

  /**
   * Query the status of an STK Push transaction
   */
  async queryTransactionStatus(checkoutRequestId) {
    const token = await this.getAccessToken();
    const timestamp = this.getTimestamp();

    const res = await axios.post(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
      BusinessShortCode: this.shortcode,
      Password: this.getPassword(timestamp),
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }

  /**
   * B2C disbursement (for loan disbursements directly to member phones)
   */
  async b2cPayment({ phoneNumber, amount, remarks, occasion = '' }) {
    const token = await this.getAccessToken();

    const res = await axios.post(`${this.baseUrl}/mpesa/b2c/v3/paymentrequest`, {
      OriginatorConversationID: `B2C-${Date.now()}`,
      InitiatorName: process.env.MPESA_B2C_INITIATOR,
      SecurityCredential: process.env.MPESA_B2C_SECURITY_CREDENTIAL,
      CommandID: 'BusinessPayment',
      Amount: Math.ceil(amount),
      PartyA: this.shortcode,
      PartyB: phoneNumber,
      Remarks: remarks,
      QueueTimeOutURL: `${this.callbackUrl}/b2c/timeout`,
      ResultURL: `${this.callbackUrl}/b2c/result`,
      Occasion: occasion,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    logger.info(`B2C initiated to ${phoneNumber}: KES ${amount}`);
    return res.data;
  }
}

export default new MpesaService();
