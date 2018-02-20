const { engines: { node } } = require('./package.json')

module.exports = {
  comments: false,
  presets: [
    [
      '@babel/env',
      {
        useBuiltIns: 'usage',
        shippedProposals: true,
        modules: process.env.MODULE ? false : 'commonjs',
        loose: true,
        targets: {
          node: node.substring(2) // Strip `>=`
        }
      }
    ],
    '@babel/preset-react'
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/transform-runtime', { polyfill: false, regenerator: false }]
  ]
}
