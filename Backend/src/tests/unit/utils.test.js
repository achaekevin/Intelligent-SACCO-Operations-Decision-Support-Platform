import { describe, it, expect } from '@jest/globals';

describe('helpers — generateTransactionRef', () => {
  it('starts with TXN-', async () => {
    const { generateTransactionRef } = await import('../utils/helpers.js');
    expect(generateTransactionRef()).toMatch(/^TXN-\d+-[A-F0-9]{4}$/);
  });

  it('generates 1000 unique refs', async () => {
    const { generateTransactionRef } = await import('../utils/helpers.js');
    const refs = new Set(Array.from({ length: 1000 }, generateTransactionRef));
    expect(refs.size).toBe(1000);
  });
});

describe('helpers — generateMemberNumber', () => {
  it('pads sequence to 4 digits', async () => {
    const { generateMemberNumber } = await import('../utils/helpers.js');
    const year = new Date().getFullYear();
    expect(generateMemberNumber(1)).toBe(`MBR-${year}0001`);
    expect(generateMemberNumber(9999)).toBe(`MBR-${year}9999`);
  });
});

describe('helpers — calculateEMI', () => {
  it('calculates correct EMI for 12-month, 12% loan', async () => {
    const { calculateEMI } = await import('../utils/helpers.js');
    const emi = calculateEMI(120000, 12, 12);
    expect(emi).toBeCloseTo(10661, 0);
  });

  it('handles zero interest rate (equal instalments)', async () => {
    const { calculateEMI } = await import('../utils/helpers.js');
    const emi = calculateEMI(120000, 0, 12);
    expect(emi).toBeCloseTo(10000, 0);
  });
});

describe('helpers — calculateSimpleInterest', () => {
  it('returns correct interest for 12-month 6% loan', async () => {
    const { calculateSimpleInterest } = await import('../utils/helpers.js');
    expect(calculateSimpleInterest(100000, 6, 12)).toBeCloseTo(6000, 2);
  });
});

describe('helpers — getPagination', () => {
  it('returns defaults for empty query', async () => {
    const { getPagination } = await import('../utils/helpers.js');
    const { page, limit, offset } = getPagination({});
    expect(page).toBe(1);
    expect(limit).toBe(20);
    expect(offset).toBe(0);
  });

  it('calculates correct offset', async () => {
    const { getPagination } = await import('../utils/helpers.js');
    const { offset } = getPagination({ page: '3', limit: '10' });
    expect(offset).toBe(20);
  });

  it('caps limit at 100', async () => {
    const { getPagination } = await import('../utils/helpers.js');
    const { limit } = getPagination({ limit: '500' });
    expect(limit).toBe(100);
  });
});

describe('helpers — formatAmount', () => {
  it('rounds to 2 decimal places', async () => {
    const { formatAmount } = await import('../utils/helpers.js');
    expect(formatAmount(10.005)).toBeCloseTo(10.01, 2);
    expect(formatAmount(0)).toBe(0);
  });
});

describe('helpers — generateOTP', () => {
  it('generates numeric OTP of requested length', async () => {
    const { generateOTP } = await import('../utils/helpers.js');
    const otp = generateOTP(6);
    expect(otp).toHaveLength(6);
    expect(/^\d+$/.test(otp)).toBe(true);
  });
});

describe('AppError hierarchy', () => {
  it('AppError has correct statusCode', async () => {
    const { AppError, NotFoundError, UnauthorizedError, ConflictError, ForbiddenError } = await import('../utils/errors.js');
    expect(new AppError('test', 500).statusCode).toBe(500);
    expect(new NotFoundError().statusCode).toBe(404);
    expect(new UnauthorizedError().statusCode).toBe(401);
    expect(new ConflictError().statusCode).toBe(409);
    expect(new ForbiddenError().statusCode).toBe(403);
  });

  it('AppError marks isOperational = true', async () => {
    const { AppError } = await import('../utils/errors.js');
    expect(new AppError('test').isOperational).toBe(true);
  });
});

describe('response helpers', () => {
  it('successResponse shapes payload correctly', async () => {
    const { successResponse } = await import('../utils/response.js');
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const { jest } = await import('@jest/globals');
    const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    successResponse(mockRes, { message: 'Done', data: { id: 1 } });
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: 'Done' }));
  });

  it('errorResponse shapes payload correctly', async () => {
    const { errorResponse } = await import('../utils/response.js');
    const { jest } = await import('@jest/globals');
    const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    errorResponse(mockRes, { message: 'Failed', errors: [{ field: 'email', message: 'Required' }] });
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});
