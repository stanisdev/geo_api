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
  auth_token_length: 40,
  refresh_token_length: 40,
};