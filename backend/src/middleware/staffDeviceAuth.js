const env = require('../config/env');
const ApiError = require('../utils/apiError');

function requireStaffDevice(req, _res, next) {
  const provided = req.headers['x-staff-device-key'];
  if (!provided || provided !== env.staffDeviceApiKey) {
    return next(new ApiError(401, 'Invalid staff device key'));
  }
  next();
}

module.exports = { requireStaffDevice };
