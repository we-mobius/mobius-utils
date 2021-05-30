import { rootResolvePath } from '../scripts/utils.js'
import { getReleaseLoaders } from './loaders.config.js'
import { getReleasePlugins } from './plugins.config.js'

import CopyPlugin from 'copy-webpack-plugin'

import path from 'path'

const PATHS = {
  src: rootResolvePath('src'),
  output: rootResolvePath('release')
}

export const getReleaseConfig = () => ({
  mode: 'production',
  entry: {
    'mobius-utils': './src/main.js'
  },
  output: {
    filename: '[name].js',
    path: PATHS.output,
    // @refer: https://webpack.js.org/configuration/output/#outputlibrarytarget
    // @refer: https://webpack.js.org/configuration/output/#outputlibrarytype
    // libraryTarget: 'umd',
    library: {
      name: 'MobiusUtils',
      type: 'umd'
    },
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        oneOf: [...getReleaseLoaders()]
      }
    ]
  },
  plugins: [
    ...getReleasePlugins(),
    // CopyPlugin configurations: https://github.com/webpack-contrib/copy-webpack-plugin
    new CopyPlugin([
      {
        from: './src/statics/favicons/',
        // to 可以写相对 webpack.config.output.path 的路径，比如 './statics/favicons/'
        // 但 CopyPlugin 插件的文档中没有明确说明 to 最终路径的计算规则
        // 所以我个人推荐手动计算绝对路径，如下
        to: path.resolve(PATHS.output, './statics/favicons/'),
        toType: 'dir'
      },
      {
        from: './src/statics/fonts/',
        to: path.resolve(PATHS.output, './statics/fonts/'),
        toType: 'dir'
      },
      {
        from: './src/statics/images/',
        to: path.resolve(PATHS.output, './statics/images/'),
        toType: 'dir'
      },
      {
        from: './src/statics/styles/',
        to: path.resolve(PATHS.output, './statics/styles/'),
        toType: 'dir'
      }
    ])
  ],
  devtool: 'hidden-nosources-source-map'
}
)
