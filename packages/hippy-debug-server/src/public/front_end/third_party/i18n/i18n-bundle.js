// lighthouse.i18n 1.0.0, created with rollup.
// DO NOT MODIFY: Generated with buildi18nBundle.js.

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getAugmentedNamespace(n) {
	if (n.__esModule) return n;
	var a = Object.defineProperty({}, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

/**
 * Lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright JS Foundation and other contributors <https://js.foundation/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

var _package = createCommonjsModule(function (module, exports) {
/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    asyncTag = '[object AsyncFunction]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    nullTag = '[object Null]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    proxyTag = '[object Proxy]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    undefinedTag = '[object Undefined]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports = exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice,
    symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols,
    nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    nativeKeys = overArg(Object.keys, Object);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = objIsArr ? arrayTag : getTag(object),
      othTag = othIsArr ? arrayTag : getTag(other);

  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;

  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!cacheHas(seen, othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, bitmask, customizer, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      objProps = getAllKeys(object),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = baseGetTag(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/**
 * Performs a deep comparison between two values to determine if they are
 * equivalent.
 *
 * **Note:** This method supports comparing arrays, array buffers, booleans,
 * date objects, error objects, maps, numbers, `Object` objects, regexes,
 * sets, strings, symbols, and typed arrays. `Object` objects are compared
 * by their own, not inherited, enumerable properties. Functions and DOM
 * nodes are compared by strict equality, i.e. `===`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.isEqual(object, other);
 * // => true
 *
 * object === other;
 * // => false
 */
function isEqual(value, other) {
  return baseIsEqual(value, other);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = isEqual;
});

var intlMessageformat = createCommonjsModule(function (module, exports) {
(function (global, factory) {
  factory(exports) ;
}(commonjsGlobal, function (exports) {
  var parser = /*
   * Generated by PEG.js 0.10.0.
   *
   * http://pegjs.org/
   */
  (function() {

    function peg$subclass(child, parent) {
      function ctor() { this.constructor = child; }
      ctor.prototype = parent.prototype;
      child.prototype = new ctor();
    }

    function peg$SyntaxError(message, expected, found, location) {
      this.message  = message;
      this.expected = expected;
      this.found    = found;
      this.location = location;
      this.name     = "SyntaxError";

      if (typeof Error.captureStackTrace === "function") {
        Error.captureStackTrace(this, peg$SyntaxError);
      }
    }

    peg$subclass(peg$SyntaxError, Error);

    peg$SyntaxError.buildMessage = function(expected, found) {
      var DESCRIBE_EXPECTATION_FNS = {
            literal: function(expectation) {
              return "\"" + literalEscape(expectation.text) + "\"";
            },

            "class": function(expectation) {
              var escapedParts = "",
                  i;

              for (i = 0; i < expectation.parts.length; i++) {
                escapedParts += expectation.parts[i] instanceof Array
                  ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])
                  : classEscape(expectation.parts[i]);
              }

              return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
            },

            any: function(expectation) {
              return "any character";
            },

            end: function(expectation) {
              return "end of input";
            },

            other: function(expectation) {
              return expectation.description;
            }
          };

      function hex(ch) {
        return ch.charCodeAt(0).toString(16).toUpperCase();
      }

      function literalEscape(s) {
        return s
          .replace(/\\/g, '\\\\')
          .replace(/"/g,  '\\"')
          .replace(/\0/g, '\\0')
          .replace(/\t/g, '\\t')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
          .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
      }

      function classEscape(s) {
        return s
          .replace(/\\/g, '\\\\')
          .replace(/\]/g, '\\]')
          .replace(/\^/g, '\\^')
          .replace(/-/g,  '\\-')
          .replace(/\0/g, '\\0')
          .replace(/\t/g, '\\t')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
          .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
      }

      function describeExpectation(expectation) {
        return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
      }

      function describeExpected(expected) {
        var descriptions = new Array(expected.length),
            i, j;

        for (i = 0; i < expected.length; i++) {
          descriptions[i] = describeExpectation(expected[i]);
        }

        descriptions.sort();

        if (descriptions.length > 0) {
          for (i = 1, j = 1; i < descriptions.length; i++) {
            if (descriptions[i - 1] !== descriptions[i]) {
              descriptions[j] = descriptions[i];
              j++;
            }
          }
          descriptions.length = j;
        }

        switch (descriptions.length) {
          case 1:
            return descriptions[0];

          case 2:
            return descriptions[0] + " or " + descriptions[1];

          default:
            return descriptions.slice(0, -1).join(", ")
              + ", or "
              + descriptions[descriptions.length - 1];
        }
      }

      function describeFound(found) {
        return found ? "\"" + literalEscape(found) + "\"" : "end of input";
      }

      return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
    };

    function peg$parse(input, options) {
      options = options !== void 0 ? options : {};

      var peg$FAILED = {},

          peg$startRuleFunctions = { start: peg$parsestart },
          peg$startRuleFunction  = peg$parsestart,

          peg$c0 = function(elements) {
                  return {
                      type    : 'messageFormatPattern',
                      elements: elements,
                      location: location()
                  };
              },
          peg$c1 = function(chunks) {
                  return chunks.reduce(function (all, chunk) {
                      return all.concat(chunk)
                  }, []).join('')
              },
          peg$c2 = function(messageText) {
                  return {
                      type : 'messageTextElement',
                      value: messageText,
                      location: location()
                  };
              },
          peg$c3 = function(chars) { return chars.join(''); },
          peg$c4 = "{",
          peg$c5 = peg$literalExpectation("{", false),
          peg$c6 = ",",
          peg$c7 = peg$literalExpectation(",", false),
          peg$c8 = "}",
          peg$c9 = peg$literalExpectation("}", false),
          peg$c10 = function(id, format) {
                  return {
                      type  : 'argumentElement',
                      id    : id,
                      format: format && format[2],
                      location: location()
                  };
              },
          peg$c11 = "number",
          peg$c12 = peg$literalExpectation("number", false),
          peg$c13 = "date",
          peg$c14 = peg$literalExpectation("date", false),
          peg$c15 = "time",
          peg$c16 = peg$literalExpectation("time", false),
          peg$c17 = function(type, style) {
                  return {
                      type : type + 'Format',
                      style: style && style[2],
                      location: location()
                  };
              },
          peg$c18 = "plural",
          peg$c19 = peg$literalExpectation("plural", false),
          peg$c20 = function(pluralStyle) {
                  return {
                      type   : pluralStyle.type,
                      ordinal: false,
                      offset : pluralStyle.offset || 0,
                      options: pluralStyle.options,
                      location: location()
                  };
              },
          peg$c21 = "selectordinal",
          peg$c22 = peg$literalExpectation("selectordinal", false),
          peg$c23 = function(pluralStyle) {
                  return {
                      type   : pluralStyle.type,
                      ordinal: true,
                      offset : pluralStyle.offset || 0,
                      options: pluralStyle.options,
                      location: location()
                  }
              },
          peg$c24 = "select",
          peg$c25 = peg$literalExpectation("select", false),
          peg$c26 = function(options) {
                  return {
                      type   : 'selectFormat',
                      options: options,
                      location: location()
                  };
              },
          peg$c27 = "=",
          peg$c28 = peg$literalExpectation("=", false),
          peg$c29 = function(selector, pattern) {
                  return {
                      type    : 'optionalFormatPattern',
                      selector: selector,
                      value   : pattern,
                      location: location()
                  };
              },
          peg$c30 = "offset:",
          peg$c31 = peg$literalExpectation("offset:", false),
          peg$c32 = function(number) {
                  return number;
              },
          peg$c33 = function(offset, options) {
                  return {
                      type   : 'pluralFormat',
                      offset : offset,
                      options: options,
                      location: location()
                  };
              },
          peg$c34 = peg$otherExpectation("whitespace"),
          peg$c35 = /^[ \t\n\r]/,
          peg$c36 = peg$classExpectation([" ", "\t", "\n", "\r"], false, false),
          peg$c37 = peg$otherExpectation("optionalWhitespace"),
          peg$c38 = /^[0-9]/,
          peg$c39 = peg$classExpectation([["0", "9"]], false, false),
          peg$c40 = /^[0-9a-f]/i,
          peg$c41 = peg$classExpectation([["0", "9"], ["a", "f"]], false, true),
          peg$c42 = "0",
          peg$c43 = peg$literalExpectation("0", false),
          peg$c44 = /^[1-9]/,
          peg$c45 = peg$classExpectation([["1", "9"]], false, false),
          peg$c46 = function(digits) {
              return parseInt(digits, 10);
          },
          peg$c47 = "'",
          peg$c48 = peg$literalExpectation("'", false),
          peg$c49 = /^[ \t\n\r,.+={}#]/,
          peg$c50 = peg$classExpectation([" ", "\t", "\n", "\r", ",", ".", "+", "=", "{", "}", "#"], false, false),
          peg$c51 = peg$anyExpectation(),
          peg$c52 = function(char) { return char; },
          peg$c53 = function(sequence) { return sequence; },
          peg$c54 = /^[^{}\\\0-\x1F\x7F \t\n\r]/,
          peg$c55 = peg$classExpectation(["{", "}", "\\", ["\0", "\x1F"], "\x7F", " ", "\t", "\n", "\r"], true, false),
          peg$c56 = "\\\\",
          peg$c57 = peg$literalExpectation("\\\\", false),
          peg$c58 = function() { return '\\'; },
          peg$c59 = "\\#",
          peg$c60 = peg$literalExpectation("\\#", false),
          peg$c61 = function() { return '\\#'; },
          peg$c62 = "\\{",
          peg$c63 = peg$literalExpectation("\\{", false),
          peg$c64 = function() { return '\u007B'; },
          peg$c65 = "\\}",
          peg$c66 = peg$literalExpectation("\\}", false),
          peg$c67 = function() { return '\u007D'; },
          peg$c68 = "\\u",
          peg$c69 = peg$literalExpectation("\\u", false),
          peg$c70 = function(digits) {
                  return String.fromCharCode(parseInt(digits, 16));
              },

          peg$currPos          = 0,
          peg$savedPos         = 0,
          peg$posDetailsCache  = [{ line: 1, column: 1 }],
          peg$maxFailPos       = 0,
          peg$maxFailExpected  = [],
          peg$silentFails      = 0,

          peg$result;

      if ("startRule" in options) {
        if (!(options.startRule in peg$startRuleFunctions)) {
          throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
        }

        peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
      }

      function location() {
        return peg$computeLocation(peg$savedPos, peg$currPos);
      }

      function peg$literalExpectation(text, ignoreCase) {
        return { type: "literal", text: text, ignoreCase: ignoreCase };
      }

      function peg$classExpectation(parts, inverted, ignoreCase) {
        return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
      }

      function peg$anyExpectation() {
        return { type: "any" };
      }

      function peg$endExpectation() {
        return { type: "end" };
      }

      function peg$otherExpectation(description) {
        return { type: "other", description: description };
      }

      function peg$computePosDetails(pos) {
        var details = peg$posDetailsCache[pos], p;

        if (details) {
          return details;
        } else {
          p = pos - 1;
          while (!peg$posDetailsCache[p]) {
            p--;
          }

          details = peg$posDetailsCache[p];
          details = {
            line:   details.line,
            column: details.column
          };

          while (p < pos) {
            if (input.charCodeAt(p) === 10) {
              details.line++;
              details.column = 1;
            } else {
              details.column++;
            }

            p++;
          }

          peg$posDetailsCache[pos] = details;
          return details;
        }
      }

      function peg$computeLocation(startPos, endPos) {
        var startPosDetails = peg$computePosDetails(startPos),
            endPosDetails   = peg$computePosDetails(endPos);

        return {
          start: {
            offset: startPos,
            line:   startPosDetails.line,
            column: startPosDetails.column
          },
          end: {
            offset: endPos,
            line:   endPosDetails.line,
            column: endPosDetails.column
          }
        };
      }

      function peg$fail(expected) {
        if (peg$currPos < peg$maxFailPos) { return; }

        if (peg$currPos > peg$maxFailPos) {
          peg$maxFailPos = peg$currPos;
          peg$maxFailExpected = [];
        }

        peg$maxFailExpected.push(expected);
      }

      function peg$buildStructuredError(expected, found, location) {
        return new peg$SyntaxError(
          peg$SyntaxError.buildMessage(expected, found),
          expected,
          found,
          location
        );
      }

      function peg$parsestart() {
        var s0;

        s0 = peg$parsemessageFormatPattern();

        return s0;
      }

      function peg$parsemessageFormatPattern() {
        var s0, s1, s2;

        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parsemessageFormatElement();
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parsemessageFormatElement();
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c0(s1);
        }
        s0 = s1;

        return s0;
      }

      function peg$parsemessageFormatElement() {
        var s0;

        s0 = peg$parsemessageTextElement();
        if (s0 === peg$FAILED) {
          s0 = peg$parseargumentElement();
        }

        return s0;
      }

      function peg$parsemessageText() {
        var s0, s1, s2, s3, s4, s5;

        s0 = peg$currPos;
        s1 = [];
        s2 = peg$currPos;
        s3 = peg$parse_();
        if (s3 !== peg$FAILED) {
          s4 = peg$parsechars();
          if (s4 !== peg$FAILED) {
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              s3 = [s3, s4, s5];
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$currPos;
            s3 = peg$parse_();
            if (s3 !== peg$FAILED) {
              s4 = peg$parsechars();
              if (s4 !== peg$FAILED) {
                s5 = peg$parse_();
                if (s5 !== peg$FAILED) {
                  s3 = [s3, s4, s5];
                  s2 = s3;
                } else {
                  peg$currPos = s2;
                  s2 = peg$FAILED;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          }
        } else {
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c1(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parsews();
          if (s1 !== peg$FAILED) {
            s0 = input.substring(s0, peg$currPos);
          } else {
            s0 = s1;
          }
        }

        return s0;
      }

      function peg$parsemessageTextElement() {
        var s0, s1;

        s0 = peg$currPos;
        s1 = peg$parsemessageText();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c2(s1);
        }
        s0 = s1;

        return s0;
      }

      function peg$parseargument() {
        var s0, s1, s2;

        s0 = peg$parsenumber();
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = [];
          s2 = peg$parsequoteEscapedChar();
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parsequoteEscapedChar();
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c3(s1);
          }
          s0 = s1;
        }

        return s0;
      }

      function peg$parseargumentElement() {
        var s0, s1, s2, s3, s4, s5, s6, s7, s8;

        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
          s1 = peg$c4;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c5); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseargument();
            if (s3 !== peg$FAILED) {
              s4 = peg$parse_();
              if (s4 !== peg$FAILED) {
                s5 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 44) {
                  s6 = peg$c6;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c7); }
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parseelementFormat();
                    if (s8 !== peg$FAILED) {
                      s6 = [s6, s7, s8];
                      s5 = s6;
                    } else {
                      peg$currPos = s5;
                      s5 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
                if (s5 === peg$FAILED) {
                  s5 = null;
                }
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse_();
                  if (s6 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 125) {
                      s7 = peg$c8;
                      peg$currPos++;
                    } else {
                      s7 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c9); }
                    }
                    if (s7 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c10(s3, s5);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseelementFormat() {
        var s0;

        s0 = peg$parsesimpleFormat();
        if (s0 === peg$FAILED) {
          s0 = peg$parsepluralFormat();
          if (s0 === peg$FAILED) {
            s0 = peg$parseselectOrdinalFormat();
            if (s0 === peg$FAILED) {
              s0 = peg$parseselectFormat();
            }
          }
        }

        return s0;
      }

      function peg$parsesimpleFormat() {
        var s0, s1, s2, s3, s4, s5, s6;

        s0 = peg$currPos;
        if (input.substr(peg$currPos, 6) === peg$c11) {
          s1 = peg$c11;
          peg$currPos += 6;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c12); }
        }
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 4) === peg$c13) {
            s1 = peg$c13;
            peg$currPos += 4;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c14); }
          }
          if (s1 === peg$FAILED) {
            if (input.substr(peg$currPos, 4) === peg$c15) {
              s1 = peg$c15;
              peg$currPos += 4;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c16); }
            }
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            s3 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 44) {
              s4 = peg$c6;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c7); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsechars();
                if (s6 !== peg$FAILED) {
                  s4 = [s4, s5, s6];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
            if (s3 === peg$FAILED) {
              s3 = null;
            }
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c17(s1, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parsepluralFormat() {
        var s0, s1, s2, s3, s4, s5;

        s0 = peg$currPos;
        if (input.substr(peg$currPos, 6) === peg$c18) {
          s1 = peg$c18;
          peg$currPos += 6;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c19); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 44) {
              s3 = peg$c6;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c7); }
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parse_();
              if (s4 !== peg$FAILED) {
                s5 = peg$parsepluralStyle();
                if (s5 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c20(s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseselectOrdinalFormat() {
        var s0, s1, s2, s3, s4, s5;

        s0 = peg$currPos;
        if (input.substr(peg$currPos, 13) === peg$c21) {
          s1 = peg$c21;
          peg$currPos += 13;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c22); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 44) {
              s3 = peg$c6;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c7); }
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parse_();
              if (s4 !== peg$FAILED) {
                s5 = peg$parsepluralStyle();
                if (s5 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c23(s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseselectFormat() {
        var s0, s1, s2, s3, s4, s5, s6;

        s0 = peg$currPos;
        if (input.substr(peg$currPos, 6) === peg$c24) {
          s1 = peg$c24;
          peg$currPos += 6;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c25); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 44) {
              s3 = peg$c6;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c7); }
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parse_();
              if (s4 !== peg$FAILED) {
                s5 = [];
                s6 = peg$parseoptionalFormatPattern();
                if (s6 !== peg$FAILED) {
                  while (s6 !== peg$FAILED) {
                    s5.push(s6);
                    s6 = peg$parseoptionalFormatPattern();
                  }
                } else {
                  s5 = peg$FAILED;
                }
                if (s5 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c26(s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseselector() {
        var s0, s1, s2, s3;

        s0 = peg$currPos;
        s1 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 61) {
          s2 = peg$c27;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c28); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenumber();
          if (s3 !== peg$FAILED) {
            s2 = [s2, s3];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          s0 = input.substring(s0, peg$currPos);
        } else {
          s0 = s1;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parsechars();
        }

        return s0;
      }

      function peg$parseoptionalFormatPattern() {
        var s0, s1, s2, s3, s4, s5, s6;

        s0 = peg$currPos;
        s1 = peg$parse_();
        if (s1 !== peg$FAILED) {
          s2 = peg$parseselector();
          if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            if (s3 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 123) {
                s4 = peg$c4;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c5); }
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parsemessageFormatPattern();
                if (s5 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 125) {
                    s6 = peg$c8;
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c9); }
                  }
                  if (s6 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c29(s2, s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseoffset() {
        var s0, s1, s2, s3;

        s0 = peg$currPos;
        if (input.substr(peg$currPos, 7) === peg$c30) {
          s1 = peg$c30;
          peg$currPos += 7;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c31); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            s3 = peg$parsenumber();
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c32(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parsepluralStyle() {
        var s0, s1, s2, s3, s4;

        s0 = peg$currPos;
        s1 = peg$parseoffset();
        if (s1 === peg$FAILED) {
          s1 = null;
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$parseoptionalFormatPattern();
            if (s4 !== peg$FAILED) {
              while (s4 !== peg$FAILED) {
                s3.push(s4);
                s4 = peg$parseoptionalFormatPattern();
              }
            } else {
              s3 = peg$FAILED;
            }
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c33(s1, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parsews() {
        var s0, s1;

        peg$silentFails++;
        s0 = [];
        if (peg$c35.test(input.charAt(peg$currPos))) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c36); }
        }
        if (s1 !== peg$FAILED) {
          while (s1 !== peg$FAILED) {
            s0.push(s1);
            if (peg$c35.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c36); }
            }
          }
        } else {
          s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c34); }
        }

        return s0;
      }

      function peg$parse_() {
        var s0, s1, s2;

        peg$silentFails++;
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parsews();
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parsews();
        }
        if (s1 !== peg$FAILED) {
          s0 = input.substring(s0, peg$currPos);
        } else {
          s0 = s1;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c37); }
        }

        return s0;
      }

      function peg$parsedigit() {
        var s0;

        if (peg$c38.test(input.charAt(peg$currPos))) {
          s0 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c39); }
        }

        return s0;
      }

      function peg$parsehexDigit() {
        var s0;

        if (peg$c40.test(input.charAt(peg$currPos))) {
          s0 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c41); }
        }

        return s0;
      }

      function peg$parsenumber() {
        var s0, s1, s2, s3, s4, s5;

        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 48) {
          s1 = peg$c42;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c43); }
        }
        if (s1 === peg$FAILED) {
          s1 = peg$currPos;
          s2 = peg$currPos;
          if (peg$c44.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c45); }
          }
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$parsedigit();
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$parsedigit();
            }
            if (s4 !== peg$FAILED) {
              s3 = [s3, s4];
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
          if (s2 !== peg$FAILED) {
            s1 = input.substring(s1, peg$currPos);
          } else {
            s1 = s2;
          }
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c46(s1);
        }
        s0 = s1;

        return s0;
      }

      function peg$parsequoteEscapedChar() {
        var s0, s1, s2;

        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        if (input.charCodeAt(peg$currPos) === 39) {
          s2 = peg$c47;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c48); }
        }
        if (s2 === peg$FAILED) {
          if (peg$c49.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c50); }
          }
        }
        peg$silentFails--;
        if (s2 === peg$FAILED) {
          s1 = void 0;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c51); }
          }
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c52(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 39) {
            s1 = peg$c47;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c48); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parseescape();
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c53(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }

        return s0;
      }

      function peg$parseapostrophe() {
        var s0;

        if (input.charCodeAt(peg$currPos) === 39) {
          s0 = peg$c47;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c48); }
        }

        return s0;
      }

      function peg$parseescape() {
        var s0;

        if (peg$c49.test(input.charAt(peg$currPos))) {
          s0 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c50); }
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parseapostrophe();
        }

        return s0;
      }

      function peg$parsechar() {
        var s0, s1, s2, s3, s4, s5, s6, s7;

        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 39) {
          s1 = peg$c47;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c48); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parseapostrophe();
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c53(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          if (peg$c54.test(input.charAt(peg$currPos))) {
            s0 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c55); }
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c56) {
              s1 = peg$c56;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c57); }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c58();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c59) {
                s1 = peg$c59;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c60); }
              }
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c61();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 2) === peg$c62) {
                  s1 = peg$c62;
                  peg$currPos += 2;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c63); }
                }
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c64();
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.substr(peg$currPos, 2) === peg$c65) {
                    s1 = peg$c65;
                    peg$currPos += 2;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c66); }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c67();
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 2) === peg$c68) {
                      s1 = peg$c68;
                      peg$currPos += 2;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c69); }
                    }
                    if (s1 !== peg$FAILED) {
                      s2 = peg$currPos;
                      s3 = peg$currPos;
                      s4 = peg$parsehexDigit();
                      if (s4 !== peg$FAILED) {
                        s5 = peg$parsehexDigit();
                        if (s5 !== peg$FAILED) {
                          s6 = peg$parsehexDigit();
                          if (s6 !== peg$FAILED) {
                            s7 = peg$parsehexDigit();
                            if (s7 !== peg$FAILED) {
                              s4 = [s4, s5, s6, s7];
                              s3 = s4;
                            } else {
                              peg$currPos = s3;
                              s3 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s3;
                          s3 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                      }
                      if (s3 !== peg$FAILED) {
                        s2 = input.substring(s2, peg$currPos);
                      } else {
                        s2 = s3;
                      }
                      if (s2 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c70(s2);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  }
                }
              }
            }
          }
        }

        return s0;
      }

      function peg$parsechars() {
        var s0, s1, s2;

        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parsechar();
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parsechar();
          }
        } else {
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c3(s1);
        }
        s0 = s1;

        return s0;
      }

      peg$result = peg$startRuleFunction();

      if (peg$result !== peg$FAILED && peg$currPos === input.length) {
        return peg$result;
      } else {
        if (peg$result !== peg$FAILED && peg$currPos < input.length) {
          peg$fail(peg$endExpectation());
        }

        throw peg$buildStructuredError(
          peg$maxFailExpected,
          peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
          peg$maxFailPos < input.length
            ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
            : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
        );
      }
    }

    return {
      SyntaxError: peg$SyntaxError,
      parse:       peg$parse
    };
  })();

  /*
  Copyright (c) 2014, Yahoo! Inc. All rights reserved.
  Copyrights licensed under the New BSD License.
  See the accompanying LICENSE file for terms.
  */
  var __extends = (function () {
      var extendStatics = function (d, b) {
          extendStatics = Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
              function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
          return extendStatics(d, b);
      };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  var Compiler = /** @class */ (function () {
      function Compiler(locales, formats, formatters) {
          this.locales = [];
          this.formats = {
              number: {},
              date: {},
              time: {}
          };
          this.pluralNumberFormat = null;
          this.currentPlural = null;
          this.pluralStack = [];
          this.locales = locales;
          this.formats = formats;
          this.formatters = formatters;
      }
      Compiler.prototype.compile = function (ast) {
          this.pluralStack = [];
          this.currentPlural = null;
          this.pluralNumberFormat = null;
          return this.compileMessage(ast);
      };
      Compiler.prototype.compileMessage = function (ast) {
          var _this = this;
          if (!(ast && ast.type === 'messageFormatPattern')) {
              throw new Error('Message AST is not of type: "messageFormatPattern"');
          }
          var elements = ast.elements;
          var pattern = elements
              .filter(function (el) {
              return el.type === 'messageTextElement' || el.type === 'argumentElement';
          })
              .map(function (el) {
              return el.type === 'messageTextElement'
                  ? _this.compileMessageText(el)
                  : _this.compileArgument(el);
          });
          if (pattern.length !== elements.length) {
              throw new Error('Message element does not have a valid type');
          }
          return pattern;
      };
      Compiler.prototype.compileMessageText = function (element) {
          // When this `element` is part of plural sub-pattern and its value contains
          // an unescaped '#', use a `PluralOffsetString` helper to properly output
          // the number with the correct offset in the string.
          if (this.currentPlural && /(^|[^\\])#/g.test(element.value)) {
              // Create a cache a NumberFormat instance that can be reused for any
              // PluralOffsetString instance in this message.
              if (!this.pluralNumberFormat) {
                  this.pluralNumberFormat = new Intl.NumberFormat(this.locales);
              }
              return new PluralOffsetString(this.currentPlural.id, this.currentPlural.format.offset, this.pluralNumberFormat, element.value);
          }
          // Unescape the escaped '#'s in the message text.
          return element.value.replace(/\\#/g, '#');
      };
      Compiler.prototype.compileArgument = function (element) {
          var format = element.format, id = element.id;
          var formatters = this.formatters;
          if (!format) {
              return new StringFormat(id);
          }
          var _a = this, formats = _a.formats, locales = _a.locales;
          switch (format.type) {
              case 'numberFormat':
                  return {
                      id: id,
                      format: formatters.getNumberFormat(locales, formats.number[format.style]).format
                  };
              case 'dateFormat':
                  return {
                      id: id,
                      format: formatters.getDateTimeFormat(locales, formats.date[format.style]).format
                  };
              case 'timeFormat':
                  return {
                      id: id,
                      format: formatters.getDateTimeFormat(locales, formats.time[format.style]).format
                  };
              case 'pluralFormat':
                  return new PluralFormat(id, format.offset, this.compileOptions(element), formatters.getPluralRules(locales, {
                      type: format.ordinal ? 'ordinal' : 'cardinal'
                  }));
              case 'selectFormat':
                  return new SelectFormat(id, this.compileOptions(element));
              default:
                  throw new Error('Message element does not have a valid format type');
          }
      };
      Compiler.prototype.compileOptions = function (element) {
          var _this = this;
          var format = element.format;
          var options = format.options;
          // Save the current plural element, if any, then set it to a new value when
          // compiling the options sub-patterns. This conforms the spec's algorithm
          // for handling `"#"` syntax in message text.
          this.pluralStack.push(this.currentPlural);
          this.currentPlural = format.type === 'pluralFormat' ? element : null;
          var optionsHash = options.reduce(function (all, option) {
              // Compile the sub-pattern and save it under the options's selector.
              all[option.selector] = _this.compileMessage(option.value);
              return all;
          }, {});
          // Pop the plural stack to put back the original current plural value.
          this.currentPlural = this.pluralStack.pop();
          return optionsHash;
      };
      return Compiler;
  }());
  // -- Compiler Helper Classes --------------------------------------------------
  var Formatter = /** @class */ (function () {
      function Formatter(id) {
          this.id = id;
      }
      return Formatter;
  }());
  var StringFormat = /** @class */ (function (_super) {
      __extends(StringFormat, _super);
      function StringFormat() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      StringFormat.prototype.format = function (value) {
          if (!value && typeof value !== 'number') {
              return '';
          }
          return typeof value === 'string' ? value : String(value);
      };
      return StringFormat;
  }(Formatter));
  var PluralFormat = /** @class */ (function () {
      function PluralFormat(id, offset, options, pluralRules) {
          this.id = id;
          this.offset = offset;
          this.options = options;
          this.pluralRules = pluralRules;
      }
      PluralFormat.prototype.getOption = function (value) {
          var options = this.options;
          var option = options['=' + value] ||
              options[this.pluralRules.select(value - this.offset)];
          return option || options.other;
      };
      return PluralFormat;
  }());
  var PluralOffsetString = /** @class */ (function (_super) {
      __extends(PluralOffsetString, _super);
      function PluralOffsetString(id, offset, numberFormat, string) {
          var _this = _super.call(this, id) || this;
          _this.offset = offset;
          _this.numberFormat = numberFormat;
          _this.string = string;
          return _this;
      }
      PluralOffsetString.prototype.format = function (value) {
          var number = this.numberFormat.format(value - this.offset);
          return this.string
              .replace(/(^|[^\\])#/g, '$1' + number)
              .replace(/\\#/g, '#');
      };
      return PluralOffsetString;
  }(Formatter));
  var SelectFormat = /** @class */ (function () {
      function SelectFormat(id, options) {
          this.id = id;
          this.options = options;
      }
      SelectFormat.prototype.getOption = function (value) {
          var options = this.options;
          return options[value] || options.other;
      };
      return SelectFormat;
  }());
  function isSelectOrPluralFormat(f) {
      return !!f.options;
  }

  /*
  Copyright (c) 2014, Yahoo! Inc. All rights reserved.
  Copyrights licensed under the New BSD License.
  See the accompanying LICENSE file for terms.
  */
  var __extends$1 = (function () {
      var extendStatics = function (d, b) {
          extendStatics = Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
              function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
          return extendStatics(d, b);
      };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  var __assign = function () {
      __assign = Object.assign || function(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];
              for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                  t[p] = s[p];
          }
          return t;
      };
      return __assign.apply(this, arguments);
  };
  // -- MessageFormat --------------------------------------------------------
  function resolveLocale(locales) {
      if (typeof locales === 'string') {
          locales = [locales];
      }
      try {
          return Intl.NumberFormat.supportedLocalesOf(locales, {
              // IE11 localeMatcher `lookup` seems to convert `en` -> `en-US`
              // but not other browsers,
              localeMatcher: 'best fit'
          })[0];
      }
      catch (e) {
          return IntlMessageFormat.defaultLocale;
      }
  }
  function formatPatterns(pattern, values) {
      var result = '';
      for (var _i = 0, pattern_1 = pattern; _i < pattern_1.length; _i++) {
          var part = pattern_1[_i];
          // Exist early for string parts.
          if (typeof part === 'string') {
              result += part;
              continue;
          }
          var id = part.id;
          // Enforce that all required values are provided by the caller.
          if (!(values && id in values)) {
              throw new FormatError("A value must be provided for: " + id, id);
          }
          var value = values[id];
          // Recursively format plural and select parts' option — which can be a
          // nested pattern structure. The choosing of the option to use is
          // abstracted-by and delegated-to the part helper object.
          if (isSelectOrPluralFormat(part)) {
              result += formatPatterns(part.getOption(value), values);
          }
          else {
              result += part.format(value);
          }
      }
      return result;
  }
  function mergeConfig(c1, c2) {
      if (!c2) {
          return c1;
      }
      return __assign({}, (c1 || {}), (c2 || {}), Object.keys(c1).reduce(function (all, k) {
          all[k] = __assign({}, c1[k], (c2[k] || {}));
          return all;
      }, {}));
  }
  function mergeConfigs(defaultConfig, configs) {
      if (!configs) {
          return defaultConfig;
      }
      return Object.keys(defaultConfig).reduce(function (all, k) {
          all[k] = mergeConfig(defaultConfig[k], configs[k]);
          return all;
      }, __assign({}, defaultConfig));
  }
  var FormatError = /** @class */ (function (_super) {
      __extends$1(FormatError, _super);
      function FormatError(msg, variableId) {
          var _this = _super.call(this, msg) || this;
          _this.variableId = variableId;
          return _this;
      }
      return FormatError;
  }(Error));
  function createDefaultFormatters() {
      return {
          getNumberFormat: function () {
              var _a;
              var args = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                  args[_i] = arguments[_i];
              }
              return new ((_a = Intl.NumberFormat).bind.apply(_a, [void 0].concat(args)))();
          },
          getDateTimeFormat: function () {
              var _a;
              var args = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                  args[_i] = arguments[_i];
              }
              return new ((_a = Intl.DateTimeFormat).bind.apply(_a, [void 0].concat(args)))();
          },
          getPluralRules: function () {
              var _a;
              var args = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                  args[_i] = arguments[_i];
              }
              return new ((_a = Intl.PluralRules).bind.apply(_a, [void 0].concat(args)))();
          }
      };
  }
  var IntlMessageFormat = /** @class */ (function () {
      function IntlMessageFormat(message, locales, overrideFormats, opts) {
          var _this = this;
          if (locales === void 0) { locales = IntlMessageFormat.defaultLocale; }
          this.format = function (values) {
              try {
                  return formatPatterns(_this.pattern, values);
              }
              catch (e) {
                  if (e.variableId) {
                      throw new Error("The intl string context variable '" + e.variableId + "' was not provided to the string '" + _this.message + "'");
                  }
                  else {
                      throw e;
                  }
              }
          };
          if (typeof message === 'string') {
              if (!IntlMessageFormat.__parse) {
                  throw new TypeError('IntlMessageFormat.__parse must be set to process `message` of type `string`');
              }
              // Parse string messages into an AST.
              this.ast = IntlMessageFormat.__parse(message);
          }
          else {
              this.ast = message;
          }
          this.message = message;
          if (!(this.ast && this.ast.type === 'messageFormatPattern')) {
              throw new TypeError('A message must be provided as a String or AST.');
          }
          // Creates a new object with the specified `formats` merged with the default
          // formats.
          var formats = mergeConfigs(IntlMessageFormat.formats, overrideFormats);
          // Defined first because it's used to build the format pattern.
          this.locale = resolveLocale(locales || []);
          var formatters = (opts && opts.formatters) || createDefaultFormatters();
          // Compile the `ast` to a pattern that is highly optimized for repeated
          // `format()` invocations. **Note:** This passes the `locales` set provided
          // to the constructor instead of just the resolved locale.
          this.pattern = new Compiler(locales, formats, formatters).compile(this.ast);
          // "Bind" `format()` method to `this` so it can be passed by reference like
          // the other `Intl` APIs.
      }
      IntlMessageFormat.prototype.resolvedOptions = function () {
          return { locale: this.locale };
      };
      IntlMessageFormat.prototype.getAst = function () {
          return this.ast;
      };
      IntlMessageFormat.defaultLocale = 'en';
      IntlMessageFormat.__parse = undefined;
      // Default format options used as the prototype of the `formats` provided to the
      // constructor. These are used when constructing the internal Intl.NumberFormat
      // and Intl.DateTimeFormat instances.
      IntlMessageFormat.formats = {
          number: {
              currency: {
                  style: 'currency'
              },
              percent: {
                  style: 'percent'
              }
          },
          date: {
              short: {
                  month: 'numeric',
                  day: 'numeric',
                  year: '2-digit'
              },
              medium: {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
              },
              long: {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
              },
              full: {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
              }
          },
          time: {
              short: {
                  hour: 'numeric',
                  minute: 'numeric'
              },
              medium: {
                  hour: 'numeric',
                  minute: 'numeric',
                  second: 'numeric'
              },
              long: {
                  hour: 'numeric',
                  minute: 'numeric',
                  second: 'numeric',
                  timeZoneName: 'short'
              },
              full: {
                  hour: 'numeric',
                  minute: 'numeric',
                  second: 'numeric',
                  timeZoneName: 'short'
              }
          }
      };
      return IntlMessageFormat;
  }());

  /*
  Copyright (c) 2014, Yahoo! Inc. All rights reserved.
  Copyrights licensed under the New BSD License.
  See the accompanying LICENSE file for terms.
  */
  IntlMessageFormat.__parse = parser.parse;

  exports.IntlMessageFormat = IntlMessageFormat;
  exports.createDefaultFormatters = createDefaultFormatters;
  exports.default = IntlMessageFormat;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=intl-messageformat.js.map
});

