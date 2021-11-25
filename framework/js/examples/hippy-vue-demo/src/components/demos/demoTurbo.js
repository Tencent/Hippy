/* eslint-disable no-underscore-dangle, no-undef */

export const getString = strVal => getTurboModule('demoTurbo')
  .getString(strVal);

export const getNum = numVal => getTurboModule('demoTurbo')
  .getNum(numVal);

export const getBoolean = boolVal => getTurboModule('demoTurbo')
  .getBoolean(boolVal);

export const getMap = mapVal => getTurboModule('demoTurbo')
  .getMap(mapVal);

export const getObject = jsonVal => getTurboModule('demoTurbo')
  .getObject(jsonVal);

export const getArray = arrayVal => getTurboModule('demoTurbo')
  .getArray(arrayVal);

export const nativeWithPromise = async value => turboPromise(getTurboModule('demoTurbo').nativeWithPromise)(value);

export const getTurboConfig = () => getTurboModule('demoTurbo')
  .getTurboConfig();

export const printTurboConfig = config => getTurboModule('demoTurbo')
  .printTurboConfig(config);
