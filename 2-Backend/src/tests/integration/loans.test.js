import { describe, it, expect } from '@jest/globals';
import Joi from 'joi';
import {
  applyLoanSchema,
  approveLoanSchema,
  rejectLoanSchema,
  disburseLoanSchema,
  repayLoanSchema,
  addGuarantorSchema,
  loanListQuerySchema,
} from '../../validators/loanValidator.js';

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  return error
    ? { valid: false, errors: error.details.map((d) => ({ field: d.path.join('.'), message: d.message.replace(/['"]/g, '') })) }
    : { valid: true, value };
};

const validUUID = '11111111-1111-1111-1111-111111111111';

describe('LoanValidator — applyLoanSchema', () => {
  const validPayload = {
    memberId: validUUID, loanProductId: validUUID,
    principalAmount: 50000, termMonths: 12,
    purpose: 'Purchase of household goods and furniture',
  };

  it('accepts a valid loan application', () => {
    expect(validate(applyLoanSchema, validPayload).valid).toBe(true);
  });

  it('rejects missing memberId', () => {
    const { memberId, ...rest } = validPayload;
    const result = validate(applyLoanSchema, rest);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'memberId')).toBe(true);
  });

  it('rejects missing loanProductId', () => {
    const { loanProductId, ...rest } = validPayload;
    const result = validate(applyLoanSchema, rest);
    expect(result.valid).toBe(false);
  });

  it('rejects negative principal amount', () => {
    const result = validate(applyLoanSchema, { ...validPayload, principalAmount: -1000 });
    expect(result.valid).toBe(false);
  });

  it('rejects zero term months', () => {
    const result = validate(applyLoanSchema, { ...validPayload, termMonths: 0 });
    expect(result.valid).toBe(false);
  });

  it('rejects purpose shorter than 10 chars', () => {
    const result = validate(applyLoanSchema, { ...validPayload, purpose: 'Short' });
    expect(result.valid).toBe(false);
  });

  it('accepts valid disbursement method', () => {
    const result = validate(applyLoanSchema, { ...validPayload, disbursementMethod: 'mpesa' });
    expect(result.valid).toBe(true);
  });

  it('rejects invalid disbursement method', () => {
    const result = validate(applyLoanSchema, { ...validPayload, disbursementMethod: 'bitcoin' });
    expect(result.valid).toBe(false);
  });

  it('rejects term exceeding 120 months', () => {
    const result = validate(applyLoanSchema, { ...validPayload, termMonths: 121 });
    expect(result.valid).toBe(false);
  });
});

describe('LoanValidator — rejectLoanSchema', () => {
  it('requires reason of at least 10 characters', () => {
    expect(validate(rejectLoanSchema, { reason: 'Short' }).valid).toBe(false);
  });

  it('accepts valid rejection reason', () => {
    expect(validate(rejectLoanSchema, { reason: 'Insufficient collateral and poor credit history' }).valid).toBe(true);
  });
});

describe('LoanValidator — disburseLoanSchema', () => {
  it('requires disbursementMethod', () => {
    const result = validate(disburseLoanSchema, {});
    expect(result.valid).toBe(false);
  });

  it('accepts cash disbursement', () => {
    expect(validate(disburseLoanSchema, { disbursementMethod: 'cash' }).valid).toBe(true);
  });

  it('accepts mpesa with reference', () => {
    expect(validate(disburseLoanSchema, { disbursementMethod: 'mpesa', disbursementReference: 'QF12XY3ABC' }).valid).toBe(true);
  });
});

describe('LoanValidator — repayLoanSchema', () => {
  it('requires positive amount', () => {
    expect(validate(repayLoanSchema, { amount: 0 }).valid).toBe(false);
  });

  it('accepts valid repayment', () => {
    expect(validate(repayLoanSchema, { amount: 10661, paymentMethod: 'mpesa' }).valid).toBe(true);
  });

  it('defaults payment method to cash', () => {
    const result = validate(repayLoanSchema, { amount: 5000 });
    expect(result.valid).toBe(true);
    expect(result.value.paymentMethod).toBe('cash');
  });
});

describe('LoanValidator — addGuarantorSchema', () => {
  it('requires memberId', () => {
    expect(validate(addGuarantorSchema, { amountGuaranteed: 50000 }).valid).toBe(false);
  });

  it('requires positive amountGuaranteed', () => {
    expect(validate(addGuarantorSchema, { memberId: validUUID, amountGuaranteed: 0 }).valid).toBe(false);
  });

  it('accepts valid guarantor payload', () => {
    expect(validate(addGuarantorSchema, { memberId: validUUID, amountGuaranteed: 50000 }).valid).toBe(true);
  });
});

describe('LoanValidator — loanListQuerySchema', () => {
  it('accepts empty query (all defaults)', () => {
    const result = validate(loanListQuerySchema, {});
    expect(result.valid).toBe(true);
    expect(result.value.page).toBe(1);
    expect(result.value.limit).toBe(20);
  });

  it('rejects invalid status', () => {
    expect(validate(loanListQuerySchema, { status: 'unknown' }).valid).toBe(false);
  });

  it('accepts valid status', () => {
    ['pending', 'approved', 'disbursed', 'completed', 'defaulted'].forEach((s) => {
      expect(validate(loanListQuerySchema, { status: s }).valid).toBe(true);
    });
  });

  it('caps limit at 100', () => {
    const result = validate(loanListQuerySchema, { limit: 500 });
    expect(result.valid).toBe(true);
    expect(result.value.limit).toBe(100);
  });
});
