const ApiError = require('../utils/apiError');
const { cleanObject } = require('../utils/security');

function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse({ body: cleanObject(req.body), query: req.query, params: req.params });
    if (!result.success) {
      return next(new ApiError(400, 'Validation failed', result.error.flatten()));
    }
    req.body = result.data.body || req.body;
    req.query = result.data.query || req.query;
    req.params = result.data.params || req.params;
    next();
  };
}

module.exports = validate;
