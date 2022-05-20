const convertError = (error) => {
  if (!error) {
    return null;
  }

  const out = new Error(error.message);
  out.key = error.key;

  return out;
};

const convertErrors = (errs) => {
  if (!errs) {
    return null;
  }

  let targetError;

  if (Array.isArray(errs)) {
    targetError = errs;
  } else {
    targetError = [errs];
  }

  if (targetError) {
    targetError.map(e => convertError(e));
  }

  return targetError;
};

Hippy.asyncStorage = {
  getAllKeys() {
    return Hippy.bridge.callNativeWithPromise('StorageModule', 'getAllKeys');
  },
  setItem(key, valueArg) {
    let value = valueArg;
    if (typeof value !== 'string') {
      try {
        value = value.toString();
      } catch (err) {
        throw err;
      }
    }
    return Hippy.bridge.callNativeWithPromise('StorageModule', 'multiSet', [[key, value]]);
  },
  getItem(key) {
    return Hippy.bridge.callNativeWithPromise('StorageModule', 'multiGet', [key])
      .then((r) => {
        if (!r || !r[0] || !r[0][1]) {
          return null;
        }
        return r[0][1];
      })
      .catch(err => convertErrors(err));
  },
  removeItem(key) {
    return Hippy.bridge.callNativeWithPromise('StorageModule', 'multiRemove', [key]);
  },
  multiGet(keys) {
    return Hippy.bridge.callNativeWithPromise('StorageModule', 'multiGet', keys);
  },
  multiSet(keyValuePairs) {
    return Hippy.bridge.callNativeWithPromise('StorageModule', 'multiSet', keyValuePairs);
  },
  multiRemove(keys) {
    return Hippy.bridge.callNativeWithPromise('StorageModule', 'multiRemove', keys);
  },
};
