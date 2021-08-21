const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (_, { mode }) => ({
  externals:
    mode === 'production'
      ? {
          three: 'THREE',
        }
      : undefined,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      templateParameters: {
        CDN: mode === 'production',
      },
      filename: './index.html',
      minify: 'auto',
    }),
  ],
  devtool: 'source-map',
  optimization: {
    usedExports: true,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 2018,
          toplevel: true,
          mangle: {
            toplevel: true,
          },
          compress: {
            passes: 5,
            unsafe: true,
            pure_getters: true,
          },
        },
      }),
    ],
  },
});
