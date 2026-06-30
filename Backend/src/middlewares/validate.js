import { ValidationError } from '../utils/errors.js';

/**
 * Validates req.body | req.params | req.query against a Joi schema.
 *
 * Usage:
 *   router.post('/', validate(schemas.register), controller.register)
 *   router.get('/:id', validate(schemas.idParam, 'params'), controller.get)
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message.replace(/['"]/g, ''),
    }));
    return next(new ValidationError('Validation failed', errors));
  }

  req[source] = value; // replace with sanitized/coerced values
  next();
};

export default validate;
