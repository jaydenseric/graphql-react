'use strict';

module.exports = {
  comments: false,
  plugins: [
    ['@babel/proposal-class-properties', { loose: true }],
    '@babel/transform-runtime',
    'transform-runtime-file-extensions',
    'transform-require-extensions',
  ],
  presets: [
    [
      '@babel/env',
      {
        targets: 'Node >= 10, > 0.5%, not OperaMini all, not dead',
        modules: process.env.BABEL_ESM ? false : 'cjs',
        shippedProposals: true,
        loose: true,
      },
    ],
    '@babel/react',
  ],
};
