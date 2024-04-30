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

/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */

(function (getInternalBinding) {
  global.Hippy = {};

  const bindingObj = {};
  const internalBinding = function internalBinding(module) {
    if (typeof bindingObj[module] !== 'object') {
      bindingObj[module] = getInternalBinding(module);
    }
    return bindingObj[module];
  };

  const ContextifyScript = internalBinding('ContextifyModule');

  class NativeModule {
    constructor(filename) {
      this.filename = filename;
      this.exports = {};
    }

    static require(filePath) {
      const filePathArr = filePath.split('/');
      const filename = filePathArr[filePathArr.length - 1];
      const cached = NativeModule.cache[filename];
      if (cached) {
        return cached.exports;
      }

      const nativeModule = new NativeModule(filename);

      nativeModule.cache();
      nativeModule.compile();

      return nativeModule.exports;
    }

    compile() {
      const fn = ContextifyScript.RunInThisContext(this.filename);
      fn(this.exports, NativeModule.require, internalBinding);
    }

    cache() {
      NativeModule.cache[this.filename] = this;
    }
  }
  NativeModule.cache = {};

  // Startup
  NativeModule.require('hippy.js');
});
