module.exports = {
  comments: false,
  presets: [
    { plugins: ['babel-plugin-transform-replace-object-assign'] },
    [
      '@babel/env',
      {
        targets: '> 0.5%, not dead, node 8.5',
        modules: process.env.BABEL_ESM ? false : 'commonjs',
        shippedProposals: true,
        loose: true
      }
    ],
    ['@babel/react', { useBuiltIns: true }]
  ],
  plugins: [
    ['@babel/proposal-object-rest-spread', { loose: true, useBuiltIns: true }],
    ['@babel/proposal-class-properties', { loose: true }],
    '@babel/transform-runtime'
  ]
}
