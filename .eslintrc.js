/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  plugins: ['vue'],
  extends: [
    'eslint:recommended',
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
    // 'import/consistent-type-specifier-style': ['warn', 'prefer-top-level'],
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports',
      fixStyle: 'inline-type-imports',
    }],
    'import/no-duplicates': ['error', { 'prefer-inline': true, 'considerQueryString': true }],
  },
}
