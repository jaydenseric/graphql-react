module.exports = {
  comments: false,
  presets: [
    [
      '@babel/env',
      {
        targets: { node: true },
        modules: process.env.BABEL_ESM ? false : 'commonjs',
        shippedProposals: true,
        loose: true
      }
    ],
    '@babel/react'
  ],
  plugins: ['@babel/transform-runtime']
}
