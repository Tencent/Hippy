/**
 * 存放项目配置常量等
 */

// 默认调试端口
const DEBUG_PORT = 38989;

/**
 * Hippy debug的地址
 *
 * @public
 */
const HIPPY_DEBUG_ADDRESS = `http://127.0.0.1:${
  typeof process !== 'undefined' ? process.env.PORT : DEBUG_PORT
}/`;

/**
 * 当前环境是否是生产环境
 *
 * @public
 */
const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * native最基础版本所支持的组件Map
 *
 * @public
 */
const NATIVE_COMPONENT_MAP = {
  View: 'View',
  Image: 'Image',
  ListView: 'ListView',
  ListViewItem: 'ListViewItem',
  Text: 'Text',
  TextInput: 'TextInput',
  WebView: 'WebView',
  VideoPlayer: 'VideoPlayer',
  // Native内置组件，与View组件属性方法基本一致，仅名称不同
  ScrollView: 'ScrollView',
};

/**
 * Hippy静态文件协议地址
 *
 * @public
 */
const HIPPY_STATIC_PROTOCOL = 'hpfile://';
const HIPPY_GLOBAL_STYLE_NAME = '__HIPPY_VUE_STYLES__';
const HIPPY_GLOBAL_DISPOSE_STYLE_NAME = '__HIPPY_VUE_DISPOSE_STYLES__';

export {
  HIPPY_DEBUG_ADDRESS,
  HIPPY_STATIC_PROTOCOL,
  NATIVE_COMPONENT_MAP,
  IS_PROD,
  HIPPY_GLOBAL_STYLE_NAME,
  HIPPY_GLOBAL_DISPOSE_STYLE_NAME,
};
