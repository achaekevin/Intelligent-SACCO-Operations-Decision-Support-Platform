import Joi from 'joi';

const kenyanPhone = Joi.string()
  .pattern(/^(\+254|254|0)[7][0-9]{8}$/)
  .messages({ 'string.pattern.base': 'Enter a valid Kenyan phone number e.g. 0712345678' });

export const registerMemberSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required().label('First name'),
  lastName: Joi.string().min(2).max(100).required().label('Last name'),
  otherNames: Joi.string().max(100).optional().label('Other names'),
  email: Joi.string().email().optional().allow('', null).label('Email'),
  phone: kenyanPhone.required().label('Phone number'),
  alternativePhone: kenyanPhone.optional().allow('', null),
  nationalId: Joi.string().min(7).max(30).required().label('National ID'),
  dateOfBirth: Joi.date().max('now').optional().label('Date of birth'),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  maritalStatus: Joi.string().valid('single', 'married', 'divorced', 'widowed').optional(),
  occupation: Joi.string().max(150).optional().label('Occupation'),
  employer: Joi.string().max(150).optional().label('Employer'),
  monthlyIncome: Joi.number().positive().optional().label('Monthly income'),
  address: Joi.string().max(500).optional().label('Address'),
  county: Joi.string().max(100).optional().label('County'),
  subCounty: Joi.string().max(100).optional(),
  town: Joi.string().max(100).optional().label('Town'),
  postalAddress: Joi.string().max(100).optional(),
  joiningDate: Joi.date().optional().label('Joining date'),
  notes: Joi.string().max(1000).optional(),
  branchId: Joi.string().uuid().required().label('Branch'),
});

export const updateMemberSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).optional(),
  lastName: Joi.string().min(2).max(100).optional(),
  otherNames: Joi.string().max(100).optional().allow('', null),
  email: Joi.string().email().optional().allow('', null),
  phone: kenyanPhone.optional(),
  alternativePhone: kenyanPhone.optional().allow('', null),
  occupation: Joi.string().max(150).optional().allow('', null),
  employer: Joi.string().max(150).optional().allow('', null),
  monthlyIncome: Joi.number().positive().optional().allow(null),
  address: Joi.string().max(500).optional().allow('', null),
  county: Joi.string().max(100).optional().allow('', null),
  town: Joi.string().max(100).optional().allow('', null),
  notes: Joi.string().max(1000).optional().allow('', null),
});

export const addNextOfKinSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  relationship: Joi.string().max(50).required(),
  phone: kenyanPhone.required(),
  email: Joi.string().email().optional().allow('', null),
  nationalId: Joi.string().max(30).optional().allow('', null),
  address: Joi.string().max(500).optional().allow('', null),
  sharePercentage: Joi.number().min(1).max(100).optional(),
  isPrimary: Joi.boolean().optional(),
});

export const suspendMemberSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required().label('Suspension reason'),
});

export const memberListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().max(100).optional().allow('', null),
  status: Joi.string().valid('active', 'inactive', 'suspended', 'pending').optional(),
  branchId: Joi.string().uuid().optional(),
  sort: Joi.string().optional(),
});
