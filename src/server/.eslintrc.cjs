/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    browser: false,
  },
  plugins: ['drizzle'],
  extends: ['plugin:drizzle/all'],
  // add your custom rules here
  rules: {
    'antfu/no-const-enum': ['off'],
    'drizzle/enforce-delete-with-where': [
      'error',
      { drizzleObjectName: ['db', 'drizzle'] },
    ],
  },
}
