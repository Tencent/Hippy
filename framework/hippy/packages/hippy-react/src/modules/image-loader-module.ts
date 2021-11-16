import { Bridge } from '../global';

/**
 * Get the image size before rendering.
 *
 * @param {string} url - Get image url.
 */
function getSize(url: string) {
  return Bridge.callNativeWithPromise('ImageLoaderModule', 'getSize', url);
}

/**
 * Prefetch image, to make rendering in next more faster.
 *
 * @param {string} url - Prefetch image url.
 */
function prefetch(url: string) {
  Bridge.callNative('ImageLoaderModule', 'prefetch', url);
}


export {
  getSize,
  prefetch,
};
