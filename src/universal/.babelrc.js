module.exports = {
  comments: false,
  presets: [
    { plugins: ['transform-replace-object-assign'] },
    [
      '@babel/env',
      {
        targets: 'Node >= 10, > 0.5%, not OperaMini all, not dead',
        modules: process.env.BABEL_ESM ? false : 'cjs',
        shippedProposals: true,
        loose: true
      }
    ],
    ['@babel/react', { useBuiltIns: true }]
  ],
  plugins: [
    ['@babel/proposal-object-rest-spread', { loose: true, useBuiltIns: true }],
    ['@babel/proposal-class-properties', { loose: true }],
    '@babel/transform-runtime',
    'transform-require-extensions'
  ]
}
