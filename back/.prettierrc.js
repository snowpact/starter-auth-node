module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  tabWidth: 2,
  printWidth: 100,
  overrides: [
    {
      files: 'src/migrations/*.ts',
      options: {
        printWidth: 160,
      },
    },
  ],
};
