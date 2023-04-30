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
    'curly': ['error', 'multi-line', 'consistent'],
    '@typescript-eslint/comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'only-multiline',
      enums: 'always-multiline',
      generics: 'always-multiline',
      tuples: 'always-multiline',
    }],
    '@typescript-eslint/no-namespace': 'off',
  },
}
