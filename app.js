const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const glob = require('glob');
const path = require('path');
const configPath = path.join(__dirname + '/config/config');
const helmet = require('helmet');

const app = express();
const config = require(configPath);

app.use(helmet());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

process.env.CONFIG_PATH = configPath;
process.env.APP_FILE_PATH = path.join(__dirname, '/app.js');
process.env.DATABASE_PATH = config.database_path;
module.exports = app;

/**
 * Load routes
 */
const routes = glob.sync(config.routes_path + '/*.js');
routes.forEach((route) => {
  require(route);
});

const {errors} = require(config.services_path);
errors();