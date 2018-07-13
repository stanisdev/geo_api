const express = require('express');
const router = express.Router();
const app = require(process.env.APP_FILE_PATH);
const config = require(process.env.CONFIG_PATH);
const {wrapper} = require(config.services_path);
const db = require(config.database_path);
const only = require('only');

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
  const redis = app.get('redis');
  const tokens = redis.UserToken.methods.generateTokens();
  const userTokens = {
    ...tokens,
    user_id: user.get('id'),
    tariff: user.get('tariff'),
  };
  if (user.isFreeAccount()) {
    userTokens.request_counter = 0;
    userTokens.сounting_requests_from = Date.now() + 3600000;
  }
  try {
    result = await app.get('redis').UserToken.methods.addUser(userTokens);
    tokens.session_id = result.id;
  } catch(err) {
    return next(err);
  }
  res.json({
    success: true,
    data: tokens,
  });
}));

/**
 * Update access and refresh tokens
 */
// @TODO Add Joi validator
router.post('/update_tokens', wrapper(async (req, res, next) => {
  const {body} = req;
  const refreshToken = body.refresh_token;
  const redis = app.get('redis');
  let userTokens;
  try {
    userTokens = await redis.UserToken.methods.findById(body.session_id);
    if (refreshToken !== userTokens.property('refresh_token')) { // Неверный Refresh токен
      throw new Error('Invalid refresh token');
    }
    if (Date.now() >= userTokens.property('refresh_token_expired')) { // Refresh токен истек, удалить
      await userTokens.remove();
      throw new Error('Refresh token expired');
    }
  } catch (err) {
    return res.json({
      success: false,
      errors: {
        type: 'CAN_NOT_UPDATE_TOKENS',
      },
    });
  }
  const newTokens = redis.UserToken.methods.generateTokens(); // Обновим токены
  userTokens.property(newTokens);
  await userTokens.save();
  return res.json({
    success: true,
    data: newTokens,
  });
}));

app.use('/users', router);