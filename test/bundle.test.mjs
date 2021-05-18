import { strictEqual } from 'assert';
import fs from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import disposableDirectory from 'disposable-directory';
import gzipSize from 'gzip-size';
import webpack from 'webpack';

export default (tests) => {
  tests.add('Bundle.', async () => {
    await disposableDirectory(async (tempDirPath) => {
      const filename = 'bundle.cjs';
      const compiler = webpack({
        context: fileURLToPath(new URL('./', import.meta.url)),
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
