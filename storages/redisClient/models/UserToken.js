const nohm = require('nohm').Nohm;
const config = require(process.env.CONFIG_PATH);
const {client} = require(config.redis.client_path);

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
    paid_up_to: {
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
    }
  }
};