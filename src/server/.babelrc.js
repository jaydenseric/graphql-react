module.exports = {
  comments: false,
  presets: [
    [
      '@babel/env',
      {
        targets: 'node 8.5',
        modules: process.env.BABEL_ESM ? false : 'commonjs',
        shippedProposals: true,
        loose: true
      }
    ]
  ],
  plugins: ['@babel/transform-runtime']
}
