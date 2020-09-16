const path = require('path')
const resolve = dir => path.resolve(__dirname, '../', dir)

module.exports = {
  output: {
    filename: '[name].js',
    publicPath: '/'
  },
  module: {
    rules: []
  },
  plugins: [],
  resolve: {
    extensions: ['.js'],
    alias: {
      Libs: resolve('src/libs/'),
      MobiusUI$: resolve('src/libs/mobius-ui.js'),
      MobiusJS$: resolve('src/libs/mobius-js.js'),
      Interface: resolve('src/interface/'),
      Business: resolve('src/business/')
    },
    symlinks: false
  }
}