/**
 * @license Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/** @fileoverview
 *  Define the available locale list
 */

const locales = {
  'en-US': {'title': 'value'}, // The 'source' strings, with descriptions
  'en-XL': {'title': 'value'}, // local pseudolocalization
  'zh': {'title': 'value'},
};

var locales$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': locales
});

var LOCALES = /*@__PURE__*/getAugmentedNamespace(locales$1);

/**
 * @license Copyright 2018 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


const MessageFormat = intlMessageformat.default;


/** @typedef {import('intl-messageformat-parser').Element} MessageElement */
/** @typedef {import('intl-messageformat-parser').ArgumentElement} ArgumentElement */

const MESSAGE_INSTANCE_ID_REGEX = /(.* \| .*) # (\d+)$/;
// Above regex is very slow against large strings. Use QUICK_REGEX as a much quicker discriminator.
const MESSAGE_INSTANCE_ID_QUICK_REGEX = / # \d+$/;

const formats = {
  number: {
    bytes: {
      maximumFractionDigits: 0,
    },
    milliseconds: {
      maximumFractionDigits: 0,
    },
    seconds: {
      // Force the seconds to the tenths place for limited output and ease of scanning
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    },
    extendedPercent: {
      // Force allow up to two digits after decimal place in percentages. (Intl.NumberFormat options)
      maximumFractionDigits: 2,
      style: 'percent',
    },
  },
};

