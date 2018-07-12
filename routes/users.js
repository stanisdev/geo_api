const express = require('express');
const router = express.Router();
const app = require(process.env.APP_FILE_PATH);
const config = require(process.env.CONFIG_PATH);
const {wrapper} = require(config.services_path);
const db = require(config.database_path);
const filters = require(config.filters_path);
const only = require('only');
const randomString = require('randomstring');

/**
 * Registration
 */
router.post('/registration', wrapper(async (req, res, next) => {
  const result = await db.User.register(req.body);
  if (result.ok !== true) {
    return res.json({
      success: false,
      errors: {
        ...only(result, 'fields message type')
      },
    });
  }
  return res.json({
    success: true,
  });
}));

/**
 * Authorization
 */
// @TODO Add Joi validator
router.post('/auth', wrapper(async (req, res, next) => {
  const {body} = req;
  const user = await db.User.findOne({
    where: {
      email: body.email,
    },
  });
  const authFailed = () => {
    res.json({
      success: false,
      errors: {
        fields: {
          email: 'Wrong email/password',
        },
        type: 'VALIDATION_ERROR',
      },
    });
  };
  if (!(user instanceof Object)) {
    return authFailed();
  }
  const isValid = await user.checkPassword(body.password);
  if (!isValid) {
    return authFailed();
  }
  const now = Date.now();
  const userTokens = {
    user_id: user.get('id'),
    access_token: randomString.generate(config.access_token_length),
    refresh_token: randomString.generate(config.refresh_token_length),
    access_token_expired: now + config.access_token_expired,
    refresh_token_expired: now + config.refresh_token_expired,
    tariff: user.get('tariff'),
  };
  let result;
  try {
    result = await app.get('redis').UserToken.methods.addUser(userTokens);
  } catch(err) {
    return next(err);
  }
  result.session_id = result.id;
  result = only(result, 'session_id access_token refresh_token access_token_expired refresh_token_expired');
  res.json({
    success: true,
    data: result,
  });
}));

app.use('/users', router);