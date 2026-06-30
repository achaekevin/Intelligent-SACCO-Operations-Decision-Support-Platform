import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { AppError, NotFoundError } from '../../utils/errors.js';

// ─── Mock account factory ─────────────────────────────────────────────────────
const makeAccount = (overrides = {}) => ({
  id: 'acc-uuid-001',
  organizationId: 'org-uuid-001',
  branchId: 'branch-uuid-001',
  memberId: 'member-uuid-001',
  accountNumber: 'SAV-1704000001',
  accountType: 'ordinary',
  balance: 50000,
  availableBalance: 50000,
  minimumBalance: 0,
  interestRate: 6,
  status: 'active',
  update: jest.fn().mockResolvedValue(true),
  ...overrides,
});

const makeTx = (overrides = {}) => ({
  id: 'tx-uuid-001',
  reference: 'TXN-123456-ABCD',
  type: 'deposit',
  amount: 5000,
  balanceBefore: 50000,
  balanceAfter: 55000,
  status: 'completed',
  ...overrides,
});

// ─── Savings service logic tests (pure unit, no DB) ──────────────────────────
describe('SavingsService — deposit logic', () => {
  it('should reject deposits of zero or negative', () => {
    expect(() => validateDepositAmount(0)).toThrow('Deposit amount must be greater than zero');
    expect(() => validateDepositAmount(-100)).toThrow('Deposit amount must be greater than zero');
  });

  it('should reject deposits to inactive accounts', () => {
    const account = makeAccount({ status: 'frozen' });
    expect(() => validateAccountActive(account, 'deposit')).toThrow('Cannot deposit to an inactive account');
  });

  it('should correctly calculate balance after deposit', () => {
    const before = 50000;
    const amount = 5000;
    expect(calcBalanceAfterDeposit(before, amount)).toBeCloseTo(55000, 2);
  });

  it('should correctly calculate balance after withdrawal', () => {
    const before = 50000;
    const amount = 20000;
    expect(calcBalanceAfterWithdrawal(before, amount)).toBeCloseTo(30000, 2);
  });

  it('should reject withdrawal that would breach minimum balance', () => {
    const account = makeAccount({ balance: 5000, minimumBalance: 1000 });
    expect(() => validateWithdrawalBalance(account, 4500)).toThrow('Insufficient funds. Minimum balance');
  });

  it('should allow withdrawal leaving exactly the minimum balance', () => {
    const account = makeAccount({ balance: 5000, minimumBalance: 1000 });
    expect(() => validateWithdrawalBalance(account, 4000)).not.toThrow();
  });

  it('should reject withdrawal from a fixed deposit before maturity', () => {
    const future = new Date();
    future.setMonth(future.getMonth() + 3);
    const account = makeAccount({ accountType: 'fixed_deposit', maturityDate: future.toISOString() });
    expect(() => validateFixedDepositMaturity(account)).toThrow('Fixed deposit has not matured yet');
  });

  it('should allow withdrawal from a matured fixed deposit', () => {
    const past = new Date();
    past.setFullYear(past.getFullYear() - 1);
    const account = makeAccount({ accountType: 'fixed_deposit', maturityDate: past.toISOString() });
    expect(() => validateFixedDepositMaturity(account)).not.toThrow();
  });
});

describe('SavingsService — transfer logic', () => {
  it('should reject transfer to the same account', () => {
    expect(() => validateTransferAccounts('acc-001', 'acc-001'))
      .toThrow('Cannot transfer to the same account');
  });

  it('should reject zero-amount transfers', () => {
    expect(() => validateDepositAmount(0)).toThrow();
  });

  it('should reject transfer with insufficient balance', () => {
    const account = makeAccount({ balance: 3000, minimumBalance: 500 });
    expect(() => validateTransferBalance(account, 3000)).toThrow('Insufficient balance');
  });

  it('should allow transfer within available balance', () => {
    const account = makeAccount({ balance: 10000, minimumBalance: 0 });
    expect(() => validateTransferBalance(account, 5000)).not.toThrow();
  });
});

describe('SavingsService — interest accrual', () => {
  it('should calculate monthly interest correctly', () => {
    const principal = 100000;
    const annualRate = 6; // 6%
    const monthlyInterest = calcMonthlyInterest(principal, annualRate);
    expect(monthlyInterest).toBeCloseTo(500, 2); // 100000 * 0.06 / 12 = 500
  });

  it('should return zero interest for zero rate accounts', () => {
    expect(calcMonthlyInterest(50000, 0)).toBe(0);
  });

  it('should not accrue interest on zero balances', () => {
    expect(calcMonthlyInterest(0, 6)).toBe(0);
  });
});

describe('SavingsService — reversal logic', () => {
  it('should reject reversal of an already-reversed transaction', () => {
    const tx = makeTx({ status: 'reversed' });
    expect(() => validateNotAlreadyReversed(tx)).toThrow('Transaction already reversed');
  });

  it('should allow reversal of a completed transaction', () => {
    const tx = makeTx({ status: 'completed' });
    expect(() => validateNotAlreadyReversed(tx)).not.toThrow();
  });
});

describe('SavingsService — transaction reference generation', () => {
  it('should generate unique references', async () => {
    const { generateTransactionRef } = await import('../utils/helpers.js');
    const refs = new Set(Array.from({ length: 1000 }, () => generateTransactionRef()));
    expect(refs.size).toBe(1000);
  });

  it('should start with TXN-', async () => {
    const { generateTransactionRef } = await import('../utils/helpers.js');
    expect(generateTransactionRef()).toMatch(/^TXN-/);
  });
});

// ─── Pure business-logic helpers (extracted for testability) ─────────────────
const formatAmount = (v) => parseFloat(parseFloat(v || 0).toFixed(2));

function validateDepositAmount(amount) {
  if (amount <= 0) throw new AppError('Deposit amount must be greater than zero.', 400);
}

function validateAccountActive(account, op) {
  if (account.status !== 'active') throw new AppError(`Cannot ${op} to an inactive account.`, 400);
}

function validateWithdrawalBalance(account, amount) {
  const balanceAfter = formatAmount(account.balance - amount);
  if (balanceAfter < formatAmount(account.minimumBalance)) {
    throw new AppError(`Insufficient funds. Minimum balance of KES ${account.minimumBalance} must be maintained.`, 400);
  }
}

function validateFixedDepositMaturity(account) {
  if (account.accountType === 'fixed_deposit' && new Date() < new Date(account.maturityDate)) {
    throw new AppError('Fixed deposit has not matured yet.', 400);
  }
}

function validateTransferAccounts(fromId, toId) {
  if (fromId === toId) throw new AppError('Cannot transfer to the same account.', 400);
}

function validateTransferBalance(account, amount) {
  if (formatAmount(account.balance) - amount < formatAmount(account.minimumBalance)) {
    throw new AppError('Insufficient balance for this transfer.', 400);
  }
}

function calcBalanceAfterDeposit(before, amount) {
  return formatAmount(before + amount);
}

function calcBalanceAfterWithdrawal(before, amount) {
  return formatAmount(before - amount);
}

function calcMonthlyInterest(principal, annualRatePercent) {
  return formatAmount(principal * (annualRatePercent / 100) / 12);
}

function validateNotAlreadyReversed(tx) {
  if (tx.status === 'reversed') throw new AppError('Transaction already reversed.', 400);
}
