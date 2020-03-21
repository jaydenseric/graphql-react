'use strict'

module.exports = {
  comments: false,
  plugins: ['@babel/transform-runtime', 'transform-require-extensions'],
  presets: [
    [
      '@babel/env',
      {
        targets: { node: true },
        modules: process.env.BABEL_ESM ? false : 'cjs',
        shippedProposals: true,
        loose: true
      }
    ],
    '@babel/react'
  ]
}
