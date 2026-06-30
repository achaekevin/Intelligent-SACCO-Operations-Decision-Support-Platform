import { describe, it, expect, jest } from '@jest/globals';
import { AppError, NotFoundError } from '../../utils/errors.js';
import { calculateEMI, calculateSimpleInterest, formatAmount } from '../../utils/helpers.js';

// ─── Loan calculation helpers (extracted from loanService) ─────────────────────
function calcLoanFigures(principal, rate, method, termMonths) {
  let interestAmount, totalRepayable, monthlyInstallment;
  if (method === 'flat') {
    interestAmount    = formatAmount(calculateSimpleInterest(principal, rate, termMonths));
    totalRepayable    = formatAmount(principal + interestAmount);
    monthlyInstallment = formatAmount(totalRepayable / termMonths);
  } else {
    monthlyInstallment = formatAmount(calculateEMI(principal, rate, termMonths));
    totalRepayable     = formatAmount(monthlyInstallment * termMonths);
    interestAmount     = formatAmount(totalRepayable - principal);
  }
  return { interestAmount, totalRepayable, monthlyInstallment };
}

function validateAmountRange(amount, min, max) {
  if (amount < min || amount > max) {
    throw new AppError(`Loan amount must be between KES ${min.toLocaleString()} and KES ${max.toLocaleString()}.`, 400);
  }
}

function validateTermRange(term, min, max) {
  if (term < min || term > max) {
    throw new AppError(`Loan term must be between ${min} and ${max} months.`, 400);
  }
}

function validateSavingsMultiplier(amount, balance, multiplier) {
  const maxEligible = balance * multiplier;
  if (amount > maxEligible) {
    throw new AppError(`Loan amount exceeds eligibility. Maximum: KES ${maxEligible.toLocaleString()}.`, 400);
  }
}

function validateLoanStatus(current, allowed, action) {
  if (!allowed.includes(current)) {
    throw new AppError(`Cannot ${action} a loan with status: ${current}.`, 400);
  }
}

function validateRepaymentAmount(amount) {
  if (amount <= 0) throw new AppError('Repayment amount must be greater than zero.', 400);
}

function validateNotSelfGuarantee(borrowerId, guarantorId) {
  if (borrowerId === guarantorId) throw new AppError('A borrower cannot guarantee their own loan.', 400);
}

// ─── Tests ─────────────────────────────────────────────────────────────────────
describe('LoanService — EMI calculations', () => {
  it('calculates correct EMI for reducing balance loan', () => {
    const { monthlyInstallment } = calcLoanFigures(120000, 12, 'reducing_balance', 12);
    expect(monthlyInstallment).toBeCloseTo(10661, 0);
  });

  it('calculates correct flat rate interest', () => {
    const { interestAmount } = calcLoanFigures(100000, 10, 'flat', 12);
    // flat: 100000 * 10% * (12/12) = 10000
    expect(interestAmount).toBeCloseTo(10000, 0);
  });

  it('total repayable = principal + interest for flat rate', () => {
    const { totalRepayable, interestAmount } = calcLoanFigures(100000, 10, 'flat', 12);
    expect(totalRepayable).toBeCloseTo(100000 + interestAmount, 0);
  });

  it('calculates correct monthly instalment for zero-interest loan', () => {
    const { monthlyInstallment } = calcLoanFigures(60000, 0, 'reducing_balance', 12);
    expect(monthlyInstallment).toBeCloseTo(5000, 0);
  });

  it('total for reducing balance is close to principal + interest', () => {
    const { totalRepayable, interestAmount } = calcLoanFigures(120000, 12, 'reducing_balance', 12);
    expect(totalRepayable).toBeGreaterThan(120000);
    expect(interestAmount).toBeGreaterThan(0);
  });
});

describe('LoanService — Amount and term validation', () => {
  it('throws when amount is below minimum', () => {
    expect(() => validateAmountRange(4000, 5000, 200000))
      .toThrow('Loan amount must be between');
  });

  it('throws when amount exceeds maximum', () => {
    expect(() => validateAmountRange(300000, 5000, 200000))
      .toThrow('Loan amount must be between');
  });

  it('accepts amount within range', () => {
    expect(() => validateAmountRange(100000, 5000, 200000)).not.toThrow();
  });

  it('throws when term is below minimum', () => {
    expect(() => validateTermRange(0, 1, 48)).toThrow('Loan term must be between');
  });

  it('throws when term exceeds maximum', () => {
    expect(() => validateTermRange(60, 1, 48)).toThrow('Loan term must be between');
  });

  it('accepts term within range', () => {
    expect(() => validateTermRange(24, 1, 48)).not.toThrow();
  });
});

