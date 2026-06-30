import Joi from 'joi';

export const createBranchSchema = Joi.object({
  name: Joi.string().min(2).max(150).required().label('Branch name'),
  code: Joi.string().alphanum().min(2).max(20).required().label('Branch code'),
  email: Joi.string().email().optional().allow('', null),
  phone: Joi.string().pattern(/^\+?[\d\s\-]{9,15}$/).optional().allow('', null),
  address: Joi.string().max(500).optional().allow('', null),
  county: Joi.string().max(100).optional().allow('', null),
  town: Joi.string().max(100).optional().allow('', null),
  isHeadquarters: Joi.boolean().optional().default(false),
});

export const updateBranchSchema = Joi.object({
  name: Joi.string().min(2).max(150).optional(),
  email: Joi.string().email().optional().allow('', null),
  phone: Joi.string().pattern(/^\+?[\d\s\-]{9,15}$/).optional().allow('', null),
  address: Joi.string().max(500).optional().allow('', null),
  county: Joi.string().max(100).optional().allow('', null),
  town: Joi.string().max(100).optional().allow('', null),
  status: Joi.string().valid('active', 'inactive').optional(),
  isHeadquarters: Joi.boolean().optional(),
});

export const assignManagerSchema = Joi.object({
  managerId: Joi.string().uuid().required().label('Manager'),
});
