/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }
function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
(function (getInternalBinding) {
  global.Hippy = global.Hippy || {};
  var bindingObj = {};
  var internalBinding = function internalBinding(module) {
    if (_typeof(bindingObj[module]) !== 'object') {
      bindingObj[module] = getInternalBinding(module);
    }
    return bindingObj[module];
  };
  var ContextifyScript = internalBinding('ContextifyModule');
  var NativeModule = /*#__PURE__*/function () {
    function NativeModule(filename) {
      _classCallCheck(this, NativeModule);
      this.filename = filename;
      this.exports = {};
    }
    _createClass(NativeModule, [{
      key: "compile",
      value: function compile() {
        var fn = ContextifyScript.RunInThisContext(this.filename);
        fn(this.exports, NativeModule.require, internalBinding);
      }
    }, {
      key: "cache",
      value: function cache() {
        NativeModule.cache[this.filename] = this;
      }
    }], [{
      key: "require",
      value: function require(filePath) {
        var filePathArr = filePath.split('/');
        var filename = filePathArr[filePathArr.length - 1];
        var cached = NativeModule.cache[filename];
        if (cached) {
          return cached.exports;
        }
        var nativeModule = new NativeModule(filename);
        nativeModule.cache();
        nativeModule.compile();
        return nativeModule.exports;
      }
    }]);
    return NativeModule;
  }();
  NativeModule.cache = {};

  // Startup
  NativeModule.require('hippy.js');
});
