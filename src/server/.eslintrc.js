module.exports = {
  env: {
    node: true,
  },
  parserOptions: {
    ecmaVersion: 13,
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    '@nuxt/eslint-config',
    '@antfu',
  ],
  // add your custom rules here
  rules: {
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
    '@typescript-eslint/consistent-type-imports': 'off',
  },
}
