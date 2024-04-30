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

const filepath = require('path');
const { declare } = require('@babel/helper-plugin-utils');
const { types } = require('@babel/core');

module.exports = declare((api, opts) => {
  api.assertVersion(7);

  return {
    name: 'transform-snapshot',

    visitor: {
      CallExpression(path, file) {
        const { filename } = file;
        const callee = path.get('callee');
        if (callee.node.name === 'snapshot') {
          const args = callee.container.arguments;
          const snapshotFilepath = filepath.relative(
            opts.workspacePath,
            filepath.join(
              opts.snapshotPath,
              filepath.relative(opts.testPath, filename),
            ),
          );

          const testIdentifier = types.identifier('test');
          const parentIdentifier = types.identifier('parent');
          const titleIdentifier = types.identifier('title');

          const thisExpression = types.thisExpression();
          const testExpression = types.memberExpression(thisExpression, testIdentifier);
          const parentExpression = types.memberExpression(testExpression, parentIdentifier);
          if (args.length === 0) {
            // snapshot() => snapshot(null, this.test.title, this.test.parent.title, filename)
            args.push(types.nullLiteral());
            args.push(types.memberExpression(testExpression, titleIdentifier));
            args.push(types.memberExpression(parentExpression, titleIdentifier));
            args.push(types.stringLiteral(snapshotFilepath));
          } else if (args.length === 1) {
            // snapshot(0.1) => snapshot(0.1, this.test.title, this.test.parent.title, filename)
            args.push(types.memberExpression(testExpression, titleIdentifier));
            args.push(types.memberExpression(parentExpression, titleIdentifier));
            args.push(types.stringLiteral(snapshotFilepath));
          }
        }
      },
    },
  };
});
