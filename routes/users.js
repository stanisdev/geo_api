const express = require('express');
const router = express.Router();
const app = require(process.env.APP_FILE_PATH);
const config = require(process.env.CONFIG_PATH);
const {wrapper} = require(config.services_path);
const db = require(config.database_path);
const only = require('only');

/**
 * Registration
 */
router.post('/registration', wrapper(async (req, res, next) => {
  const result = await db.User.register(req.body);
  if (result.ok !== true) {
    return res.json({
      success: false,
      errors: {
        ...only(result, 'fields message type')
      },
    });
  }
  return res.json({
    success: true,
  });
}));

app.use('/users', router);