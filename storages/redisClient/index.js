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
    
      module.exports = {
        client: redisClient,
      };
    
      let models = glob.sync(path.join(__dirname, '/models/*.js'));
      models = models.reduce((models, currModel) => {
        const modelName = path.basename(currModel, '.js');
        return {
          [modelName]: require(currModel),
        };
      }, {});
      
      // models.UserToken.methods.addUser({
      //   user_id: 10,
      //   access_token: 'EIOIEOQIOEQI',
      // });
      console.log('Redis Client was connected successfully');
      res(models);
    
    
      // const data = await models['Name'].find();
      // console.log(data);
    
      // const user = new User();
      // const data = await user.load('54946090-859d-11e8-990d-59e5e693dc92');
      // console.log(data);
    
      // const user = new User();
      // user.property({
      //   user_id: 10,
      //   email: 'john@example.com',
      // });
      // try {
      //   const d = await user.save();
      //   console.log('SAVED');
      //   console.log(user.allPropertiesCache);
      // } catch (error) {
      //   if (error instanceof nohm.ValidationError) {
      //     console.log(error);
      //   }
      // }
    });
  } catch (err) {
    rej(err);
  }
});
