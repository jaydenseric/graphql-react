module.exports = {
  comments: false,
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
  ],
  plugins: ['@babel/transform-runtime', 'transform-require-extensions']
}
