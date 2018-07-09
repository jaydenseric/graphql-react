const {
  engines: { node }
} = require('./package.json')

module.exports = {
  comments: false,
  presets: [
    { plugins: ['babel-plugin-transform-replace-object-assign'] },
    [
      '@babel/env',
      {
        targets: { node: node.substring(2) }, // Strip `>=`
        modules: process.env.BABEL_ESM ? false : 'commonjs',
        shippedProposals: true,
        loose: true,
        exclude: ['transform-async-to-generator', 'transform-regenerator']
      }
    ],
    ['@babel/react', { useBuiltIns: true }]
  ],
  plugins: [
    ['@babel/proposal-object-rest-spread', { loose: true, useBuiltIns: true }],
    ['@babel/proposal-class-properties', { loose: true }]
  ]
}
