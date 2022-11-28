module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 13,
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  plugins: ['vue'],
  extends: [
    'eslint:recommended',
    '@nuxtjs/eslint-config-typescript',
    'plugin:vue/vue3-recommended',
    '@antfu',
  ],
  // add your custom rules here
  rules: {
    'vue/multi-word-component-names': ['off'],
    'vue/no-v-model-argument': ['off'],
    '@typescript-eslint/type-annotation-spacing': 'warn',
  },
}
