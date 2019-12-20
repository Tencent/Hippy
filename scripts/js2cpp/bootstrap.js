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
      let file_path_arr = filePath.split('/');
      let filename = file_path_arr[file_path_arr.length - 1];
      const cached = NativeModule._cache[filename];
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
      NativeModule._cache[this.filename] = this;
    }
  }
  NativeModule._cache = {};

  // Startup
  NativeModule.require('hippy.js');
});
