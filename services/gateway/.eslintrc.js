module.exports = {
  extends: ["../../.eslintrc.js"],
  globals: {
    __dirname: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: __dirname + '/tsconfig.eslint.json',
    tsconfigRootDir : './',
    sourceType: 'module',
  },
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    'import/no-unresolved': [
      'error',
      {
        ignore: ['express'],
      },
    ],
  }
};
