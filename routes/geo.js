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
  filters.accounts,
  (req, res, next) => {
  const data = geoip.lookup(req.body.ip);

  if (!(data instanceof Object)) {
    return res.json({
      success: false,
      errors: {
        fields: {
          ip: 'IP address does not belong to any country',
        },
        type: 'VALIDATION_ERROR',
      },
    });
  }
  return res.json({
    success: true,
    data,
  });
});

app.use('/', router);