/**
 * Look up the best available locale for the requested language through these fall backs:
 * - exact match
 * - progressively shorter prefixes (`de-CH-1996` -> `de-CH` -> `de`)
 * - the default locale ('en-US') if no match is found
 *
 * If `locale` isn't provided, the default is used.
 * @param {string=} locale
 * @return {LH.Locale}
 */
function lookupLocale(locale) {
  // TODO: could do more work to sniff out default locale
  const canonicalLocale = Intl.getCanonicalLocales(locale)[0];

  const closestLocale = lookupClosestLocale(canonicalLocale, LOCALES);
  return closestLocale || 'en-US';
}

/**
 * Function to retrieve all 'argumentElement's from an ICU message. An argumentElement
 * is an ICU element with an argument in it, like '{varName}' or '{varName, number, bytes}'. This
 * differs from 'messageElement's which are just arbitrary text in a message.
 *
 * Notes:
 *  This function will recursively inspect plural elements for nested argumentElements.
 *
 *  We need to find all the elements from the plural format sections, but
 *  they need to be deduplicated. I.e. "=1{hello {icu}} =other{hello {icu}}"
 *  the variable "icu" would appear twice if it wasn't de duplicated. And they cannot
 *  be stored in a set because they are not equal since their locations are different,
 *  thus they are stored via a Map keyed on the "id" which is the ICU varName.
 *
 * @param {Array<MessageElement>} icuElements
 * @param {Map<string, ArgumentElement>} [seenElementsById]
 * @return {Map<string, ArgumentElement>}
 */
