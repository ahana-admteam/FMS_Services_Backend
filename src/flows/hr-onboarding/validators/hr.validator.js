const { body, validationResult } = require('express-validator');
const { createError } = require('../../../common/middleware/errorHandler');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError(422, errors.array().map((e) => e.msg).join(', ')));
  }
  next();
}

const startRules = [
  body('employeeId').trim().notEmpty().withMessage('employeeId is required.'),
  body('name').trim().notEmpty().withMessage('name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('department').trim().notEmpty().withMessage('department is required.'),
  body('role').trim().notEmpty().withMessage('role is required.'),
  body('managerId').trim().notEmpty().withMessage('managerId is required.'),
  body('joiningDate').isISO8601().withMessage('joiningDate must be a valid ISO date.'),
  body('triggeredBy').trim().notEmpty().withMessage('triggeredBy (HR userId) is required.'),
];

const documentRules = [
  body('documents').isObject().withMessage('documents must be an object.'),
  body('actor').trim().notEmpty().withMessage('actor is required.'),
];

const approvalRules = [
  body('decision').isIn(['approved', 'rejected']).withMessage('decision must be "approved" or "rejected".'),
  body('actor').trim().notEmpty().withMessage('actor is required.'),
  body('note').optional().isString(),
];

module.exports = { validate, startRules, documentRules, approvalRules };
