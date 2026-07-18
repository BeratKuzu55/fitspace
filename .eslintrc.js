module.exports = {
  root: true,
  extends: [
    '@react-native',
    'plugin:react-native/all',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
  ],
  plugins: ['react-native', '@typescript-eslint', 'jest'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  env: {
    'jest/globals': true,
  },
  rules: {
    '@typescript-eslint/no-require-imports': 'off',
    'react-native/no-unused-styles': 2,
    'react-native/no-inline-styles': 1,
    'react-native/no-raw-text': 0,
    '@typescript-eslint/no-unused-vars': 1,
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
  },
};