function collectAllCustomElementsFromICU(icuElements, seenElementsById = new Map()) {
  for (const el of icuElements) {
    // We are only interested in elements that need ICU formatting (argumentElements)
    if (el.type !== 'argumentElement') continue;

    seenElementsById.set(el.id, el);

    // Plurals need to be inspected recursively
    if (!el.format || el.format.type !== 'pluralFormat') continue;
    // Look at all options of the plural (=1{} =other{}...)
    for (const option of el.format.options) {
      // Run collections on each option's elements
      collectAllCustomElementsFromICU(option.value.elements, seenElementsById);
    }
  }

  return seenElementsById;
}

/**
 * Returns a copy of the `values` object, with the values formatted based on how
 * they will be used in the `icuMessage`, e.g. KB or milliseconds. The original
 * object is unchanged.
 * @param {string} icuMessageId
 * @param {string} icuMessage
 * @param {MessageFormat} messageFormatter
 * @param {Readonly<Record<string, string | number>>} values
 * @return {Record<string, string | number>}
 */
function _preformatValues(icuMessageId, icuMessage, messageFormatter, values) {
  const elementMap = collectAllCustomElementsFromICU(messageFormatter.getAst().elements);
  const argumentElements = [...elementMap.values()];

  /** @type {Record<string, string | number>} */
  const formattedValues = {};

  for (const {id, format} of argumentElements) {
    // Throw an error if a message's value isn't provided
    if (id && (id in values) === false) {
      throw new Error(`ICU Message with ID "${icuMessageId}" contains a value reference ("${id}") ` +
        `that wasn't provided. Full message text: "${icuMessage}"` + '\n' +
        new Error().stack);
    }

    const value = values[id];

    // Direct `{id}` replacement and non-numeric values need no formatting.
    if (!format || format.type !== 'numberFormat') {
      formattedValues[id] = value;
      continue;
    }

    if (typeof value !== 'number') {
      throw new Error(`ICU Message "${icuMessage}" contains a numeric reference ("${id}") ` +
        'but provided value was not a number');
    }

    // Format values for known styles.
    if (format.style === 'milliseconds') {
      // Round all milliseconds to the nearest 10.
      formattedValues[id] = Math.round(value / 10) * 10;
    } else if (format.style === 'seconds' && id === 'timeInMs') {
      // Convert all seconds to the correct unit (currently only for `timeInMs`).
      formattedValues[id] = Math.round(value / 100) / 10;
    } else if (format.style === 'bytes') {
      // Replace all the bytes with KB.
      formattedValues[id] = value / 1024;
    } else {
      // For all other number styles, the value isn't changed.
      formattedValues[id] = value;
    }
  }

  // Throw an error if a value is provided but has no placeholder in the message.
  for (const valueId of Object.keys(values)) {
    if (valueId in formattedValues) continue;

    // errorCode is a special case always allowed to help LHError ease-of-use.
    if (valueId === 'errorCode') {
      formattedValues.errorCode = values.errorCode;
      continue;
    }

    throw new Error(`Provided value "${valueId}" does not match any placeholder in ` +
      `ICU message "${icuMessage}"`);
  }

  return formattedValues;
}

