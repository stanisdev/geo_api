const config = require(process.env.CONFIG_PATH);
const {wrapper} = require(config.services_path);
const app = require(process.env.APP_FILE_PATH);

module.exports = wrapper(async (req, res, next) => {
  if (!config.registration_required) { // Открытый доступ к API
    return next();
  }
  const token = req.headers['x-auth-token'];
  const sessionId = req.headers['session_id'];
  try {
    if (
      typeof token !== 'string' ||
      typeof sessionId !== 'string' ||
      token.length !== config.access_token_length
    ) {
      throw new Error('Wrong access token');
    }
    const UserToken = app.get('redis').UserToken.model;
    const user = new UserToken();
    const userTokens = await user.load(sessionId); // Загрузить токены из Redis по ключу
    
    if (userTokens.access_token !== token) {
      throw new Error('The transmitted access token is incorrect');
    }
    if (Date.now() >= +userTokens.access_token_expired) { // Токен истек, удалить запись в Redis
      await UserToken.remove(sessionId);
      throw new Error('Access token expired');
    }
    req.userTokens = userTokens;
  } catch (err) {
    return res.json({
      success: false,
      errors: {
        type: 'NOT_AUTHORIZED',
      },
    })
  }
  next();
});