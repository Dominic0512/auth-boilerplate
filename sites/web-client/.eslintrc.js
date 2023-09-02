module.exports = {
  extends: ['next/core-web-vitals'],
  parserOptions: {
    project: __dirname + '/tsconfig.json',
    tsconfigRootDir : './',
    sourceType: 'module',
  },
  rules: {
    'import/no-default-export': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        'devDependencies': ['app/**/*.tsx'],
      }
    ]
  }
}
