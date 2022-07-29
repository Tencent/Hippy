/**
 * 全局的样式存储标识名称
 *
 * @public
 */
export const HIPPY_GLOBAL_STYLE_NAME = '__HIPPY_VUE_STYLES__';

/**
 * 全局待移除样式存储标识名称
 * 当使用热更新时，过期的样式将会被添加到全局的dispose style中，即global[GLOBAL_DISPOSE_STYLE_NAME]
 *
 * @public
 */
export const HIPPY_GLOBAL_DISPOSE_STYLE_NAME = '__HIPPY_VUE_DISPOSE_STYLES__';

/**
 * Hippy静态文件协议地址
 *
 * @public
 */
export const HIPPY_STATIC_PROTOCOL = 'hpfile://';
