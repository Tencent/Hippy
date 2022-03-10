interface AsyncStorage {
  getItem: (key: string) => Promise<string>;
  setItem: (key: string, value: number | string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

const asyncStorage: AsyncStorage = {
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
};

export default asyncStorage;
