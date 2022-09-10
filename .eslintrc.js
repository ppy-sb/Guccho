module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false
  },
  extends: [
    '@nuxtjs/eslint-config-typescript'
  ],
  plugins: [],
  // add your custom rules here
  rules: {}
}
