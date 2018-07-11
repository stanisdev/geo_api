const express = require('express');
const router = express.Router();
const app = require(process.env.APP_FILE_PATH);
const config = require(process.env.CONFIG_PATH);
const filters = require(config.filters_path);
const geoip = require('geoip-lite');

/**
 * Получение данных о стране на основе IP адреса
 */
router.post('/', 
  filters.joi.post.validateIp,
  filters.auth,
  (req, res, next) => {
  const {ip} = req.body;
  const data = geoip.lookup(ip);

  if (!(data instanceof Object)) {
    return res.json({
      success: false,
      message: 'IP address does not belong to any country',
    });
  }
  return res.json({
    success: true,
    data,
  });
});

app.use('/', router);