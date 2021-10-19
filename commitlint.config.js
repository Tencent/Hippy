module.exports = {
  extends: [
    '@commitlint/config-conventional',
  ],
  rules: {
    'header-max-length': [2, 'always', 72],
    'type-enum': [
      2,
      'always',
      [
        'build', // build
        'ci', // ci
        'chore', // Other changes that don't modify src or test files.
        'docs', // Adds or alters documentation.
        'feat', // Adds a new feature.
        'fix', // Solves a bug.
        'perf', // Improves performance.
        'refactor', // Rewrites code without feature, performance or bug changes.
        'revert', // Reverts a previous commit.
        'style', // Improves formatting, white-space.
        'test', // Adds or modifies tests.
      ],
    ],
    'subject-case': [2, 'never', []],
    'scope-empty': [2, 'never'],
  },
};
