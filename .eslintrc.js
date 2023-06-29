module.exports = {
    root: true,
    extends: ['./tools/eslint/base_rules.js'],
    env: {
      browser: true,
      commonjs: true,
      es6: true,
      node: true,
      mocha: true,
      jest: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: ['./tsconfig.json'],
      sourceType: 'module',
    },
    plugins: ['ban', 'filenames', 'local', 'prefer-let', '@typescript-eslint'],
    settings: {},
    rules: {
      '@typescript-eslint/restrict-plus-operands': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        varsIgnorePattern: '_.*|response|datasourceUrl|MySchema',
        argsIgnorePattern: '_.*|context|param'
      },],
      'object-shorthand': ['error', 'never'],
      'max-len': ['error', { 'code': 80, 'ignoreUrls': true, ignoreRegExpLiterals: true, ignoreStrings: true, ignorePattern: '^import ' }],
      'quotes': ['error', 'double', {avoidEscape: true}],
      'prefer-const': 'off',
      'prefer-let/prefer-let': 2,
      'prefer-template': 'off',
      'comma-dangle': ['error', 'always-multiline'],
      'semi': ['error', 'always',],
    },
    overrides: [
      {
        files: ['**/*_test.{ts,tsx}'],
        rules: {
          '@typescript-eslint/no-non-null-assertion': 'off',
        },
      },
      {
        files: ['**/*.d.ts'],
        rules: {
          '@typescript-eslint/no-unused-vars': 'off',
          camelcase: 'off',
        },
      },
      {
        files: ['**/types.ts'],
        rules: {
          camelcase: 'off',
        },
      },
      {
        files: ['examples/template/**/*.ts'],
        rules: {
          '@typescript-eslint/consistent-type-imports': 'off'
        },
      },
    ],
  };