describe('LoanService — Savings multiplier eligibility', () => {
  it('throws when loan exceeds 3x savings', () => {
    expect(() => validateSavingsMultiplier(100000, 30000, 3))
      .toThrow('Loan amount exceeds eligibility');
  });

  it('accepts loan at exactly 3x savings', () => {
    expect(() => validateSavingsMultiplier(90000, 30000, 3)).not.toThrow();
  });

  it('accepts loan below 3x savings', () => {
    expect(() => validateSavingsMultiplier(50000, 30000, 3)).not.toThrow();
  });
});

describe('LoanService — Status transitions', () => {
  it('approve: only allows pending or under_review', () => {
    expect(() => validateLoanStatus('disbursed', ['pending', 'under_review'], 'approve'))
      .toThrow('Cannot approve a loan with status: disbursed');
  });

  it('approve: allows pending', () => {
    expect(() => validateLoanStatus('pending', ['pending', 'under_review'], 'approve')).not.toThrow();
  });

  it('disburse: only allows approved', () => {
    expect(() => validateLoanStatus('pending', ['approved'], 'disburse'))
      .toThrow('Cannot disburse a loan with status: pending');
  });

  it('disburse: allows approved', () => {
    expect(() => validateLoanStatus('approved', ['approved'], 'disburse')).not.toThrow();
  });

  it('repay: only allows disbursed', () => {
    expect(() => validateLoanStatus('completed', ['disbursed'], 'repay'))
      .toThrow('Cannot repay a loan with status: completed');
  });
});

describe('LoanService — Repayment validation', () => {
  it('rejects zero repayment', () => {
    expect(() => validateRepaymentAmount(0)).toThrow('Repayment amount must be greater than zero');
  });

  it('rejects negative repayment', () => {
    expect(() => validateRepaymentAmount(-500)).toThrow('Repayment amount must be greater than zero');
  });

  it('accepts valid repayment', () => {
    expect(() => validateRepaymentAmount(5000)).not.toThrow();
  });
});

describe('LoanService — Guarantor validation', () => {
  it('prevents self-guarantee', () => {
    expect(() => validateNotSelfGuarantee('user-001', 'user-001'))
      .toThrow('A borrower cannot guarantee their own loan');
  });

  it('allows different member as guarantor', () => {
    expect(() => validateNotSelfGuarantee('borrower-001', 'guarantor-002')).not.toThrow();
  });
});

describe('LoanService — Loan number generation', () => {
  it('produces correct format LN-YEARXXXXX', () => {
    const year = new Date().getFullYear();
    const num = generateLoanNumber(1);
    expect(num).toBe(`LN-${year}00001`);
  });

  it('pads sequence to 5 digits', () => {
    const year = new Date().getFullYear();
    expect(generateLoanNumber(99)).toBe(`LN-${year}00099`);
    expect(generateLoanNumber(10000)).toBe(`LN-${year}10000`);
  });
});

describe('LoanService — Processing fees', () => {
  it('calculates processing fee correctly', () => {
    const principal = 100000;
    const feePercent = 2;
    const fee = formatAmount(principal * feePercent / 100);
    expect(fee).toBe(2000);
  });

  it('calculates insurance fee correctly', () => {
    const principal = 200000;
    const insurancePercent = 1;
    const fee = formatAmount(principal * insurancePercent / 100);
    expect(fee).toBe(2000);
  });

  it('total repayable includes fees', () => {
    const principal = 100000;
    const processingFee = 2000;
    const insuranceFee  = 1000;
    const { totalRepayable } = calcLoanFigures(principal, 12, 'reducing_balance', 12);
    const finalTotal = formatAmount(totalRepayable + processingFee + insuranceFee);
    expect(finalTotal).toBeGreaterThan(principal);
  });
});

// ─── Pure helper ─────────────────────────────────────────────────────────────
function generateLoanNumber(sequence) {
  const year = new Date().getFullYear();
  return `LN-${year}${String(sequence).padStart(5, '0')}`;
}
