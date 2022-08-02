import {
  createHippyApp,
  type HippyApp,
  EventBus,
  setScreenSize,
} from '@hippy/vue-next';

import App from './app.vue';
// 手Q 大同上报指令，不需要的可以忽略
import { vReport } from './directives/v-report';
import { createHippyRouter } from './router';
import { warn } from './util';

// 创建 hippy app 实例
const app: HippyApp = createHippyApp(App, {
  // hippy native module名
  appName: 'QQNearbyGameGroup',
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
      // backgroundImage: 'https://mat1.gtimg.com/www/qq2018/imgs/qq_logo_2018x2.png',
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

// 注册大同上报指令，非手Q 可注释
app.directive('report', vReport);

// 启动 hippy，需要等hippy native 注册成功之后才能去调用vue的mount
app.$start().then(({ superProps }) => {
  // 初始化参数
  warn(superProps);
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
});
