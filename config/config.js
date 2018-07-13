const path = require('path');
const rootDir = path.dirname(__dirname);

module.exports = {
  root_dir: rootDir,
  port_default: 3000,
  routes_path: path.join(rootDir, '/routes'),
  services_path: path.join(rootDir, '/services'),
  filters_path: path.join(rootDir, '/filters'),
  database_path: path.join(rootDir, '/storages/database/models'),
  registration_required: true,
  access_token_length: 25,
  refresh_token_length: 40,
  access_token_expired: 86400000, // сутки
  refresh_token_expired: 86400000 * 30, // месяц
  redis: {
    client_path: path.join(rootDir, '/storages/redisClient'),
    connection: {
      host: '127.0.0.1',
      password: undefined,
      port: 6379,
      db: 0,
    },
  },
  cost_paid_account_per_day: 10,
  requests_per_hour_for_free_account: 5,
};