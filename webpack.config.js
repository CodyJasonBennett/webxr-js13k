const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (_, { mode }) => ({
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
      filename: './index.html',
      minify: 'auto',
    }),
  ],
  devtool: mode === 'development' ? 'source-map' : undefined,
});
