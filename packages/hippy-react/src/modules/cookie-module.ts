import { Bridge } from '../global';

/**
 * Get cookies from url
 *
 * @param {string} url - Specific url for cookie
 */
function getCookies(url: string): Promise<string> {
  return Bridge.callNativeWithPromise('network', 'getCookie', url);
}

/**
 * Set cookie to url
 *
 * @param {string} url - Specific url for cookie.
 * @param {string} keyValue - Cookie key and value string, split with `:`.
 * @param {Date|string} [expires] - UTC Date string or Date object for cookie expire.
 */
function setCookie(url: string, keyValue: string, expires: string | Date): void {
  let expireStr = '';
  if (typeof expires === 'string') {
    expireStr = expires;
  }
  if (expires instanceof Date) {
    expireStr = expires.toUTCString();
  }
  Bridge.callNative('network', 'setCookie', url, keyValue, expireStr);
}

export {
  getCookies,
  setCookie,
};
