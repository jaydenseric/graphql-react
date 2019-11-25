module.exports = {
  comments: false,
  presets: [
    { plugins: ['babel-plugin-transform-replace-object-assign'] },
    [
      '@babel/env',
      {
        targets: 'Node >= 8.10, > 0.5%, not OperaMini all, not dead',
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
