const path = require('path');
const glob = require('glob');

const pathes = glob.sync(path.join(__dirname, '/*.js')).filter((m) => !m.endsWith('index.js'));

module.exports = pathes.reduce((filters, _path) => {
  const filter = require(_path);
  const filterName = path.basename(_path, '.js');
  return {
    [filterName]: filter,
    ...filters,
  };
}, {});