module.exports = {
  entry: ['./build/scraper/lambda.js'],
  target: 'node',
  mode: 'production',
  output: {
    path: `${process.cwd()}/build/bundled`,
    filename: 'lambda.js',
    libraryTarget: 'umd',
  }
};
