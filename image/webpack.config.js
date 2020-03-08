module.exports = {
  entry: ['./build/image/index.js'],
  target: 'node',
  mode: 'production',
  externals: ['aws-sdk', 'chrome-aws-lambda'],
  output: {
    path: `${process.cwd()}/build/bundled`,
    filename: 'lambda.js',
    libraryTarget: 'umd',
  },
};
