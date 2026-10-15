// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'ios/*', 'android/*'],
  },
  {
    rules: {
      // See "Code style" in AGENTS.md: names say what they hold.
      // `_` alone is allowed for a parameter that is deliberately unused.
      'id-length': ['error', { min: 2, exceptions: ['_'], properties: 'never' }],
    },
  },
]);
