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
    const ret = Object.assign({}, this._headers);
    return ret;
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
    this.status = resp.statusCode || 404;
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

global.fetch = (url, options) => {
  if (typeof url !== 'string') {
    return Promise.reject(new Error('only String url supported'));
  }

  const opts = options || {};

  let reqHeads = {};
  if (opts.headers) {
    if (opts.headers instanceof Headers) {
      reqHeads = opts.headers.getAll();
    } else if (opts.headers.constructor === Object) {
      const headers = new Headers(opts.headers);
      reqHeads = headers.getAll();
    } else {
      return Promise.reject(new Error('Only Headers instance or a pure object is acceptable for headers option'));
    }
  }

  const reqOptions = {
    method: opts.method || 'GET',
    url,
    headers: reqHeads || {},
    body: opts.body || '',
  };

  return new Promise((resolve, reject) => {
    const result = Hippy.bridge.callNativeWithPromise('network', 'fetch', reqOptions);
    result.then((resp) => {
      if (typeof resp === 'object') {
        const responseData = new Response(resp);
        resolve(responseData);
      } else {
        reject(resp);
      }
    }).catch((e) => {
      reject(e);
    });
  });
};
