/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    browser: false,
  },
  // add your custom rules here
  rules: {
    'antfu/no-const-enum': ['off'],
  },
  plugins: ['drizzle'],
  extends: ['plugin:drizzle/all'],
}
