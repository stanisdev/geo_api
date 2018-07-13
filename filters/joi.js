const Joi = require('joi');
const only = require('only');
const config = require(process.env.CONFIG_PATH);

module.exports = {
  post: {
    validateIp(req, res, next) {
      const schema = {
        ip: Joi.string().required().ip({
          version: [
            'ipv4',
            'ipv6'
          ]
        }),
      };
      let result = Joi.validate(only(req.body, 'ip'), schema);
      if (result.error !== null) {
        return res.json({
          success: false,
          errors: {
            fields: {
              ip: 'Invalid IP address value',
            },
            type: 'VALIDATION_ERROR',
          },
        });
      }
      next();
    },
    checkTokensCorrectness(req, res, next) {
      const schema = {
        refresh_token: Joi.string().required(),
        session_id: Joi.string().required(),
      };
      let result = Joi.validate(only(req.body, 'refresh_token session_id'), schema);
      if (result.error !== null) {
        return res.json({
          success: false,
          errors: {
            type: 'INVALID_TRANSMITTED_DATA',
          },
        });
      }
      next();
    },
    checkAuthData(req, res, next) {
      const fields = {};
      let result = Joi.validate(only(req.body, 'email'), {
        email: Joi.string().email().required(),
      });
      if (result.error !== null) {
        fields.email = 'Email has an incorrect format';
      }
      result = Joi.validate(only(req.body, 'password'), {
        password: Joi.string().required(),
      });
      if (result.error !== null) {
        fields.password = 'Password is empty';
      }
      if (Object.keys(fields).length > 0) {
        return res.json({
          success: false,
          errors: {
            fields,
            type: 'VALIDATION_ERROR',
          },
        });
      }
      next();
    },
    deposit(req, res, next) {
      let result = Joi.validate(only(req.body, 'amount'), {
        amount: Joi.number().required(),
      });
      let message = '';
      if (result.error !== null) {
        message = 'Invalid amount value';
      }
      else if (req.body.amount < config.cost_paid_account_per_day) {
        message = 'The amount invoiced must at least pay for using the account for a day';
      }
      if (message.length > 0) {
        return res.json({
          success: false,
          errors: {
            fields: {
              amount: message,
            },
            type: 'VALIDATION_ERROR',
          },
        });
      }
      next();
    }
  },
};