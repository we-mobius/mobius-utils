const path = require('path')
const { production: productionPlugins } = require('./plugins.config')
const { production: productionLoaders } = require('./loaders.config')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const { publicPath } = require('./mobius.config.js')

const PATHS = {
  src: path.resolve(process.cwd(), 'src'),
  output: path.resolve(process.cwd(), 'dist')
}

module.exports = {
  mode: 'production',
  // NOTE: entry sort matters style cascading
  entry: {
    static: './src/static.js',
    main: './src/main.js'
  },
  output: {
    filename: '[name].[contenthash:7].js',
    path: PATHS.output,
    publicPath: publicPath
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // 添加在 CSS 文件中引用的其它资源路径的前面，可用于配置 CDN，不如 file-loader 设置的 publicPath 优先
              // publicPath: 'https://cdn.cigaret.world/'
            }
          },
          'css-loader',
          'postcss-loader'
        ],
        sideEffects: true
      },
      {
        oneOf: [...productionLoaders]
      }
    ]
  },
  plugins: [
    ...productionPlugins,
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash:10].css',
      chunkFilename: 'styles/[id].[contenthash:10].css'
    }),
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
        from: './src/statics/styles/fonts/',
        to: path.resolve(PATHS.output, './statics/styles/fonts/'),
        toType: 'dir'
      }
    ])
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        sourceMap: true,
        terserOptions: {
          compress: {
            drop_debugger: true,
            drop_console: true
          },
          format: {
            comments: false
          }
        }
      })
    ]
  },
  devtool: 'source-map'
  // devtool: 'hidden-nosources-source-map'
}
