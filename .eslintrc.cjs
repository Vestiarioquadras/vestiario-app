module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
  ],
  ignorePatterns: [
    'dist',
    '.eslintrc.cjs',
    'vite.config.js',
    '*.config.js',
    '*.config.cjs',
    'node_modules',
    'tsconfig*',
    '*.d.ts'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
  },
}
