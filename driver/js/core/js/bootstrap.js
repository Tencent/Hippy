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
