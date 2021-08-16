/* eslint-disable import/prefer-default-export */

/**
 * hippy-vue-css-loader will translate the CSS texts to be AST
 * and attached at global[GLOBAL_STYLE_NAME]
 */
const GLOBAL_STYLE_NAME = '__HIPPY_VUE_STYLES__';

/**
 * Hippy debug address
 */
const HIPPY_DEBUG_ADDRESS = `http://127.0.0.1:${process.env.PORT}/`;

/**
 * Hippy static resources protocol
 */
const HIPPY_STATIC_PROTOCOL = 'hpfile://';

export {
  GLOBAL_STYLE_NAME,
  HIPPY_DEBUG_ADDRESS,
  HIPPY_STATIC_PROTOCOL,
};
