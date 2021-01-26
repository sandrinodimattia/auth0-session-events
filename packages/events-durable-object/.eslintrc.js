const path = require('path');

module.exports = {
  ignorePatterns: ['*.js'],
  env: { browser: true, es6: true },
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@typescript-eslint/recommended'],
  parserOptions: {
    project: path.resolve(__dirname, 'tsconfig.json'),
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
};
