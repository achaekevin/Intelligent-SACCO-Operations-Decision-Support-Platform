import Joi from 'joi';

const password = Joi.string()
  .min(8)
  .max(72)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  .messages({
    'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character.',
  });

export const registerOrgSchema = Joi.object({
  orgName: Joi.string().min(3).max(150).required().label('Organization name'),
  orgCode: Joi.string().alphanum().min(3).max(20).required().label('Organization code'),
  orgEmail: Joi.string().email().required().label('Organization email'),
  orgPhone: Joi.string().pattern(/^\+?[\d\s\-]{9,15}$/).required().label('Organization phone'),
  adminFirstName: Joi.string().min(2).max(100).required().label('Admin first name'),
  adminLastName: Joi.string().min(2).max(100).required().label('Admin last name'),
  adminEmail: Joi.string().email().required().label('Admin email'),
  adminPhone: Joi.string().pattern(/^\+?[\d\s\-]{9,15}$/).required().label('Admin phone'),
  adminPassword: password.required().label('Admin password'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().label('Email'),
  password: Joi.string().required().label('Password'),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().label('Email'),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().label('Reset token'),
  newPassword: password.required().label('New password'),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().label('Current password'),
  newPassword: password.required().label('New password'),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    .messages({ 'any.only': 'Passwords do not match.' }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().label('Refresh token'),
  userId: Joi.string().uuid().required().label('User ID'),
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().required().label('Verification token'),
});
