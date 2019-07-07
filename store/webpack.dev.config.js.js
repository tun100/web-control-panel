var _ = require('template/lodash');
var webpackFunc = require('./webpack/webpack.config')

module.exports = _.merge({},webpackFunc('dev'),{
    devtool: 'source-map',
});