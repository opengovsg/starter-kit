const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const GlobEntries = require('webpack-glob-entries')

module.exports = {
  mode: 'production',
  entry: GlobEntries(path.join(__dirname, '*.test.ts')),
  output: {
    path: path.join(__dirname, 'build'),
    libraryTarget: 'commonjs',
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-typescript'],
            plugins: [
              '@babel/plugin-transform-class-properties',
              '@babel/plugin-transform-object-rest-spread',
            ],
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  externals: /^(k6|https?\:\/\/)(\/.*)?(?!-trpc)/,
  stats: {
    colors: true,
  },
  plugins: [new CleanWebpackPlugin()],
  optimization: {
    // Don't minimize, as it's not used in the browser
    minimize: false,
  },
}
