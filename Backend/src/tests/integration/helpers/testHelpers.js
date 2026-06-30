/**
 * Schema validation helper used by integration tests.
 * Runs Joi validators without requiring a live server or DB.
 */
import {
  registerOrgSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../../../validators/authValidator.js';
import {
  registerMemberSchema,
  updateMemberSchema,
  addNextOfKinSchema,
  suspendMemberSchema,
} from '../../../validators/memberValidator.js';
import {
  depositSchema,
  withdrawalSchema,
  transferSchema,
  createAccountSchema,
} from '../../../validators/savingsValidator.js';
import {
  createBranchSchema,
  updateBranchSchema,
} from '../../../validators/branchValidator.js';

const schemaMap = {
  register: registerOrgSchema,
  login: loginSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
  changePassword: changePasswordSchema,
  registerMember: registerMemberSchema,
  updateMember: updateMemberSchema,
  addNextOfKin: addNextOfKinSchema,
  suspendMember: suspendMemberSchema,
  deposit: depositSchema,
  withdrawal: withdrawalSchema,
  transfer: transferSchema,
  createSavingsAccount: createAccountSchema,
  createBranch: createBranchSchema,
  updateBranch: updateBranchSchema,
};

export const validatePayload = (payload, schemaKey) => {
  const schema = schemaMap[schemaKey];
  if (!schema) throw new Error(`Unknown schema key: ${schemaKey}`);

  const { error, value } = schema.validate(payload, { abortEarly: false, stripUnknown: true });
  if (error) {
    return {
      valid: false,
      errors: error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      })),
      value: null,
    };
  }
  return { valid: true, errors: [], value };
};

export const buildAuthHeader = (token = 'test-access-token') => ({
  Authorization: `Bearer ${token}`,
});

export const mockUserJwt = (overrides = {}) => ({
  id: 'user-uuid-001',
  email: 'admin@sacco.co.ke',
  role: 'sacco_admin',
  organizationId: 'org-uuid-001',
  branchId: 'branch-uuid-001',
  permissions: [],
  ...overrides,
});
