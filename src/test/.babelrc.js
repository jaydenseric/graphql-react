'use strict';

module.exports = {
  comments: false,
  plugins: [
    '@babel/transform-runtime',
    'transform-runtime-file-extensions',
    'transform-require-extensions',
  ],
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
