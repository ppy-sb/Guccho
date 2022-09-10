module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false
  },
  extends: [
    '@nuxtjs',
    '@nuxtjs/eslint-config-typescript'
  ],
  plugins: [],
  // add your custom rules here
  rules: {}
}
