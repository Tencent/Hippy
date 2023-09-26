/**
 * ssr entry
 */
import { type CallbackType } from '@hippy/vue-next';

/**
 * register hippy instance and execute entry function
 *
 * @param bundleName - bundle name
 * @param entryCallback - entry function
 */
export function ssrEntry(bundleName: string, entryCallback?: CallbackType): void {
  let params = null;
  // save raw register function
  const { regist } = global.Hippy.register;
  global.Hippy.register.regist = (bundleName, callback) => {
    // hijack raw register, avoid multiple execution
    if (callback) {
      callback(params);
    }
  };
  // register hippy instance
  regist.call(global.Hippy.register, bundleName, (superProps) => {
    params = superProps;
    // execute entry function
    if (entryCallback) {
      entryCallback();
    }
  });
}
