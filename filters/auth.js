const config = require(process.env.CONFIG_PATH);
const {wrapper} = require(config.services_path);
const app = require(process.env.APP_FILE_PATH);

class AuthFilter {
  /**
   * Constructor
   */
  constructor(req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
    this.token = req.headers['x-auth-token'];
    this.sessionId = req.headers['session-id'];
    this.redis = app.get('redis');
    this.now = Date.now();
  }
  /**
   * Run
   */
  async run() {
    if (
      typeof this.token !== 'string' ||
      typeof this.sessionId !== 'string' ||
      this.token.length !== config.access_token_length
    ) {
      return this.notAuthorized();
    }
    // Загрузить токены из Redis по ключу/id
    try {
      this.userTokens = await this.redis.UserToken.methods.findById(this.sessionId);
    } catch (err) {
      return this.notAuthorized();
    }
    
    if (this.userTokens.property('access_token') !== this.token) { // Неверный токен
      return this.notAuthorized();
    }
    if (this.now >= +this.userTokens.property('access_token_expired')) { // Токен истек, удалить запись в Redis
      await this.userTokens.remove();
      return this.notAuthorized();
    }
    this.req.userTokens = this.userTokens;
    this.next();
  }
  /**
   * Not authorized response
   */
  notAuthorized() {
    this.res.json({
      success: false,
      errors: {
        type: 'NOT_AUTHORIZED',
      },
    });
  }
}

module.exports = wrapper(async (req, res, next) => {
  if (!config.registration_required) { // Открытый доступ к API
    return next();
  }
  const auth = new AuthFilter(req, res, next);
  auth.run();
});