import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

/**
 * Generate a unique member number e.g. MBR-20240001
 */
export const generateMemberNumber = (sequence) => {
  const year = new Date().getFullYear();
  return `MBR-${year}${String(sequence).padStart(4, '0')}`;
};

/**
 * Generate a unique transaction reference e.g. TXN-1718000000000-A3F2
 */
export const generateTransactionRef = () =>
  `TXN-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

/**
 * Generate a unique account number e.g. SAV-1718000000000
 */
export const generateAccountNumber = (prefix = 'ACC') =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

/**
 * Generate a secure random token (hex string)
 */
export const generateSecureToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('hex');

/**
 * Generate a numeric OTP of given length
 */
export const generateOTP = (length = 6) =>
  Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');

/**
 * Paginate helper – returns offset and limit from query params
 */
export const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Build Sequelize-compatible order clause from query string
 * e.g. ?sort=createdAt:DESC
 */
export const getOrderClause = (sortQuery, allowedFields = []) => {
  if (!sortQuery) return [['createdAt', 'DESC']];
  const [field, direction] = sortQuery.split(':');
  if (allowedFields.length && !allowedFields.includes(field)) return [['createdAt', 'DESC']];
  return [[field, direction?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']];
};

/**
 * Calculate simple interest
 */
export const calculateSimpleInterest = (principal, ratePercent, months) =>
  (principal * (ratePercent / 100) * months) / 12;

/**
 * Calculate reducing balance EMI
 */
export const calculateEMI = (principal, annualRatePercent, months) => {
  if (!annualRatePercent) return principal / months;
  const monthlyRate = annualRatePercent / 100 / 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
};

/**
 * Format amount to 2 decimal places
 */
export const formatAmount = (amount) => parseFloat(parseFloat(amount || 0).toFixed(2));

/**
 * Mask sensitive data (e.g. phone number, ID number)
 */
export const maskString = (str, visibleChars = 4) => {
  if (!str) return '';
  const s = String(str);
  return s.slice(0, visibleChars) + '*'.repeat(Math.max(0, s.length - visibleChars));
};

export const uuid = () => uuidv4();
