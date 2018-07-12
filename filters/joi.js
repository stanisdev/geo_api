const Joi = require('joi');
const only = require('only');

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
    }
  },
};