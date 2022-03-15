import { isFunc } from '../utils/validation';
import { error } from '../utils';

let module = {};
const callNative = (moduleName: string, fName: string, param: string) => {
  if (module[moduleName]) {
    if (isFunc(module[moduleName][fName])) {
      module[moduleName][fName](param);
    } else {
      error(`${moduleName}.${fName} is not a function`);
    }
  } else {
    error(`can not find module ${moduleName}`);
  }
};
callNative.init = (moduleMap: any) => {
  module = moduleMap;
};

export default callNative;
