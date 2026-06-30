import Joi from 'joi';

export const createAccountSchema = Joi.object({
  memberId: Joi.string().uuid().required().label('Member'),
  branchId: Joi.string().uuid().required().label('Branch'),
  accountType: Joi.string().valid('ordinary', 'share_capital', 'fixed_deposit').required(),
  interestRate: Joi.number().min(0).max(100).optional().default(0),
  minimumBalance: Joi.number().min(0).optional().default(0),
  // Fixed deposit specific
  fixedDepositAmount: Joi.when('accountType', {
    is: 'fixed_deposit',
    then: Joi.number().positive().required().label('Fixed deposit amount'),
    otherwise: Joi.optional().allow(null),
  }),
  fixedDepositDurationMonths: Joi.when('accountType', {
    is: 'fixed_deposit',
    then: Joi.number().integer().min(1).max(120).required().label('Duration (months)'),
    otherwise: Joi.optional().allow(null),
  }),
  autoRenew: Joi.boolean().optional().default(false),
});

export const depositSchema = Joi.object({
  accountId: Joi.string().uuid().required().label('Account'),
  amount: Joi.number().positive().max(10000000).required().label('Amount'),
  paymentMethod: Joi.string().valid('cash', 'mpesa', 'bank_transfer', 'cheque').default('cash'),
  externalReference: Joi.string().max(100).optional().allow('', null).label('Reference'),
  description: Joi.string().max(255).optional().allow('', null),
});

export const withdrawalSchema = Joi.object({
  accountId: Joi.string().uuid().required().label('Account'),
  amount: Joi.number().positive().max(10000000).required().label('Amount'),
  paymentMethod: Joi.string().valid('cash', 'mpesa', 'bank_transfer', 'cheque').default('cash'),
  externalReference: Joi.string().max(100).optional().allow('', null),
  description: Joi.string().max(255).optional().allow('', null),
});

export const transferSchema = Joi.object({
  fromAccountId: Joi.string().uuid().required().label('Source account'),
  toAccountId: Joi.string().uuid().required().label('Destination account'),
  amount: Joi.number().positive().max(10000000).required().label('Amount'),
  description: Joi.string().max(255).optional().allow('', null),
});

export const reversalSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required().label('Reversal reason'),
});

export const transactionQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  type: Joi.string().valid('deposit', 'withdrawal', 'transfer', 'loan_repayment', 'interest_credit', 'penalty', 'reversal', 'fee').optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
  branchId: Joi.string().uuid().optional(),
});
