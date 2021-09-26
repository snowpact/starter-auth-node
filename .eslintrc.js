module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  rules: {
    '@typescript-eslint/require-await': 2,
    '@typescript-eslint/explicit-function-return-type': 2,
    '@typescript-eslint/unbound-method': ['off'],
    '@typescript-eslint/no-unsafe-return': ['off'],
    '@typescript-eslint/no-floating-promises': ['off'],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/explicit-module-boundary-types': ['off'],
    'import/order': 1,
    'import/imports-first': 1,
    'no-console': ['off'],
    'prefer-destructuring': ['off'],
    'no-restricted-syntax': ['off'],
    'no-await-in-loop': ['off'],
    'import/prefer-default-export': ['off'],
    'import/no-cycle': ['off'],
    'no-undef': ['off'],
    'consistent-return': ['off'],
    '@typescript-eslint/no-unsafe-call': ['off'],
    'array-callback-return': ['off'],
    '@typescript-eslint/no-unsafe-member-access': ['off'],
    '@typescript-eslint/require-await': ['off'],
    '@typescript-eslint/no-unsafe-assignment': ['off'],
    'multiline-ternary': 0,
    'no-unused-vars': 'off',
    'no-shadow': 0,
    '@typescript-eslint/no-unused-vars': 'error',
    'no-useless-constructor': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
