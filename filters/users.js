const config = require(process.env.CONFIG_PATH);
const {wrapper} = require(config.services_path);
const db = require(process.env.DATABASE_PATH);

module.exports = {
  findUser: wrapper(async (req, res, next) => {
    const userId = req.userTokens.property('user_id');
    const user = await db.User.findById(userId);
    if (!(user instanceof Object)) {
      return next(new Error(`No user with ID=${userId} was found`));
    }
    req.user = user;
    next();
  })
};