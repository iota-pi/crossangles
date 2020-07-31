module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2020,
  },
  plugins: [
    '@typescript-eslint',
    'import',
    'jest',
    'react',
  ],
  extends: [
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:jest/recommended',
    'plugin:react/recommended',
  ],
  rules: {
    '@typescript-eslint/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    '@typescript-eslint/no-use-before-define': ['error', { 'functions': false }],
    'arrow-parens': ['error', 'as-needed'],
    'class-methods-use-this': 'off',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-continue': 'off',
    'no-multiple-empty-lines': ['error', { 'max': 2, 'maxEOF': 1 }],
    'no-plusplus': ['error', { 'allowForLoopAfterthoughts': true }],
    'no-use-before-define': 'off',
    'object-curly-newline': ['error', {
      'ObjectExpression': { multiline: true, minProperties: 6 },
      'ObjectPattern': { multiline: true, minProperties: 8 },
      'ImportDeclaration': { multiline: true, minProperties: 6 },
    }],
    'no-restricted-syntax': [
      'error',
      // Taken from eslint-airbnb-config and removed rule forbidding `for ... of` loops
      {
        selector: 'ForInStatement',
        message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
    'prefer-destructuring': 'off',
  },
};
