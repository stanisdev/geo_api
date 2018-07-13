const config = require(process.env.CONFIG_PATH);
const {wrapper} = require(config.services_path);
const app = require(process.env.APP_FILE_PATH);

class AccountsFilter {
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
    this.now = Date.now();
    this.userTokens = req.userTokens;
  }
  /**
   * Run
   */
  async run() {
    const tariff = +this.userTokens.property('tariff');
    if (tariff === 1 && await this.checkFreeAccountRequestsLimit() !== true) { // Бесплатный
      retun;
    }
    if (tariff === 2 && this.now >= +this.userTokens.property('paid_account_expired')) {
      // Если возможность использования платного тарифа подошла к концу,
      // (исходя их timestamp, который хранится в Redis), то необходимо убедиться,
      // что тот же пользователь с другого устройства и под другим токеном, не
      // внес дополнительно оплату и не продлил ли её. Если так, то посмотрим в БД,
      // и найдя ответ на вопрос удовлетворительным, обновим timestamp истечения
      // платного аккаунта, опираясь на полученные данные из БД.
      const cash = await db.UserCash.findOne({
        where: {
          user_id: this.userTokens.property('user_id'),
          attributes: ['expired'],
        },
      });
      if (!(cash instanceof Object)) {
        return this.fundAccount();
      }
      const expired = new Date(cash.get('expired')).getTime();
      if (expired > this.now) { // Да, пользование платным аккаунтом продлено
        await this.redis.UserToken.methods.updatePropertiesById(this.sessionId, {
          paid_account_expired: expired,
        });
      }
      else {
        return this.paidAccountExpired();
      }
    }
    this.done();
  }
  /**
   * Check free account limit on requests
   */
  async checkFreeAccountRequestsLimit() {
    const from = +this.userTokens.property('сounting_requests_from');  // 3600000 - час
    const counter = +this.userTokens.property('request_counter');
    if (this.now >= (from + 3600000)) { // Обновим метку отсчета (запросов в час)
      await this.extendRequestCounting();
    }
    else if (counter >= config.requests_per_hour_for_free_account) { // Превышено
      this.res.json({
        success: false,
        errors: {
          type: 'EXCEEDED_REQUESTS_NUMBER_PER_HOUR',
        },
      });
      return false;
    }
    else { // Накрутить счетчик запросов
      await this.increaseRequestsCount(counter + 1);
    }
    return true;
  }
  /**
   * Extend request counting
   */
  extendRequestCounting() {
    this.userTokens.property({
      request_counter: 1,
      сounting_requests_from: Date.now() + 3600000,
    });
    return this.userTokens.save();
  }
  /**
   * Increase requests count
   */
  increaseRequestsCount(count) { // counter + 1
    this.userTokens.property({
      request_counter: count,
    });
    return this.userTokens.save();
  }
  /**
   * Verification was successful
   */
  done() {
    this.req.userTokens = this.userTokens;
    this.next();
  }
  /**
   * Not authorized response
   */
  fundAccount() {
    this.res.json({
      success: false,
      errors: {
        type: 'FUND_ACCOUNT',
      },
    });
  }
  paidAccountExpired() {
    this.res.json({
      success: false,
      errors: {
        type: 'PAID_ACCOUNT_EXPIRED',
      },
    });
  }
}

module.exports = wrapper(async (req, res, next) => {
  if (!config.registration_required) {
    return next();
  }
  const filter = new AccountsFilter(req, res, next);
  filter.run();
});