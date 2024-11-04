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

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const babel = require('@babel/core');

/**
 * Code header and content
 */
const CodePieces = {
  header() {
    return `/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-${
        new Date().getFullYear()} THL A29 Limited, a Tencent company.
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

#include <unordered_map>

#include "driver/vm/native_source_code.h"
#include "footstone/macros.h"


namespace {`;
  },
  android: {
    piece1: `
}  // namespace

namespace hippy {
inline namespace driver {

static const std::unordered_map<std::string, NativeSourceCode> global_base_js_source_map{
  {"bootstrap.js", {k_bootstrap, ARRAY_SIZE(k_bootstrap) - 1}},  // NOLINT
  {"hippy.js", {k_hippy, ARRAY_SIZE(k_hippy) - 1}},  // NOLINT`,
    piece2: `
};

const NativeSourceCode GetNativeSourceCode(const std::string& filename) {
  const auto it = global_base_js_source_map.find(filename);
  return it != global_base_js_source_map.cend() ? it->second : NativeSourceCode{};
}

} // namespace driver
} // namespace hippy
`,
  },
  ios: {
    piece1: `
}  // namespace

namespace hippy {
inline namespace driver {

const NativeSourceCode GetNativeSourceCode(const std::string& filename) {
  const std::unordered_map<std::string, NativeSourceCode> global_base_js_source_map{
    {"bootstrap.js", {k_bootstrap, ARRAY_SIZE(k_bootstrap) - 1}},  // NOLINT
    {"hippy.js", {k_hippy, ARRAY_SIZE(k_hippy) - 1}},  // NOLINT`,
    piece2: `
  };
  const auto it = global_base_js_source_map.find(filename);
  return it != global_base_js_source_map.cend() ? it->second : NativeSourceCode{};
}

} // namespace driver
} // namespace hippy
`,
  },
  flutter: {
    piece1: `
}  // namespace

namespace hippy {
inline namespace driver {

static const std::unordered_map<std::string, NativeSourceCode> global_base_js_source_map{
  {"bootstrap.js", {k_bootstrap, ARRAY_SIZE(k_bootstrap) - 1}},  // NOLINT
  {"hippy.js", {k_hippy, ARRAY_SIZE(k_hippy) - 1}},  // NOLINT`,
    piece2: `
};

const NativeSourceCode GetNativeSourceCode(const std::string& filename) {
  const auto it = global_base_js_source_map.find(filename);
  return it != global_base_js_source_map.cend() ? it->second : NativeSourceCode{};
}

} // namespace driver
} // namespace hippy
`,
  },
};

/**
 * Initial the code git st buffer header and footer.
 */
const wrapperBeginBuffer =
    Buffer.from('(function(exports, require, internalBinding) {');
const wraperBeginByteArr = [];
for (let i = 0; i < wrapperBeginBuffer.length; i += 1) {
  wraperBeginByteArr.push(wrapperBeginBuffer[i]);
}

const wrapperEndBuffer = Buffer.from('});');
const wraperEndByteArr = [];
for (let i = 0; i < wrapperEndBuffer.length; i += 1) {
  wraperEndByteArr.push(wrapperEndBuffer[i]);
}

/**
 * Get the absolute full path
 * @param {string} relativePath - relative path
 */
function getAbsolutePath(relativePath) {
  return path.resolve(__dirname, relativePath);
}

/**
 * Get the core js files list for specific renderer.
 *
 * @param {android|ios|flutter} renderer - specific renderer.
 */
function getAllRequiredFiles(renderer, engine) {
  return new Promise((resole) => {
    let hippyPath = getAbsolutePath(`../lib/entry/${renderer}/hippy.js`);
    if (renderer == 'android' || renderer == 'ios') {
      hippyPath = getAbsolutePath(`../lib/entry/${renderer}/${engine}/hippy.js`)
    }

    const rl = readline.createInterface({
      input: fs.createReadStream(hippyPath),
    });
    const filePaths = [
      getAbsolutePath('../lib/bootstrap.js'),
      hippyPath,
      getAbsolutePath('../lib/modules/ExceptionHandle.js'),
    ];

    rl.on('line', (line) => {
      const lineSlice = line.split('//')[0];
      if (lineSlice.indexOf('require(\'') > -1 ||
          lineSlice.indexOf('require("') > -1) {
        const entry = line.split('(\'')[1].split('\')')[0];
        filePaths.push(getAbsolutePath(`../lib/entry/${renderer}/${entry}`));
      }
    });
    rl.on('close', () => {
      resole(filePaths);
    });
  });
}

