'use strict';

const { strictEqual } = require('assert');
const fs = require('fs');
const { join } = require('path');
const { promisify } = require('util');
const { disposableDirectory } = require('disposable-directory');
const gzipSize = require('gzip-size');
const webpack = require('webpack');

module.exports = (tests) => {
  tests.add('Bundle.', async () => {
    await disposableDirectory(async (tempDirPath) => {
      const filename = 'bundle.cjs';
      const compiler = webpack({
        context: __dirname,
        entry: '../public/index.js',
        output: {
          path: tempDirPath,
          filename,
          libraryTarget: 'commonjs2',
        },
        target: 'node',
        mode: 'production',
        externals: /^(?:object-assign|react|react-dom)(?:\/|\\|$)/u,
      });
      const compile = promisify(compiler.run).bind(compiler);
      const stats = await compile();

      if (stats.hasWarnings() || stats.hasErrors())
        throw new Error(stats.toString('errors-warnings'));

      const bundleCode = await fs.promises.readFile(
        join(tempDirPath, filename),
        'utf8'
      );
      const kB = (await gzipSize(bundleCode)) / 1000;

      console.info(`${kB} kB minified and gzipped bundle.`);

      strictEqual(kB < 3.5, true);
    });
  });
};
