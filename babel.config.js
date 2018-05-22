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
        modules: process.env.ESM ? false : 'commonjs',
        loose: true,
        exclude: ['transform-async-to-generator', 'transform-regenerator']
      }
    ],
    ['@babel/preset-react', { useBuiltIns: true }]
  ],
  plugins: [
    [
      '@babel/plugin-proposal-object-rest-spread',
      { loose: true, useBuiltIns: true }
    ],
    ['@babel/proposal-class-properties', { loose: true }]
  ]
}
