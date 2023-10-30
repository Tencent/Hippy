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

/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

var _excluded = ["method", "headers", "body"];
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }


global.Headers = /*#__PURE__*/function () {
  function Headers(initValues) {
    var _this = this;
    _classCallCheck(this, Headers);
    this._headers = {};
    if (_typeof(initValues) === 'object') {
      Object.keys(initValues).forEach(function (key) {
        var value = initValues[key];
        if (_instanceof(value, Array)) {
          value.forEach(function (oneData) {
            _this.append(key, oneData);
          });
        } else {
          _this.set(key, value);
        }
      });
    }
  }
  _createClass(Headers, [{
    key: "append",
    value: function append(name, value) {
      if (typeof name !== 'string' || typeof value !== 'string') {
        return;
      }
      if (this.has(name)) {
        var curr = this._headers[name];
        curr.push(value);
        this._headers[name] = curr;
      } else {
        this._headers[name] = [value];
      }
    }
  }, {
    key: "set",
    value: function set(name, value) {
      if (typeof name !== 'string' || typeof value !== 'string') {
        return;
      }
      this._headers[name] = [value];
    }
  }, {
    key: "getAll",
    value: function getAll() {
      if (!this._headers['Content-Type'] && !this._headers['content-type']) {
        this._headers['content-type'] = ['text/plain;charset=UTF-8'];
      }
      return Object.assign({}, this._headers);
    }
  }, {
    key: "delete",
    value: function _delete(name) {
      if (typeof name !== 'string') {
        return;
      }
      if (typeof this._headers[name] !== 'undefined') {
        delete this._headers.name;
      }
    }
  }, {
    key: "get",
    value: function get(name) {
      if (typeof name !== 'string') {
        return undefined;
      }
      return this._headers[name];
    }
  }, {
    key: "has",
    value: function has(name) {
      if (typeof name !== 'string') {
        return false;
      }
      return typeof this._headers[name] !== 'undefined';
    }
  }]);
  return Headers;
}();
global.Response = /*#__PURE__*/function () {
  function Response(response) {
    _classCallCheck(this, Response);
    var resp = response || {};
    this.status = resp.statusCode === undefined ? 200 : resp.statusCode;
    this.statusText = resp.statusLine || 'Not Found';
    this.headers = resp.respHeaders || {};
    this.body = resp.respBody || '';
    this.ok = this.status >= 200 && this.status <= 299;
  }
  _createClass(Response, [{
    key: "json",
    value: function json() {
      var _this2 = this;
      return new Promise(function (resolve, reject) {
        var jsonify = null;
        try {
          jsonify = JSON.parse(_this2.body);
          resolve(jsonify);
        } catch (e) {
          reject(new Error('error parsing object'));
        }
      });
    }
  }, {
    key: "text",
    value: function text() {
      return Promise.resolve(this.body);
    }
  }]);
  return Response;
}();
var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];
function normalizeMethod(method) {
  var upCased = method.toUpperCase();
  return methods.indexOf(upCased) > -1 ? upCased : method;
}
global.fetch = function (url, options) {
  if (typeof url !== 'string') {
    return Promise.reject(new Error('only String url supported'));
  }
  var _ref = options || {},
    method = _ref.method,
    headers = _ref.headers,
    body = _ref.body,
    otherOptions = _objectWithoutProperties(_ref, _excluded);
  var reqHeads = {};
  if (headers) {
    if (_instanceof(headers, global.Headers)) {
      reqHeads = headers.getAll();
    } else if (headers.constructor === Object) {
      var headersInstance = new global.Headers(headers);
      reqHeads = headersInstance.getAll();
    } else {
      return Promise.reject(new Error('Only Headers instance or a pure object is acceptable for headers option'));
    }
  }
  var reqOptions = {
    url: url,
    method: normalizeMethod(method || 'GET'),
    headers: reqHeads || {},
    body: body || '',
    ...otherOptions
  };
  return new Promise(function (resolve, reject) {
    var result = Hippy.bridge.callNativeWithPromise('network', 'fetch', reqOptions);
    result.then(function (resp) {
      if (_typeof(resp) === 'object') {
        var responseData = new global.Response(resp);
        resolve(responseData);
      } else {
        reject(resp);
      }
    }).catch(function (e) {
      reject(e);
    });
  });
};
