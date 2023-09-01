module.exports = {
  extends: ["../../.eslintrc.js"],
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
  rules: {}
};