/**
 * @typedef IcuMessageInstance
 * @prop {string} icuMessageId
 * @prop {string} icuMessage
 * @prop {Record<string, string | number>|undefined} [values]
 */

/** @type {Map<string, IcuMessageInstance[]>} */
const _icuMessageInstanceMap = new Map();

const _ICUMsgNotFoundMsg = 'ICU message not found in destination locale';
/**
 *
 * @param {LH.Locale} locale
 * @param {string} icuMessageId
 * @param {string=} uiStringMessage The original string given in 'UIStrings', used as a backup if no locale message can be found
 * @return {{localeMessage: string, formatter: MessageFormat}}
 */
function _getLocaleMessageAndCreateFormatter(locale, icuMessageId, uiStringMessage) {
  const localeMessages = LOCALES[locale];
  if (!localeMessages) throw new Error(`Unsupported locale '${locale}'`);
  let localeMessage = localeMessages[icuMessageId] && localeMessages[icuMessageId].message;

  // fallback to the original english message if we couldn't find a message in the specified locale
  // better to have an english message than no message at all, in some number cases it won't even matter
  if (!localeMessage && uiStringMessage) {
    // Try to use the original uiStringMessage
    localeMessage = uiStringMessage;

    // Warn the user that the UIString message != the `en-US` message ∴ they should update the strings
    if (!LOCALES['en-US'][icuMessageId]) {
      console.log('i18n', `Message "${icuMessageId}" does not exist in en-US.json.
          Check that the i18n.registerUIStrings() call has the correct path,
          and run 'npm run collect-strings'`);
    } else if (localeMessage !== LOCALES['en-US'][icuMessageId].message) {
      console.log('i18n', `Message "${icuMessageId}" does not match its 'en-US' counterpart. ` +
        `Run 'npm run collect-strings' to update.`);
    }
  }
  // At this point, there is no reasonable string to show to the user, so throw.
  if (!localeMessage) {
    throw new Error(_ICUMsgNotFoundMsg);
  }

  // when using accented english, force the use of a different locale for number formatting
  const localeForMessageFormat = (locale === 'en-XA' || locale === 'en-XL') ? 'de-DE' : locale;

  const formatter = new MessageFormat(localeMessage, localeForMessageFormat, formats);

  return {localeMessage, formatter};
}
/**
 *
 * @param {string} icuMessageId
 * @param {string} localeMessage
 * @param {MessageFormat} formatter
 * @param {Record<string, string | number>} [values]
 * @return {{formattedString: string, icuMessage: string}}
 */
