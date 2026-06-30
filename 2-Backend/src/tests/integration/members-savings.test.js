import { describe, it, expect } from '@jest/globals';
import { validatePayload } from './helpers/testHelpers.js';

// ─── Member API ────────────────────────────────────────────────────────────────
describe('Member API — Validator tests', () => {
  describe('POST /members (registerMember)', () => {
    const validMember = {
      firstName: 'Grace', lastName: 'Wanjiru',
      phone: '0712100001', nationalId: '30123456',
      branchId: '11111111-1111-1111-1111-111111111111',
    };

    it('should accept a valid member payload', () => {
      const result = validatePayload(validMember, 'registerMember');
      expect(result.valid).toBe(true);
    });

    it('should reject a missing first name', () => {
      const { firstName, ...rest } = validMember;
      const result = validatePayload(rest, 'registerMember');
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'firstName')).toBe(true);
    });

    it('should reject a missing national ID', () => {
      const { nationalId, ...rest } = validMember;
      const result = validatePayload(rest, 'registerMember');
      expect(result.valid).toBe(false);
    });

    it('should reject a missing branch ID', () => {
      const { branchId, ...rest } = validMember;
      const result = validatePayload(rest, 'registerMember');
      expect(result.valid).toBe(false);
    });

    it('should reject an invalid email format', () => {
      const result = validatePayload({ ...validMember, email: 'not-valid' }, 'registerMember');
      expect(result.valid).toBe(false);
    });

    it('should accept optional email as empty string', () => {
      const result = validatePayload({ ...validMember, email: '' }, 'registerMember');
      expect(result.valid).toBe(true);
    });

    it('should reject gender outside allowed enum', () => {
      const result = validatePayload({ ...validMember, gender: 'unknown' }, 'registerMember');
      expect(result.valid).toBe(false);
    });
  });

  describe('PATCH /members/:id/suspend', () => {
    it('should require a reason of at least 10 characters', () => {
      const result = validatePayload({ reason: 'short' }, 'suspendMember');
      expect(result.valid).toBe(false);
    });

    it('should accept a valid suspension reason', () => {
      const result = validatePayload({ reason: 'Repeated loan defaults without contact' }, 'suspendMember');
      expect(result.valid).toBe(true);
    });
  });

  describe('POST /members/:id/next-of-kin', () => {
    it('should accept a valid next-of-kin payload', () => {
      const result = validatePayload({
        firstName: 'Mary', lastName: 'Wanjiku',
        relationship: 'Spouse', phone: '0723456789',
        sharePercentage: 100, isPrimary: true,
      }, 'addNextOfKin');
      expect(result.valid).toBe(true);
    });

    it('should reject missing phone', () => {
      const result = validatePayload({ firstName: 'Mary', lastName: 'Wanjiku', relationship: 'Spouse' }, 'addNextOfKin');
      expect(result.valid).toBe(false);
    });
  });
});

// ─── Savings API ───────────────────────────────────────────────────────────────
describe('Savings API — Validator tests', () => {
  const validUUID = '11111111-1111-1111-1111-111111111111';

  describe('POST /savings/deposit', () => {
    it('should accept valid deposit', () => {
      const result = validatePayload({ accountId: validUUID, amount: 5000 }, 'deposit');
      expect(result.valid).toBe(true);
    });

    it('should reject zero amount', () => {
      const result = validatePayload({ accountId: validUUID, amount: 0 }, 'deposit');
      expect(result.valid).toBe(false);
    });

    it('should reject negative amount', () => {
      const result = validatePayload({ accountId: validUUID, amount: -100 }, 'deposit');
      expect(result.valid).toBe(false);
    });

    it('should reject missing accountId', () => {
      const result = validatePayload({ amount: 5000 }, 'deposit');
      expect(result.valid).toBe(false);
    });

    it('should reject invalid payment method', () => {
      const result = validatePayload({ accountId: validUUID, amount: 5000, paymentMethod: 'bitcoin' }, 'deposit');
      expect(result.valid).toBe(false);
    });

    it('should accept all valid payment methods', () => {
      ['cash', 'mpesa', 'bank_transfer', 'cheque'].forEach((method) => {
        const result = validatePayload({ accountId: validUUID, amount: 5000, paymentMethod: method }, 'deposit');
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('POST /savings/withdraw', () => {
    it('should reject amount exceeding 10M', () => {
      const result = validatePayload({ accountId: validUUID, amount: 10000001 }, 'withdrawal');
      expect(result.valid).toBe(false);
    });

    it('should accept valid withdrawal', () => {
      const result = validatePayload({ accountId: validUUID, amount: 1000 }, 'withdrawal');
      expect(result.valid).toBe(true);
    });
  });

  describe('POST /savings/transfer', () => {
    it('should reject missing fromAccountId', () => {
      const result = validatePayload({ toAccountId: validUUID, amount: 5000 }, 'transfer');
      expect(result.valid).toBe(false);
    });

    it('should reject missing toAccountId', () => {
      const result = validatePayload({ fromAccountId: validUUID, amount: 5000 }, 'transfer');
      expect(result.valid).toBe(false);
    });

    it('should accept valid transfer', () => {
      const toId = '22222222-2222-2222-2222-222222222222';
      const result = validatePayload({ fromAccountId: validUUID, toAccountId: toId, amount: 5000 }, 'transfer');
      expect(result.valid).toBe(true);
    });
  });

  describe('POST /savings/accounts', () => {
    it('should require fixedDepositAmount for fixed deposits', () => {
      const result = validatePayload({
        memberId: validUUID, branchId: validUUID,
        accountType: 'fixed_deposit', fixedDepositDurationMonths: 12,
      }, 'createSavingsAccount');
      expect(result.valid).toBe(false);
    });

    it('should accept valid ordinary account', () => {
      const result = validatePayload({
        memberId: validUUID, branchId: validUUID, accountType: 'ordinary',
      }, 'createSavingsAccount');
      expect(result.valid).toBe(true);
    });

    it('should accept valid fixed deposit account', () => {
      const result = validatePayload({
        memberId: validUUID, branchId: validUUID, accountType: 'fixed_deposit',
        fixedDepositAmount: 50000, fixedDepositDurationMonths: 12, interestRate: 10,
      }, 'createSavingsAccount');
      expect(result.valid).toBe(true);
    });
  });
});

// ─── Branch API ────────────────────────────────────────────────────────────────
describe('Branch API — Validator tests', () => {
  describe('POST /branches', () => {
    it('should accept valid branch', () => {
      const result = validatePayload({ name: 'Nairobi Branch', code: 'BR001' }, 'createBranch');
      expect(result.valid).toBe(true);
    });

    it('should reject missing name', () => {
      const result = validatePayload({ code: 'BR001' }, 'createBranch');
      expect(result.valid).toBe(false);
    });

    it('should reject non-alphanumeric code', () => {
      const result = validatePayload({ name: 'Nairobi Branch', code: 'BR-001!' }, 'createBranch');
      expect(result.valid).toBe(false);
    });
  });
});
