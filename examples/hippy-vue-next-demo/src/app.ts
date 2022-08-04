import {
  createApp,
  type HippyApp,
  EventBus,
  setScreenSize,
  BackAndroid,
} from '@hippy/vue-next';

import App from './app.vue';
import { createHippyRouter } from './router';
import { warn, setGlobalInitProps } from './util';

global.Hippy.on('uncaughtException', (err) => {
  warn('uncaughtException error', err.stack, err.message);
});

// only supported in iOS temporarily
global.Hippy.on('unhandledRejection', (reason) => {
  warn('unhandledRejection reason', reason);
});

// 创建 hippy app 实例
const app: HippyApp = createApp(App, {
  // hippy native module名
  appName: 'Demo',
  iPhone: {
    // 状态栏配置
    statusBar: {
      // 禁用状态栏自动填充
      // disabled: true,

      // 状态栏背景色，如果不配的话，会用 4282431619，也就是 #40b883 - Vue 的绿色
      // 因为运行时只支持样式和属性的实际转换，所以需要用下面的转换器将颜色值提前转换，可以在 Node 中直接运行。
      // hippy-vue-css-loader/src/compiler/style/color-parser.js
      // backgroundColor: 4294309626,
      backgroundColor: 4282431619,

      // 状态栏背景图，要注意这个会根据容器尺寸拉伸。
      // backgroundImage: 'https://user-images.githubusercontent.com/12878546/148737148-d0b227cb-69c8-4b21-bf92-739fb0c3f3aa.png',
    },
  },
});

// 创建路由对象
const router = createHippyRouter();
// 使用路由中间件
app.use(router);

// 监听屏幕尺寸变化事件，更新屏幕尺寸全局对象数据，使用方还是使用 Native 的属性
EventBus.$on('onSizeChanged', (newScreenSize) => {
  if (newScreenSize.width && newScreenSize.height) {
    // 拿到屏幕尺寸数据之后，更新屏幕尺寸
    setScreenSize({
      width: newScreenSize.width,
      height: newScreenSize.height,
    });
  }
});

// 启动 hippy，需要等hippy native 注册成功之后才能去调用vue的mount
app.$start().then(({ superProps, rootViewId }) => {
  // 初始化参数
  warn(superProps);
  setGlobalInitProps({
    superProps,
    rootViewId,
  });
  // 因为现在使用的是vue-router的memory history，因此需要手动推送初始位置，否则router将无法ready
  // 浏览器上则是由vue-router根据location.href去匹配，默认推送根路径'/'
  router.push('/');
  // 先 mount app
  app.mount('#root');

  // 这里也可以先进行mount，因为可以把路由无关的组件先 mount
  // 也可以在路由ready之后mount app。不过建议先 mount，因为能够尽快上屏，有些 native 的上报和 loading 等逻辑是跟
  // 上屏时机有关，尽早上屏，尽早展示
  // router.isReady().then(() => {
  //   // mount app
  //   app.mount('#root');
  // });

  // listen android native back press
  BackAndroid.addListener(() => {
    warn('backAndroid');
    // set true interrupts native back
    // return true;
  });
});
