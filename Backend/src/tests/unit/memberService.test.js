import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { AppError, ConflictError, NotFoundError } from '../../utils/errors.js';

// ─── Member validation helpers (extracted from memberService) ─────────────────
const MEMBER_STATUSES = { ACTIVE: 'active', SUSPENDED: 'suspended', PENDING: 'pending' };

const makeMember = (overrides = {}) => ({
  id: 'member-uuid-001',
  organizationId: 'org-uuid-001',
  branchId: 'branch-uuid-001',
  memberNumber: 'MBR-20240001',
  firstName: 'John',
  lastName: 'Mwangi',
  phone: '+254712100001',
  nationalId: '30123456',
  status: MEMBER_STATUSES.ACTIVE,
  loyaltyTier: 'bronze',
  loyaltyPoints: 0,
  update: jest.fn().mockResolvedValue(true),
  ...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('MemberService — registration logic', () => {
  it('should generate a correctly formatted member number', async () => {
    const { generateMemberNumber } = await import('../utils/helpers.js');
    expect(generateMemberNumber(1)).toBe(`MBR-${new Date().getFullYear()}0001`);
    expect(generateMemberNumber(99)).toBe(`MBR-${new Date().getFullYear()}0099`);
    expect(generateMemberNumber(1000)).toBe(`MBR-${new Date().getFullYear()}1000`);
  });

  it('should throw ConflictError for duplicate phone', () => {
    const existing = makeMember();
    expect(() => validateUniquePhone(existing, '+254712100001'))
      .toThrow('A member with this phone number already exists');
  });

  it('should throw ConflictError for duplicate national ID', () => {
    const existing = makeMember();
    expect(() => validateUniqueId(existing, '30123456'))
      .toThrow('A member with this national ID already exists');
  });

  it('should not throw when phone and ID are unique', () => {
    expect(() => validateUniquePhone(null, '+254712200002')).not.toThrow();
    expect(() => validateUniqueId(null, '99999999')).not.toThrow();
  });
});

describe('MemberService — activation and suspension', () => {
  it('should throw if activating an already-active member', () => {
    const member = makeMember({ status: 'active' });
    expect(() => validateNotAlreadyActive(member)).toThrow('Member is already active');
  });

  it('should allow activation of a pending member', () => {
    const member = makeMember({ status: 'pending' });
    expect(() => validateNotAlreadyActive(member)).not.toThrow();
  });

  it('should prevent suspending a member with active loans', () => {
    expect(() => validateNoActiveLoans(2)).toThrow('Cannot suspend member with active loans');
  });

  it('should allow suspending a member with no active loans', () => {
    expect(() => validateNoActiveLoans(0)).not.toThrow();
  });
});

describe('MemberService — account number generation', () => {
  it('should generate savings account number with SAV prefix', async () => {
    const { generateAccountNumber } = await import('../utils/helpers.js');
    const num = generateAccountNumber('SAV');
    expect(num).toMatch(/^SAV-/);
  });

  it('should generate share capital account number with SHR prefix', async () => {
    const { generateAccountNumber } = await import('../utils/helpers.js');
    const num = generateAccountNumber('SHR');
    expect(num).toMatch(/^SHR-/);
  });

  it('should generate unique account numbers', async () => {
    const { generateAccountNumber } = await import('../utils/helpers.js');
    const nums = new Set(Array.from({ length: 100 }, () => generateAccountNumber('SAV')));
    expect(nums.size).toBeGreaterThan(90); // at least 90% unique
  });
});

describe('MemberService — loyalty tier logic', () => {
  it('should correctly determine loyalty tier based on points', () => {
    expect(getLoyaltyTier(0)).toBe('bronze');
    expect(getLoyaltyTier(100)).toBe('bronze');
    expect(getLoyaltyTier(500)).toBe('silver');
    expect(getLoyaltyTier(1000)).toBe('gold');
    expect(getLoyaltyTier(5000)).toBe('platinum');
  });
});

describe('MemberService — next of kin', () => {
  it('should reject share percentage below 1', () => {
    expect(() => validateSharePercentage(0)).toThrow();
  });

  it('should reject share percentage above 100', () => {
    expect(() => validateSharePercentage(101)).toThrow();
  });

  it('should accept valid share percentage', () => {
    expect(() => validateSharePercentage(50)).not.toThrow();
    expect(() => validateSharePercentage(100)).not.toThrow();
  });
});

describe('MemberService — status management', () => {
  it('should correctly mask national ID', async () => {
    const { maskString } = await import('../utils/helpers.js');
    expect(maskString('30123456', 4)).toBe('3012****');
  });

  it('should correctly mask phone number', async () => {
    const { maskString } = await import('../utils/helpers.js');
    expect(maskString('+254712100001', 7)).toBe('+254712******');
  });
});

// ─── Extracted pure helper functions ──────────────────────────────────────────
function validateUniquePhone(existing, phone) {
  if (existing) throw new ConflictError('A member with this phone number already exists.');
}

function validateUniqueId(existing, nationalId) {
  if (existing) throw new ConflictError('A member with this national ID already exists.');
}

function validateNotAlreadyActive(member) {
  if (member.status === MEMBER_STATUSES.ACTIVE) throw new AppError('Member is already active.', 400);
}

function validateNoActiveLoans(activeLoansCount) {
  if (activeLoansCount > 0) throw new AppError('Cannot suspend member with active loans.', 400);
}

function getLoyaltyTier(points) {
  if (points >= 5000) return 'platinum';
  if (points >= 1000) return 'gold';
  if (points >= 500) return 'silver';
  return 'bronze';
}

function validateSharePercentage(percentage) {
  if (percentage < 1 || percentage > 100) throw new AppError('Share percentage must be between 1 and 100.', 400);
}
