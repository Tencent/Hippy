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
const path = require('path');
const fs = require('fs-extra');
const dts = require('rollup-plugin-dts').default;

function banner(name, version, extra = '', startYear = 2017, build = true) {
  const thisYear = new Date().getFullYear();
  let copyRightYears = thisYear;
  if (startYear !== thisYear) {
    copyRightYears = `${startYear}-${thisYear}`;
  }
  const buildStr = build ? `\n * ${name} v${version}${extra}\n * Build at: ${new Date()}\n *\n ` : '';

  return `/* !${buildStr}
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) ${copyRightYears} THL A29 Limited, a Tencent company.
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
`;
};


function resolvePackage(src, extra = 'src') {
  return path.resolve(__dirname, '../packages/', src, extra);
}

// 全局类型不会自动打入文件，这里手动修复
function fixHippyTypes(opts = {}) {
  return {
    name: 'fix-hippy-types',
    renderChunk: (code) => {
      if (!opts.fix) {
        return code;
      }
      const d = fs.readFileSync(path.resolve(__dirname, '../packages/global.d.ts'));
      const codef = code.replace(/HippyTypes\$1/g, 'HippyTypes');
      return `${codef}\n${d}`;
    },
  };
}

function getDtsConfig(config = {}) {
  const file = config.dest.replace('.js', '.d.ts');
  const entry = Array.isArray(config.entry) ? config.entry[0] : config.entry;
  return {
    input: entry,
    output: {
      file,
      format: 'es',
    },
    external: config.external,
    plugins: [dts({
      tsconfig: config.tsconfig,
    }), fixHippyTypes({
      fix: config.fixHippyTypes,
    })],
  };
}

module.exports = {
  banner,
  resolvePackage,
  getDtsConfig,
};
