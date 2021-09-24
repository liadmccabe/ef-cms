const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  externals: ['aws-sdk', 'chrome-aws-lambda', 'pug'],
  mode: 'production',
  module: {
    rules: [
      {
        exclude: /node_modules/,
        // eslint-disable-next-line
        test: /\.(jsx)$/,
        use: ['babel-loader'],
      },
      {
        // eslint-disable-next-line
        test: /\.(map|node)$/,
        use: ['file-loader'],
      },
    ],
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'node_modules/pdfjs-dist/legacy/build', to: '.' },
        { from: 'node_modules/pdf-lib/dist', to: '.' },
      ],
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.sh'],
  },
  target: 'node',
};
