/**
 * is running in server side
 */
export const IS_SSR = process.env.HIPPY_SSR;

/**
 * is ssr mode in client
 */
export const IS_SSR_MODE = !!global.hippySSRNodes;

/**
 * current platform is iOS or not
 */
export const IS_IOS = global.Hippy?.device?.platform.OS === 'ios';

/**
 * determine current environment is development or not
 */
export const isDev = process.env.NODE_ENV === 'development';