function _formatMessage(icuMessageId, localeMessage, formatter, values = {}) {
  // preformat values for the message format like KB and milliseconds
  const valuesForMessageFormat = _preformatValues(icuMessageId, localeMessage, formatter, values);

  const formattedString = formatter.format(valuesForMessageFormat);
  return {formattedString, icuMessage: localeMessage};
}

/** @param {string[]} pathInLHR */
function _formatPathAsString(pathInLHR) {
  let pathAsString = '';
  for (const property of pathInLHR) {
    if (/^[a-z]+$/i.test(property)) {
      if (pathAsString.length) pathAsString += '.';
      pathAsString += property;
    } else {
      if (/]|"|'|\s/.test(property)) throw new Error(`Cannot handle "${property}" in i18n`);
      pathAsString += `[${property}]`;
    }
  }

  return pathAsString;
}

/**
 * @param {LH.Locale} locale
 * @return {LH.I18NRendererStrings}
 */
function getRendererFormattedStrings(locale) {
  const localeMessages = LOCALES[locale];
  if (!localeMessages) throw new Error(`Unsupported locale '${locale}'`);

  const icuMessageIds = Object.keys(localeMessages).filter(f => f.includes('ModuleUIStrings'));
  const strings = /** @type {LH.I18NRendererStrings} */ ({});
  for (const icuMessageId of icuMessageIds) {
    const [filename, varName] = icuMessageId.split(' | ');
    const key = /** @type {keyof LH.I18NRendererStrings} */ (varName);
    strings[key] = localeMessages[icuMessageId].message;
  }

  return strings;
}

