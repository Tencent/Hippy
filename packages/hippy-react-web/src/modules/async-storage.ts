type KeyValuePair = { key: string, value: string | null };

interface AsyncStorage {
  getAllKeys: () => Promise<string[]>;
  getItem: (key: string) => Promise<string>;
  setItem: (key: string, value: number | string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  multiGet: (keyList: string[]) => Promise<KeyValuePair[]>;
  multiRemove: (keyList: string[]) => Promise<void>;
  multiSet: (keyValuePairList: KeyValuePair[]) => Promise<void>;
}

const asyncStorage: AsyncStorage = {
  getAllKeys() {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        keys.push(key);
      }
    };
    return Promise.resolve(keys);
  },
  getItem(key: string) {
    const value = localStorage.getItem(key);
    if (value) {
      return Promise.resolve(value);
    }
    return Promise.resolve('');
  },
  setItem(key: string, value: number | string) {
    localStorage.setItem(key, `${value}`);
    return new Promise(resolve => resolve());
  },
  removeItem(key: string) {
    localStorage.removeItem(key);
    return new Promise(resolve => resolve());
  },
  multiGet(keyList: string[]) {
    const valueList: { key: string, value: string | null }[] = [];
    keyList.forEach((key) => {
      const value = localStorage.getItem(key);
      valueList.push({ key, value });
    });
    return Promise.resolve(valueList);
  },
  multiRemove(keyList: string[]) {
    keyList.forEach((key) => {
      localStorage.removeItem(key);
    });
    return new Promise(resolve => resolve());
  },
  multiSet(KeyValuePair: KeyValuePair[]) {
    KeyValuePair.forEach(({ key, value }) => {
      if (value) {
        localStorage.setItem(key, value);
      }
    });
    return new Promise(resolve => resolve());
  },
};

export default asyncStorage;