/**
 * Read the file content to be a buffer.
 *
 * @param {android|ios|flutter} renderer - specific renderer.
 * @param {v8|jsc|hermes} engine - js engine to use.
 * @param {string} filePath - the file path will read.
 */
function readFileToBuffer(renderer, engine, filePath) {
  switch (renderer) {
    case 'flutter': {
      const code = fs.readFileSync(filePath).toString();
      const babel_config = { comments: false, compact: false, };
      const compiled = babel.transform(code, babel_config);
      return Buffer.from(compiled.code);
    }
    case 'android': {
      if (engine == 'hermes') {
        const code = fs.readFileSync(filePath).toString();
        const babel_config = { presets: [ [ '@babel/env', { targets: { chrome: 41, }, }, ], ], comments: false, compact: false, };
        const complied = babel.transform(code, babel_config);
        return Buffer.from(complied.code);
      }
      if(engine == 'v8') {
        const code = fs.readFileSync(filePath).toString();
        const babel_config = { comments: false, compact: false, };
        const compiled = babel.transform(code, babel_config);
        return Buffer.from(compiled.code);
      }
    }
    case 'ios': {
      if (engine == 'hermes') {
        const code = fs.readFileSync(filePath).toString();
        const babel_config = { presets: [ [ '@babel/env', { targets: { chrome: 41, }, }, ], ], comments: false, compact: false, };
        const complied = babel.transform(code, babel_config);
        return Buffer.from(complied.code);
      } else if (engine == 'jsc') {
        const code = fs.readFileSync(filePath).toString();
        const babel_config = { presets: [ [ '@babel/env', { targets: { safari: '8', }, }, ], ], comments: false, compact: false, };
        const complied = babel.transform(code, babel_config);
        return Buffer.from(complied.code);
      }
    }
    default:
      return null;
  }
}

/**
 * Read the js files and generate the core cpp files.
 *
 * @param {android|ios|flutter} renderer - specific renderer.
 * @param {v8|jsc|hermes|null} engine - js engine to use.
 * @param {string} buildDirPath - output directory.
 */
function generateCpp(renderer, engine, buildDirPath) {
  let code = CodePieces.header(renderer);

  getAllRequiredFiles(renderer, engine).then((filesArr) => {
    filesArr.forEach((filePath) => {
      const fileName = path.basename(filePath, '.js');
      const fileBuffer = readFileToBuffer(renderer, engine, filePath);
      const byteArr = [];
      for (let i = 0; i < fileBuffer.length; i += 1) {
        byteArr.push(fileBuffer[i]);
      }
      if (fileName === 'bootstrap' || fileName === 'ExceptionHandle') {
        code += `
  const uint8_t k_${fileName}[] = { ${byteArr.join(',')},0 };  // NOLINT`;
      } else {
        code += `
  const uint8_t k_${fileName}[] = { ${wraperBeginByteArr.join(',')},${
            byteArr.join(',')},${wraperEndByteArr.join(',')},0 };  // NOLINT`;
      }
    });

    code += CodePieces[renderer].piece1;

    for (let i = 2; i < filesArr.length; i += 1) {
      const fileName = path.basename(filesArr[i], '.js');
      code += `
      {"${fileName}.js", {k_${fileName}, ARRAY_SIZE(k_${
          fileName}) - 1}},  // NOLINT`;
    }

    code += CodePieces[renderer].piece2;

    let targetPath = `${buildDirPath}/native_source_code_${renderer}.cc`;
    if (engine == 'hermes') {
      targetPath = `${buildDirPath}/native_source_code_${engine}_${renderer}.cc`;
    }

    fs.writeFile(targetPath, code, (err) => {
      if (err) {
        /* eslint-disable-next-line no-console */
        console.log('[writeFile error] : ', err);
        return;
      }
      /* eslint-disable-next-line no-console */
      console.log(`${renderer} convert success, output ${targetPath}`);
    });
  });
}

// Start to work
generateCpp('ios', 'jsc', getAbsolutePath('../../../driver/js/src/vm/jsc/'));
generateCpp('ios', 'hermes', getAbsolutePath('../../../driver/js/src/vm/hermes/'));
generateCpp('android', 'v8', getAbsolutePath('../../../driver/js/src/vm/v8/'));
generateCpp('android', 'hermes', getAbsolutePath('../../../driver/js/src/vm/hermes/'));
generateCpp('flutter', null, getAbsolutePath('../../../framework/voltron/core/src/bridge/'));
