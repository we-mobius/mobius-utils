import { rootResolvePath } from '../scripts/utils.js'
import { getDevelopmentLoaders } from './loaders.config.js'
import { getDevelopmentPlugins } from './plugins.config.js'
import CopyPlugin from 'copy-webpack-plugin'
import path from 'path'

const PATHS = {
  output: rootResolvePath('dev')
}

const reusedConfigs = {
  mode: 'development',
  output: {
    path: PATHS.output
  },
  module: {
    rules: [
      {
        oneOf: [...getDevelopmentLoaders()]
      }
    ]
  },
  plugins: [
    ...getDevelopmentPlugins(),
    // CopyPlugin configurations: https://github.com/webpack-contrib/copy-webpack-plugin
    new CopyPlugin([
      {
        from: './src/statics/favicons/',
        // to 可以写相对 webpack.config.output.path 的路径，比如 './statics/favicons/'
        // 但 CopyPlugin 插件的文档中没有明确说明 to 最终路径的计算规则
        // 所以我个人推荐手动计算绝对路径，如下
        to: path.resolve(PATHS.output, './statics/favicons/'),
        toType: 'dir'
      }
    ])
  ],
  // devtool: 'eval-source-map',
  devtool: 'source-map',
  // ref: https://webpack.js.org/configuration/dev-server/
  // in ./scripts/dev.js
  devServer: {}
}

const webConfig = { ...reusedConfigs }

export const getDevelopmentConfig = () => ([{
  target: 'web',
  // node: {
  //   global: true
  // },
  entry: {
    // NOTE: entry sort matters style cascading
    static: './src/static.ts',
    index: './src/index.ts'
  },
  ...webConfig
}])
