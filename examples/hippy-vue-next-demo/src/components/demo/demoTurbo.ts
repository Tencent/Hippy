const getString = (strVal: NeedToTyped): string => global.getTurboModule('demoTurbo').getString(strVal);

const getNum = (numVal: NeedToTyped): number => global.getTurboModule('demoTurbo').getNum(numVal);

const getBoolean = (boolVal: NeedToTyped): boolean => global.getTurboModule('demoTurbo').getBoolean(boolVal);

const getMap = (mapVal: NeedToTyped): Map<string, string> => global.getTurboModule('demoTurbo').getMap(mapVal);

const getObject = (jsonVal: NeedToTyped): NeedToTyped => global.getTurboModule('demoTurbo').getObject(jsonVal);

const getArray = (arrayVal: NeedToTyped): NeedToTyped => global.getTurboModule('demoTurbo').getArray(arrayVal);

const nativeWithPromise = async (value: NeedToTyped): Promise<NeedToTyped> => global.turboPromise(global.getTurboModule('demoTurbo').nativeWithPromise)(value);

const getTurboConfig = (): NeedToTyped => global.getTurboModule('demoTurbo').getTurboConfig();

const printTurboConfig = (config: NeedToTyped): NeedToTyped => global.getTurboModule('demoTurbo').printTurboConfig(config);

export {
  getArray,
  getBoolean,
  getNum,
  getMap,
  getObject,
  getString,
  getTurboConfig,
  nativeWithPromise,
  printTurboConfig,
};
