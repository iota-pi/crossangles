module.exports = {
  entry: ['./build/image/index.js'],
  target: 'node',
  mode: 'production',
  output: {
    path: `${process.cwd()}/build/bundled`,
    filename: 'lambda.js',
    libraryTarget: 'umd',
  },
};
