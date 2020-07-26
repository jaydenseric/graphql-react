'use strict';

const config = {
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
        targets:
          'Node 10.17 - 11 and Node < 11, Node 12 - 13 and Node < 13, Node >= 13.7',
        modules: process.env.PREPARE_MODULE_TYPE === 'esm' ? false : 'cjs',
        shippedProposals: true,
        loose: true,
      },
    ],
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
