module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 13,
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/essential',
    'plugin:@typescript-eslint/recommended',
    '@nuxtjs/eslint-config-typescript'
  ],
  plugins: ['vue', '@typescript-eslint'],
  // add your custom rules here
  rules: {
    'vue/multi-word-component-names': ['off'],
    'vue/no-v-model-argument': ['off']
  }
}
