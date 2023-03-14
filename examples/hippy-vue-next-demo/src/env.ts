/**
 * is running in server side
 */
export const IS_SSR = !!global.process?.env?.HIPPY_SSR;
