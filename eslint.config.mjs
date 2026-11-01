import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'vue/multi-word-component-names': [
      'error',
      {
        ignores: [
          'index',
          'default',
          'error',
          'Error',
          '[name]',
          'accessibility',
          'privacy',
          'terms',
        ],
      },
    ],
    'vue/component-api-style': ['error', ['script-setup']],
    'vue/block-lang': ['error', { script: { lang: 'ts' } }],
    // Prettier writes <input />; this rule would reject it
    'vue/html-self-closing': 'off',
  },
});
