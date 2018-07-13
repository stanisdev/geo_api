const nohm = require('nohm').Nohm;
const config = require(process.env.CONFIG_PATH);
const {client} = require(config.redis.client_path);
const randomString = require('randomstring');

const model = nohm.model('UserToken', {
  properties: {
    user_id: {
      type: 'integer',
    },
    access_token: {
      type: 'string',
    },
    refresh_token: {
      type: 'string',
    },
    access_token_expired: {
      type: 'timestamp',
    },
    refresh_token_expired: {
      type: 'timestamp',
    },
    tariff: {
      type: 'integer',
    },
    paid_account_expired: {
      type: 'timestamp',
    }
  },
  client,
});

module.exports = {
  model,
  methods: {
    addUser(data) {
      return new Promise(async (res, rej) => {
        const instance = new model();
        instance.property(data);
        try {
          await instance.save();
          res(instance.allPropertiesCache);
        } catch (err) {
          rej(err);
        }
      });
    },
    async updatePropertiesById(id, properties) {
      const instance = new model();
      await instance.load(id);
      instance.property(properties);
      return await instance.save();
    },
    async findById(id) {
      const instance = new model();
      await instance.load(id);
      return instance;
    },
    generateTokens() {
      const now = Date.now();
      return {
        access_token: randomString.generate(config.access_token_length),
        refresh_token: randomString.generate(config.refresh_token_length),
        access_token_expired: now + config.access_token_expired,
        refresh_token_expired: now + config.refresh_token_expired,
      };
    }
  }
};