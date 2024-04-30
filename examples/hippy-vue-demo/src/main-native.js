import Vue from 'vue';
import VueRouter from 'vue-router';
import HippyVueNativeComponents from '@hippy/vue-native-components';
import App from './app.vue';
import routes from './routes';
import { setApp } from './util';

// 是否输出终端调试信息
// Vue.config.silent = true;

Vue.config.productionTip = false;
// 是否开启scoped支持
Vue.config.scoped = true;
/**
 * whether to trim whitespace on text element,
 * default is true, if set false, it will follow vue-loader compilerOptions whitespace setting
 */
Vue.config.trimWhitespace = true;

// Hippy 终端组件扩展中间件，可以使用 modal、view-pager、tab-host、ul-refresh 等原生组件。
Vue.use(HippyVueNativeComponents);
Vue.use(VueRouter);

const router = new VueRouter(routes);

global.Hippy.on('uncaughtException', (err) => {
  console.error('uncaughtException error', err.stack, err.message);
});

// only supported in iOS temporarily
global.Hippy.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection reason', reason);
});

/**
 * 声明一个 app
 */
const app = new Vue({
  // 终端指定的 App 名称
  appName: 'Demo',
  // 根节点，必须是 Id，当根节点挂载时才会触发上屏
  rootView: '#root',
  // 渲染自己
  render: h => h(App),
  // iPhone 下的状态栏配置
  iPhone: {
    // 状态栏配置
    statusBar: {
      // 禁用状态栏自动填充
      // disabled: true,

      // 状态栏背景色，如果不配的话，会用 4282431619，也就是 #40b883 - Vue 的绿色
      // 因为运行时只支持样式和属性的实际转换，所以需要用下面的转换器将颜色值提前转换，可以在 Node 中直接运行。
      // hippy-vue-css-loader/src/compiler/style/color-parser.js
      backgroundColor: 4283416717,

      // 状态栏背景图，要注意这个会根据容器尺寸拉伸。
      // backgroundImage: 'https://user-images.githubusercontent.com/12878546/148737148-d0b227cb-69c8-4b21-bf92-739fb0c3f3aa.png',
    },
  },
  // 路由
  router,
});

/**
 * $start 是 Hippy 启动完以后触发的回调
 * @param {Function} callback - 引擎加载成功后回调函数
 *  @param {Object} instance - 业务vue实例对象
 *  @param {Object} initialProps - 终端给前端的初始化参数
 */
app.$start((instance, initialProps) => {
  console.log('instance', instance, 'initialProps', initialProps);
  // 这里干一点 Hippy 启动后的需要干的事情，比如通知终端前端已经准备完毕，可以开始发消息了。
  // setApp(app);
  // listen Android back press
  Vue.Native.BackAndroid.addListener(() => {
    console.log('backAndroid');
    // set true interrupts native back
    return true;
  });
});
/**
 * 保存 app 供后面通过 app 接受来自终端的事件。
 *
 * 之前是放到 $start 里的，但是有个问题时因为 $start 执行太慢，如果首页就 getApp() 的话可能会
 * 导致获得了 undefined，然后监听失败。所以挪出来了。
 *
 * 但是终端事件依然要等到 $start 也就是 Hippy 启动之后再发，因为之前桥尚未建立，终端发消息前端也
 * 接受不到。
 */
setApp(app);
