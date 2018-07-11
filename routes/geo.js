const express = require('express');
const router = express.Router();
const app = require(process.env.APP_FILE_PATH);
const config = require(process.env.CONFIG_PATH);
const {wrapper} = require(config.services_path);
const geoip = require('geoip-lite');

router.get('/', wrapper(async (req, res, next) => {
  const ip = "217.118.79.44";
  const geo = geoip.lookup(ip);

  return res.json({
    success: true,
    geo,
  });
}));

app.use('/', router);