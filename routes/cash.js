const express = require('express');
const router = express.Router();
const app = require(process.env.APP_FILE_PATH);
const config = require(process.env.CONFIG_PATH);
const services = require(config.services_path);
const {wrapper} = services;
const filters = require(config.filters_path);
const db = require(process.env.DATABASE_PATH);

/**
 * Внесение денег на счет. Метод эмулирующий такого рода операцию
 */
// @TODO проверка, что аккаунт должен относиться к платному
router.post('/deposit',
  filters.auth,
  filters.users.findUser,
  filters.users.paidAccountOnly,
  filters.joi.post.deposit,
  wrapper(async (req, res, next) => {
  const userId = req.user.get('id');
  const {expiredDate} = await db.UserCash.deposit(userId, req.body.amount);
  
  // Продлить дату истечения платного аккаунта в Redis
  req.userTokens.property({ paid_account_expired: expiredDate });
  await req.userTokens.save();
  res.json({
    success: true,
  });
}));

app.use('/cash', router);