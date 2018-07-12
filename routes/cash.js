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
// @TODO Add Joi validator (amount)
// @TODO проверка, что бы вносимая сумма была не меньше чем на 1 сутки
router.post('/deposit', 
  filters.auth,
  filters.users.findUser,
  wrapper(async (req, res, next) => {
  const userId = req.user.get('id');
  await db.UserCash.deposit(userId, req.body.amount);
  res.json({
    success: true,
  });
}));

app.use('/cash', router);