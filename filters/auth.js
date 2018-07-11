const config = require(process.env.CONFIG_PATH);
const {wrapper} = require(config.services_path);
const db = require(process.env.DATABASE_PATH);

module.exports = wrapper(async (req, res, next) => {
  if (!config.registration_required) { // Открытый доступ к API
    return next();
  }
  const token = req.headers['x-auth-token'];
  try {
    if (typeof token !== 'string' || token.length !== config.auth_token_length) {
      throw new Error('Wrong auth token');
    }
  } catch (err) {
    return res.json({
      success: false,
      message: 'You are not authorized',
    })
  }
  next();
});