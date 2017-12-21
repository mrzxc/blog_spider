const path = require('path');


const config = {

  entry: {
    react: path.resolve(__dirname, '../src/client/index.js'),
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../dist/asset')
  },
};

module.exports = config;
