const { body, validationResult } = require('express-validator');
const { createError } = require('../../common/middleware/errorHandler');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array().map((e) => e.msg).join(', ');
    return next(createError(422, msg));
  }
  next();
}

const startRules = [
  body('memberId').trim().notEmpty().withMessage('memberId is required.'),
];

const searchRules = [
  body('query').trim().notEmpty().withMessage('query (title or ISBN) is required.'),
  body('actor').trim().notEmpty().withMessage('actor is required.'),
];

const checkoutRules = [
  body('isbn').trim().notEmpty().withMessage('isbn is required.'),
  body('actor').trim().notEmpty().withMessage('actor is required.'),
];

const returnRules = [
  body('actor').trim().notEmpty().withMessage('actor is required.'),
];

module.exports = { validate, startRules, searchRules, checkoutRules, returnRules };
