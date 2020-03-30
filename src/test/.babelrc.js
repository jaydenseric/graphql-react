'use strict';

const plugins = ['@babel/transform-runtime', 'transform-require-extensions'];

if (process.env.BABEL_ESM)
  plugins.push(require('../../babelPluginAddBabelRuntimeFileExtensions.js'));

module.exports = {
  comments: false,
  plugins,
  presets: [
    [
      '@babel/env',
      {
        targets: { node: true },
        modules: process.env.BABEL_ESM ? false : 'cjs',
        shippedProposals: true,
        loose: true,
      },
    ],
    '@babel/react',
  ],
};