/**
 * Register a file's UIStrings with i18n, return function to
 * generate the string ids.
 *
 * @param {string} filename
 * @param {Record<string, string>} fileStrings
 */
function createMessageInstanceIdFn(filename, fileStrings) {
  /**
   * Convert a message string & replacement values into an
   * indexed id value in the form '{messageid} | # {index}'.
   *
   * @param {string} icuMessage
   * @param {Record<string, string | number>} [values]
   * */
  const getMessageInstanceIdFn = (icuMessage, values) => {
    const keyname = Object.keys(fileStrings).find(key => fileStrings[key] === icuMessage);
    if (!keyname) throw new idNotInMainDictionaryException(icuMessage);

    const unixStyleFilename = filename.replace(/\\/g, '/');
    const icuMessageId = `${unixStyleFilename} | ${keyname}`;
    const icuMessageInstances = _icuMessageInstanceMap.get(icuMessageId) || [];

    let indexOfInstance = icuMessageInstances.findIndex(inst => _package(inst.values, values));
    if (indexOfInstance === -1) {
      icuMessageInstances.push({icuMessageId, icuMessage, values});
      indexOfInstance = icuMessageInstances.length - 1;
    }

    _icuMessageInstanceMap.set(icuMessageId, icuMessageInstances);

    return `${icuMessageId} # ${indexOfInstance}`;
  };

  return getMessageInstanceIdFn;
}

