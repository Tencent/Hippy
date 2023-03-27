/**
 * is running in server side
 */
export const IS_SSR = !!global.process?.env?.HIPPY_SSR;

/**
 * is ssr mode in client
 */
export const IS_SSR_MODE = !!global.hippySSRNodes;
