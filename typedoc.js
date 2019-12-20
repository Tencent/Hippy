module.exports = {
  name: 'Hippy',
  mode: 'modules',
  out: 'docs/en-US/api',
  allowJs: true,
  ignoreCompilerErrors: true,
  excludePrivate: true,
  excludeProtected: true,
  skipInternal: true,
  exclude: [
    '**/node_modules/**',
    '**/__tests__/*.test.*',
    'packages/hippy-react-web/*',
    'types',
  ],
  plugin: [
    'typedoc-plugin-markdown',
    'typedoc-plugin-no-inherit',
  ],
};
