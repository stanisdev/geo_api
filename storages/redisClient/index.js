const redis = require("redis");
const nohm = require('nohm').Nohm;
const path = require('path');
const glob = require('glob');

const config = require(process.env.CONFIG_PATH);
const {connection} = config.redis;
const redisClient = redis.createClient(connection);

module.exports = new Promise((res, rej) => {
  try {
    redisClient.once('connect', async () => {
      nohm.setPrefix('geo');
      nohm.setClient(redisClient);
    
      let models = glob.sync(path.join(__dirname, '/models/*.js'));
      models = models.reduce((models, currModel) => {
        const modelName = path.basename(currModel, '.js');
        return {
          [modelName]: require(currModel),
        };
      }, {});
      console.log('Redis Client was connected successfully');
      res(models);
    });
  } catch (err) {
    rej(err);
  }
});
