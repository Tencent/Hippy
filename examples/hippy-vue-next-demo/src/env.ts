/**
 * is running in server side
 */
export const IS_SSR = !!global.process?.env?.HIPPY_SSR;

/**
 * is ssr mode in client
 */
export const IS_SSR_MODE = !!global.hippySSRNodes;

// current platform is iOS or not
export const IS_IOS = global.Hippy?.device?.platform.OS === 'ios';
