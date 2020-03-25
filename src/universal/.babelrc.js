'use strict'

const plugins = [
  ['@babel/proposal-class-properties', { loose: true }],
  '@babel/transform-runtime',
  'transform-require-extensions',
]

if (process.env.BABEL_ESM)
  plugins.push(require('../../babelPluginAddBabelRuntimeFileExtensions.js'))

module.exports = {
  comments: false,
  plugins,
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
}
