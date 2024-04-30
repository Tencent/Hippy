/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-control-regex */
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
    'function-rules/header-max-length': [
      2,
      'always',
      (parsed) => {
        const { header } = parsed;
        if (!header) return [false, 'header cannot be empty'];
        let prTextIndex = -1;
        const regResult = /\s*\(#\w+\)$/.exec(header);
        if (regResult && typeof regResult.index === 'number') {
          prTextIndex = regResult.index;
          console.log(`This commit message header has PR number texts at position ${prTextIndex}, which will be ignored.`);
        }
        let { length } = header;
        if (prTextIndex !== -1) {
          length = prTextIndex;
        }
        const maxLength = 72;
        if (length <= maxLength) {
          return [true];
        }
        return [false, `header must not be longer than ${maxLength} characters, current length i ${length}`];
      },
    ],
    'header-min-length': [0],
    'function-rules/header-min-length': [
      2,
      'always',
      (parsed) => {
        const { subject } = parsed;
        if (!subject) return [false, 'header subject cannot be empty'];
        const { length } = subject;
        const minLength = 15;
        if (length >= minLength) {
          return [true];
        }
        return [false, `header subject must not be shorter than ${minLength} characters, current length is ${length}`];
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
        const { header, body } = parsed;
        const isAsciiAndEmoji = [header, body].every(message => asciiAndEmojiCheck(message));
        if (isAsciiAndEmoji) {
          return [true];
        }
        return [false, 'commit message header and body must only use English or Emoji'];
      },
    ],
  },
};
