const path = require('path');
const glob = require('glob');

const pathes = glob.sync(path.join(__dirname, '/*.js')).filter((m) => !m.endsWith('index.js'));

module.exports = pathes.reduce((services, _path) => {
  const service = require(_path);
  const serviceName = path.basename(_path, '.js');
  return {
    [serviceName]: service,
    ...services,
  };
}, {});