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
    this.sessionId = req.headers['session_id'];
    this.redis = app.get('redis');
    this.url = req.originalUrl;
    this.method = req.method.toLowerCase();
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
    let userTokens;
    try {
      userTokens = await this.redis.UserToken.methods.findById(this.sessionId);
    } catch (err) {
      return this.notAuthorized();
    }
    
    if (userTokens.property('access_token') !== this.token) { // Неверный токен
      return this.notAuthorized();
    }
    if (this.now >= +userTokens.property('access_token_expired')) { // Токен истек, удалить запись в Redis
      await UserToken.remove(this.sessionId);
      return this.notAuthorized();
    }
    if (
      this.url === '/' &&
      this.method === 'post' &&
      +userTokens.property('tariff') === 2 && 
      this.now >= +userTokens.property('paid_account_expired')
    ) {
      // Если возможность использования платного тарифа подошла к концу,
      // (исходя их timestamp, который хранится в Redis), то необходимо убедиться,
      // что тот же пользователь с другого устройства и под другим токеном, не
      // внес дополнительно оплату и не продлил ли её. Если так, то посмотрим в БД,
      // и найдя ответ на вопрос удовлетворительным, обновим timestamp истечения
      // платного аккаунта, опираясь на полученные данные из БД.
      const cash = await db.UserCash.findOne({
        where: {
          user_id: userTokens.property('user_id'),
          attributes: ['expired'],
        },
      });
      if (!(cash instanceof Object)) {
        return this.notAuthorized();
      }
      const expired = new Date(cash.get('expired')).getTime();
      if (expired > this.now) { // Да, пользование платным аккаунтом продлено
        await this.redis.UserToken.methods.updatePropertiesById(this.sessionId, {
          paid_account_expired: expired,
        });
      }
      else {
        return this.res.json({
          success: false,
          errors: {
            type: 'PAID_ACCOUNT_EXPIRED',
          },
        });
      }
    }
    this.req.userTokens = userTokens;
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