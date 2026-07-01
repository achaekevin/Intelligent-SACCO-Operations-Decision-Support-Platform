import Joi from 'joi';

export const applyLoanSchema = Joi.object({
  memberId: Joi.string().uuid().required().label('Member'),
  loanProductId: Joi.string().uuid().required().label('Loan product'),
  principalAmount: Joi.number().positive().required().label('Amount'),
  termMonths: Joi.number().integer().min(1).max(120).required().label('Term (months)'),
  purpose: Joi.string().min(10).max(500).required().label('Loan purpose'),
  disbursementMethod: Joi.string()
    .valid('cash', 'mpesa', 'bank_transfer', 'account_credit')
    .default('account_credit'),
  officerId: Joi.string().uuid().optional().allow(null),
  notes: Joi.string().max(1000).optional().allow('', null),
});

export const approveLoanSchema = Joi.object({
  notes: Joi.string().max(500).optional().allow('', null),
});

export const rejectLoanSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required().label('Rejection reason'),
});

export const disburseLoanSchema = Joi.object({
  disbursementMethod: Joi.string()
    .valid('cash', 'mpesa', 'bank_transfer', 'account_credit')
    .required(),
  disbursementReference: Joi.string().max(100).optional().allow('', null),
  notes: Joi.string().max(500).optional().allow('', null),
});

export const repayLoanSchema = Joi.object({
  amount: Joi.number().positive().required().label('Repayment amount'),
  paymentMethod: Joi.string()
    .valid('cash', 'mpesa', 'bank_transfer', 'account_debit')
    .default('cash'),
  externalReference: Joi.string().max(100).optional().allow('', null),
  notes: Joi.string().max(500).optional().allow('', null),
});

export const addGuarantorSchema = Joi.object({
  memberId: Joi.string().uuid().required().label('Guarantor member'),
  amountGuaranteed: Joi.number().positive().required().label('Guaranteed amount'),
});

export const guarantorListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  memberId: Joi.string().uuid().optional(),
  loanId: Joi.string().uuid().optional(),
  status: Joi.string().valid('pending', 'accepted', 'declined', 'released').optional(),
});

export const restructureLoanSchema = Joi.object({
  newTermMonths: Joi.number().integer().min(1).max(120).required(),
  newInterestRate: Joi.number().min(0).max(100).optional(),
  reason: Joi.string().min(10).max(500).required(),
});

export const loanListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string()
    .valid('pending', 'under_review', 'approved', 'rejected', 'disbursed', 'completed', 'defaulted', 'restructured')
    .optional(),
  memberId: Joi.string().uuid().optional(),
  branchId: Joi.string().uuid().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  sort: Joi.string().optional(),
});
