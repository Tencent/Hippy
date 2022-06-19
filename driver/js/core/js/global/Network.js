/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

global.Headers = class Headers {
  constructor(initValues) {
    this._headers = {};
    if (typeof initValues === 'object') {
      Object.keys(initValues).forEach((key) => {
        const value = initValues[key];
        if (value instanceof Array) {
          value.forEach((oneData) => {
            this.append(key, oneData);
          });
        } else {
          this.set(key, value);
        }
      });
    }
  }

  append(name, value) {
    if (typeof name !== 'string' || typeof value !== 'string') {
      return;
    }
    if (this.has(name)) {
      const curr = this._headers[name];
      curr.push(value);
      this._headers[name] = curr;
    } else {
      this._headers[name] = [value];
    }
  }

  set(name, value) {
    if (typeof name !== 'string' || typeof value !== 'string') {
      return;
    }
    this._headers[name] = [value];
  }

  getAll() {
    if (!this._headers['Content-Type'] && !this._headers['content-type']) {
      this._headers['content-type'] = ['text/plain;charset=UTF-8'];
    }
    return Object.assign({}, this._headers);
  }

  delete(name) {
    if (typeof name !== 'string') {
      return;
    }
    if (typeof this._headers[name] !== 'undefined') {
      delete this._headers.name;
    }
  }

  get(name) {
    if (typeof name !== 'string') {
      return undefined;
    }
    return this._headers[name];
  }

  has(name) {
    if (typeof name !== 'string') {
      return false;
    }
    return (typeof this._headers[name] !== 'undefined');
  }
};

global.Response = class Response {
  constructor(response) {
    const resp = response || {};
    this.status = resp.statusCode === undefined ? 200 : resp.statusCode;
    this.statusText = resp.statusLine || 'Not Found';
    this.headers = resp.respHeaders || {};
    this.body = resp.respBody || '';
    this.ok = this.status >= 200 && this.status <= 299;
  }

  json() {
    return new Promise((resolve, reject) => {
      let jsonify = null;
      try {
        jsonify = JSON.parse(this.body);
        resolve(jsonify);
      } catch (e) {
        reject(new Error('error parsing object'));
      }
    });
  }

  text() {
    return Promise.resolve(this.body);
  }
};

const methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

function normalizeMethod(method) {
  const upCased = method.toUpperCase();
  return methods.indexOf(upCased) > -1 ? upCased : method;
}

global.fetch = (url, options) => {
  if (typeof url !== 'string') {
    return Promise.reject(new Error('only String url supported'));
  }

  const { method, headers, body, ...otherOptions } = options || {};
  let reqHeads = {};
  if (headers) {
    if (headers instanceof global.Headers) {
      reqHeads = headers.getAll();
    } else if (headers.constructor === Object) {
      const headersInstance = new global.Headers(headers);
      reqHeads = headersInstance.getAll();
    } else {
      return Promise.reject(new Error('Only Headers instance or a pure object is acceptable for headers option'));
    }
  }

  const reqOptions = {
    url,
    method: normalizeMethod(method || 'GET'),
    headers: reqHeads || {},
    body: body || '',
    ...otherOptions,
  };

  return new Promise((resolve, reject) => {
    const result = Hippy.bridge.callNativeWithPromise('network', 'fetch', reqOptions);
    result.then((resp) => {
      if (typeof resp === 'object') {
        const responseData = new global.Response(resp);
        resolve(responseData);
      } else {
        reject(resp);
      }
    }).catch((e) => {
      reject(e);
    });
  });
};
