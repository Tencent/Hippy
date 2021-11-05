function asciiAndEmojiCheck(message) {
  const asciiAndEmojiReg = /^((\ud83c[\udf00-\udfff])|(\ud83d[\udc00-\ude4f\ude80-\udeff])|[\u2600-\u2B55]|[\x00-\xff])*$/i;
  return asciiAndEmojiReg.test(message);
}

module.exports = {
  extends: [
    '@commitlint/config-conventional',
  ],
  plugins: ['commitlint-plugin-function-rules'],
  rules: {
    'header-max-length': [2, 'always', 72],
    'header-min-length': [0],
    'function-rules/header-min-length': [
      2,
      'always',
      (parsed) => {
        const { subject } = parsed;
        if (!subject) return [false, 'header subject cannot be empty'];
        const { length } = subject;
        const minLength = 8;
        if (length >= minLength) {
          return [true];
        }
        return [false, `header subject cannot be shorter than ${minLength} characters, current length is ${length}`];
      },
    ],
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
    'scope-empty': [2, 'never'],
    'subject-case': [0],
    'function-rules/subject-case': [
      2,
      'always',
      (parsed) => {
        const { header, body, footer } = parsed;
        const isAsciiAndEmoji = [header, body, footer].every(message => asciiAndEmojiCheck(message));
        if (isAsciiAndEmoji) {
          return [true];
        }
        return [false, 'commit message must only use English or Emoji'];
      },
    ],
  },
};
