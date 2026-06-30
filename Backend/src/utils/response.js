/**
 * Standardized API response envelope used across all controllers.
 *
 *  Success:  { success: true,  message, data, meta }
 *  Error:    { success: false, message, errors }
 */

export const successResponse = (res, { message = 'Operation successful', data = null, meta = null, statusCode = 200 } = {}) => {
  const payload = { success: true, message, data };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

export const createdResponse = (res, { message = 'Resource created successfully', data = null } = {}) =>
  successResponse(res, { message, data, statusCode: 201 });

export const errorResponse = (res, { message = 'Operation failed', errors = [], statusCode = 400 } = {}) =>
  res.status(statusCode).json({ success: false, message, errors });

export const notFoundResponse = (res, message = 'Resource not found') =>
  errorResponse(res, { message, statusCode: 404 });

export const unauthorizedResponse = (res, message = 'Unauthorized') =>
  errorResponse(res, { message, statusCode: 401 });

export const forbiddenResponse = (res, message = 'Forbidden') =>
  errorResponse(res, { message, statusCode: 403 });

export const conflictResponse = (res, message = 'Resource already exists') =>
  errorResponse(res, { message, statusCode: 409 });

export const serverErrorResponse = (res, message = 'Internal server error') =>
  errorResponse(res, { message, statusCode: 500 });

export const paginatedResponse = (res, { message = 'Operation successful', data, page, limit, total } = {}) =>
  successResponse(res, {
    message,
    data,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
