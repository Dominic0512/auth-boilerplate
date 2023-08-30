module.exports = {
  globals: {
    __dirname: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: __dirname + '/tsconfig.eslint.json',
    tsconfigRootDir : './',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  settings: {
    'import/resolver': {
      typescript: {}
    },
  },
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'node_modules', 'dist'],
  rules: {
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-useless-constructor': 'off', // Useful when redeclaring DI class
    'class-methods-use-this': 'off', // Useful when putting pure util function in DI class
    'max-classes-per-file': 'off',
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'error',
    'import/extensions': [
        'error',
        'ignorePackages',
        {
          'js': 'never',
          'jsx': 'never',
          'ts': 'never',
          'tsx': 'never'
        }
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        'devDependencies': ['**/*.spec.ts', '**/*-spec.ts'],
        'packageDir': ['./']
      }
    ]
  },
};
