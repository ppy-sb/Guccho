module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    '@nuxtjs',
    '@nuxtjs/eslint-config-typescript'
  ],
  plugins: ['@typescript-eslint'],
  // add your custom rules here
  rules: {}
}
