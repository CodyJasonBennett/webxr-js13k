const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (_, { mode }) => ({
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: './index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        minifyURLs: true,
      },
    }),
  ],
  devtool: mode === 'development' ? 'source-map' : undefined,
});
