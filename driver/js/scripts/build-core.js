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
const { execSync } = require('child_process');
const babel = require('@babel/core');

/**
 * Code header and content
 */
const CodePieces = {
  header: {
    piece1: `/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-${new Date().getFullYear()} THL A29 Limited, a Tencent company.
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
#include "footstone/macros.h"`,
    piece2_v8: `
#include "driver/vm/v8/native_source_code_v8.h"`,
    piece2_jsc: `
#include "driver/vm/jsc/native_source_code_jsc.h"`,
    piece2_hermes: `
#include "driver/vm/hermes/native_source_code_hermes.h"`,
    piece2_flutter: '',
    piece3: `


namespace {`,
  },
  common: {
    piece1: `
}  // namespace

namespace hippy {
inline namespace driver {

static const std::unordered_map<std::string, NativeSourceCode> global_base_js_source_map{
  {"bootstrap.js", {k_bootstrap, ARRAY_SIZE(k_bootstrap) - 1}},  // NOLINT
  {"hippy.js", {k_hippy, ARRAY_SIZE(k_hippy) - 1}},  // NOLINT`,
    piece2_v8: `
};

static NativeSourceCode GetNativeSourceCodeImp(const std::string& filename) {
  const auto it = global_base_js_source_map.find(filename);
  return it != global_base_js_source_map.cend() ? it->second : NativeSourceCode{};
}

NativeSourceCode NativeSourceCodeProviderV8::GetNativeSourceCode(const std::string &filename) const {
  return GetNativeSourceCodeImp(filename);
}

} // namespace driver
} // namespace hippy
`,
    piece2_jsc: `
};

static NativeSourceCode GetNativeSourceCodeImp(const std::string& filename) {
  const auto it = global_base_js_source_map.find(filename);
  return it != global_base_js_source_map.cend() ? it->second : NativeSourceCode{};
}

NativeSourceCode NativeSourceCodeProviderJSC::GetNativeSourceCode(const std::string &filename) const {
  return GetNativeSourceCodeImp(filename);
}

} // namespace driver
} // namespace hippy
`,
    piece2_hermes: `
};

static NativeSourceCode GetNativeSourceCodeImp(const std::string& filename) {
  const auto it = global_base_js_source_map.find(filename);
  return it != global_base_js_source_map.cend() ? it->second : NativeSourceCode{};
}

NativeSourceCode NativeSourceCodeProviderHermes::GetNativeSourceCode(const std::string &filename) const {
  return GetNativeSourceCodeImp(filename);
}

} // namespace driver
} // namespace hippy
`,
    piece2_flutter: `
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
    if (renderer === 'android' || renderer === 'ios') {
      hippyPath = getAbsolutePath(`../lib/entry/${renderer}/${engine}/hippy.js`);
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
      if (lineSlice.indexOf('require(\'') > -1
          || lineSlice.indexOf('require("') > -1) {
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
 * Wrap the compiled code with a header and footer.
 *
 * @param {string} code - The compiled JavaScript code.
 * @returns {string} - The wrapped code.
 */
function wrapCodeIfNeeded(code, fileName) {
  if (fileName === 'bootstrap' || fileName === 'ExceptionHandle') {
    return code;
  }
  const header = '(function(exports, require, internalBinding) {';
  const footer = '});';
  return `${header}${code}${footer}`;
}

/**
 * Read the file content to be a buffer.
 *
 * @param {android|ios|flutter} renderer - specific renderer.
 * @param {v8|jsc|hermes} engine - js engine to use.
 * @param {string} filePath - the file path will read.
 */
function readFileToBuffer(renderer, engine, filePath) {
  const fileName = path.basename(filePath, '.js');
  switch (renderer) {
    case 'flutter': {
      const code = fs.readFileSync(filePath).toString();
      const babelConfig = { comments: false, compact: false };
      const compiled = babel.transform(code, babelConfig);
      return Buffer.from(wrapCodeIfNeeded(compiled.code, fileName));
    }
    case 'android': {
      if (engine === 'hermes') {
        const code = fs.readFileSync(filePath).toString();
        // see ios hermes notes bellow
        const babelConfig = { presets: [['@babel/env', { targets: { chrome: 41 } }]], comments: false, compact: true };
        // Compile the code using Babel
        const compiled = babel.transform(code, babelConfig);
        // Wrap the compiled code with header and footer
        const wrappedCode = wrapCodeIfNeeded(compiled.code, fileName);
        return Buffer.from(wrappedCode);
      }
      if (engine === 'v8') {
        const code = fs.readFileSync(filePath).toString();
        const babelConfig = { comments: false, compact: false };
        const compiled = babel.transform(code, babelConfig);
        return Buffer.from(wrapCodeIfNeeded(compiled.code, fileName));
      }
    }
    case 'ios': {
      if (engine === 'hermes') {
        const code = fs.readFileSync(filePath).toString();
        // since hermes does not support es6 class currently, use chrome: 41 to avoid generating incompatible code
        // A more reasonable approach is to use a configuration such as metro-react-native-babel-preset
        const babelConfig = { presets: [['@babel/env', { targets: { chrome: 41 } }]], comments: false, compact: true };
        // Compile the code using Babel
        const compiled = babel.transform(code, babelConfig);
        // Wrap the compiled code with header and footer
        const wrappedCode = wrapCodeIfNeeded(compiled.code, fileName);
        return Buffer.from(wrappedCode);
      }
      if (engine === 'jsc') {
        const code = fs.readFileSync(filePath).toString();
        const babelConfig = { presets: [['@babel/env', { targets: { safari: '8' } }]], comments: false, compact: false };
        const compiled = babel.transform(code, babelConfig);
        return Buffer.from(wrapCodeIfNeeded(compiled.code, fileName));
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
  let code = CodePieces.header.piece1;
  code += CodePieces.header[`piece2_${engine}`];
  code += CodePieces.header.piece3;

  getAllRequiredFiles(renderer, engine).then((filesArr) => {
    filesArr.forEach((filePath) => {
      const fileName = path.basename(filePath, '.js');
      const fileBuffer = readFileToBuffer(renderer, engine, filePath);

      // compile to hbc if using hermes engine
      let codeBuffer;
      if (engine === 'hermes') {
        const tempFilePath = path.join(__dirname, `${fileName}_temp.js`);
        const tempHbcFilePath = `${tempFilePath}.hbc`;
        fs.writeFileSync(tempFilePath, fileBuffer);
        const hermesCompilerPath = getAbsolutePath('../tools/hermes');
        execSync(`${hermesCompilerPath} -emit-binary -out ${tempHbcFilePath} ${tempFilePath} -O -g0 -Wno-undefined-variable`);
        const hbcBuffer = fs.readFileSync(tempHbcFilePath);
        console.log(`Compiled ${fileName}, HBC buffer length: ${hbcBuffer.length}`);
        fs.unlinkSync(tempFilePath);
        fs.unlinkSync(tempHbcFilePath);
        codeBuffer = hbcBuffer;
      } else {
        codeBuffer = fileBuffer;
      }

      // write to byte array
      const byteArr = [];
      for (let i = 0; i < codeBuffer.length; i += 1) {
        byteArr.push(codeBuffer[i]);
      }

      code +=  `
  const uint8_t k_${fileName}[] = { ${byteArr.join(',')},0 };  // NOLINT`;
    });

    code += CodePieces.common.piece1;

    for (let i = 2; i < filesArr.length; i += 1) {
      const fileName = path.basename(filesArr[i], '.js');
      code += `
  {"${fileName}.js", {k_${fileName}, ARRAY_SIZE(k_${fileName}) - 1}},  // NOLINT`;
    }

    code += CodePieces.common[`piece2_${engine}`];

    let targetPath = `${buildDirPath}/native_source_code_${engine}.cc`;
    if (engine === 'hermes') {
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
generateCpp('flutter', 'flutter', getAbsolutePath('../../../framework/voltron/core/src/bridge/'));
