'use strict';

const config = {
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
        modules: process.env.PREPARE_MODULE_TYPE === 'esm' ? false : 'cjs',
        shippedProposals: true,
        loose: true,
      },
    ],
    '@babel/react',
  ],
  overrides: [
    {
      test: /\.js$/,
      sourceType: 'script',
    },
  ],
};

if (process.env.PREPARE_MODULE_TYPE)
  config.ignore = [
    `./index.${process.env.PREPARE_MODULE_TYPE === 'esm' ? 'js' : 'mjs'}`,
  ];

module.exports = config;