/**
 * Returns true if string is an ICUMessage reference.
 * @param {string} icuMessageIdOrRawString
 * @return {boolean}
 */
function isIcuMessage(icuMessageIdOrRawString) {
  return MESSAGE_INSTANCE_ID_QUICK_REGEX.test(icuMessageIdOrRawString) &&
      MESSAGE_INSTANCE_ID_REGEX.test(icuMessageIdOrRawString);
}

/**
 * @param {string} icuMessageIdOrRawString
 * @param {LH.Locale} locale
 * @return {string}
 */
function getFormatted(icuMessageIdOrRawString, locale) {
  if (isIcuMessage(icuMessageIdOrRawString)) {
    const {icuMessageId, icuMessageInstance} = _resolveIcuMessageInstanceId(icuMessageIdOrRawString);
    const {localeMessage, formatter} = _getLocaleMessageAndCreateFormatter(locale, icuMessageId, icuMessageInstance.icuMessage);
    const {formattedString} = _formatMessage(icuMessageId, localeMessage, formatter, icuMessageInstance.values);
    return formattedString;
  }

  return icuMessageIdOrRawString;
}

/**
 * @param {string} icuMessageIdOrRawString
 * @param {LH.Locale} locale
 * @return {MessageFormat | string}
 */
function getFormatter(icuMessageIdOrRawString, locale) {
  if (isIcuMessage(icuMessageIdOrRawString)) {
    const {icuMessageId, icuMessageInstance} = _resolveIcuMessageInstanceId(icuMessageIdOrRawString);
    const {formatter} = _getLocaleMessageAndCreateFormatter(locale, icuMessageId, icuMessageInstance.icuMessage);

    return formatter;
  }

  return icuMessageIdOrRawString;
}

/**
 * @param {LH.Locale} locale
 * @param {string} icuMessageId
 * @param {Record<string, string | number>} [values]
 * @return {string}
 */
function getFormattedFromIdAndValues(locale, icuMessageId, values) {
  const icuMessageIdRegex = /(.* \| .*)$/;
  if (!icuMessageIdRegex.test(icuMessageId)) throw new Error('This is not an ICU message ID');

  const {localeMessage, formatter} = _getLocaleMessageAndCreateFormatter(locale, icuMessageId, undefined);
  const {formattedString} = _formatMessage(icuMessageId, localeMessage, formatter, values);

  return formattedString;
}

/**
 * @param {string} icuMessageInstanceId
 * @return {{icuMessageId: string, icuMessageInstance: IcuMessageInstance}}
 */
function _resolveIcuMessageInstanceId(icuMessageInstanceId) {
  const matches = icuMessageInstanceId.match(MESSAGE_INSTANCE_ID_REGEX);
  if (!matches) throw new Error(`${icuMessageInstanceId} is not a valid message instance ID`);

  const [_, icuMessageId, icuMessageInstanceIndex] = matches;
  const icuMessageInstances = _icuMessageInstanceMap.get(icuMessageId) || [];
  const icuMessageInstance = icuMessageInstances[Number(icuMessageInstanceIndex)];

  return {icuMessageId, icuMessageInstance};
}

/**
 * Recursively walk the input object, looking for property values that are
 * string references and replace them with their localized values. Primarily
 * used with the full LHR as input.
 * @param {*} inputObject
 * @param {LH.Locale} locale
 * @return {LH.I18NMessages}
 */
function replaceIcuMessageInstanceIds(inputObject, locale) {
  /**
   * @param {*} subObject
   * @param {LH.I18NMessages} icuMessagePaths
   * @param {string[]} pathInLHR
   */
  function replaceInObject(subObject, icuMessagePaths, pathInLHR = []) {
    if (typeof subObject !== 'object' || !subObject) return;

    for (const [property, value] of Object.entries(subObject)) {
      const currentPathInLHR = pathInLHR.concat([property]);

      // Check to see if the value in the LHR looks like a string reference. If it is, replace it.
      if (typeof value === 'string' && isIcuMessage(value)) {
        const {icuMessageId, icuMessageInstance} = _resolveIcuMessageInstanceId(value);
        const {localeMessage, formatter} = _getLocaleMessageAndCreateFormatter(locale, icuMessageId, icuMessageInstance.icuMessage);
        const {formattedString} = _formatMessage(icuMessageId, localeMessage, formatter, icuMessageInstance.values);

        const messageInstancesInLHR = icuMessagePaths[icuMessageInstance.icuMessageId] || [];
        const currentPathAsString = _formatPathAsString(currentPathInLHR);

        messageInstancesInLHR.push(
          icuMessageInstance.values ?
            {values: icuMessageInstance.values, path: currentPathAsString} :
            currentPathAsString
        );

        subObject[property] = formattedString;
        icuMessagePaths[icuMessageInstance.icuMessageId] = messageInstancesInLHR;
      } else {
        replaceInObject(value, icuMessagePaths, currentPathInLHR);
      }
    }
  }

  /** @type {LH.I18NMessages} */
  const icuMessagePaths = {};
  replaceInObject(inputObject, icuMessagePaths);
  return icuMessagePaths;
}

/** @typedef {import('./locales').LhlMessages} LhlMessages */

/**
 * Populate the i18n string lookup dict with locale data
 * Used when the host environment selects the locale and serves lighthouse the intended locale file
 * @see https://docs.google.com/document/d/1jnt3BqKB-4q3AE94UWFA0Gqspx8Sd_jivlB7gQMlmfk/edit
 * @param {LH.Locale} locale
 * @param {LhlMessages} lhlMessages
 */
function registerLocaleData(locale, lhlMessages) {
  LOCALES[locale] = lhlMessages;
}

/**
 * Get the closest locale from the ones available For example,
 * if es is supported and es-419 is not, then we return es when es-419 is requested
 * @param {LH.Locale} locale
 * @param {any} available
 */
function lookupClosestLocale(locale, available) {
  const localeParts = locale.split('-');
  while (localeParts.length) {
    let candidate = localeParts.join('-');
    if (available[candidate] || (available.default && available.default[candidate])) {
      return candidate;
    }
    localeParts.pop();
  }
}
/**
 * Throws an error with the given icuMessage id.
 * @param {string} icuMessage
 */
function idNotInMainDictionaryException(icuMessage) {
  this.message = `Could not locate: ${icuMessage}`;
}
idNotInMainDictionaryException.prototype = new Error;

var i18n = {
  _formatPathAsString,
  _ICUMsgNotFoundMsg,
  lookupLocale,
  getRendererFormattedStrings,
  createMessageInstanceIdFn,
  getFormatted,
  getFormatter,
  getFormattedFromIdAndValues,
  replaceIcuMessageInstanceIds,
  isIcuMessage,
  collectAllCustomElementsFromICU,
  registerLocaleData,
  idNotInMainDictionaryException,
};

export default i18n;
