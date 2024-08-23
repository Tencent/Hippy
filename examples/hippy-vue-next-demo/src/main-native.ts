import {
  createApp,
  type HippyApp,
  EventBus,
  setScreenSize,
  BackAndroid,
  Native,
  registerElement,
  EventsUnionType,
} from '@hippy/vue-next';

import App from './app.vue';
import { createRouter } from './routes';
import { setGlobalInitProps } from './util';

global.Hippy.on('uncaughtException', (err) => {
  console.log('uncaughtException error', err.stack, err.message);
});

// only supported in iOS temporarily
global.Hippy.on('unhandledRejection', (reason) => {
  console.log('unhandledRejection reason', reason);
});

// create hippy app instance
const app: HippyApp = createApp(App, {
  // hippy native module name
  appName: 'Demo',
  iPhone: {
    // config of statusBar
    statusBar: {
      // disable status bar autofill
      // disabled: true,

      // Status bar background color, if not set, it will use 4282431619, as #40b883, Vue default green
      // hippy-vue-css-loader/src/compiler/style/color-parser.js
      backgroundColor: 4283416717,

      // 状态栏背景图，要注意这个会根据容器尺寸拉伸。
      // backgroundImage: 'https://user-images.githubusercontent.com/12878546/148737148-d0b227cb-69c8-4b21-bf92-739fb0c3f3aa.png',
    },
  },
  // do not print trace info when set to true
  // silent: true,
  /**
   * whether to trim whitespace on text element,
   * default is true, if set false, it will follow vue-loader compilerOptions whitespace setting
   */
  trimWhitespace: true,
  styleOptions: {
    beforeLoadStyle: (decl) => {
      let { value } = decl;
      // 比如可以对 rem 单位进行处理
      if (typeof value === 'string' && /rem$/.test(value)) {
        // get the numeric value of rem

        const { screen } = Native.Dimensions;
        // 比如可以对 rem 单位进行处理
        if (typeof value === 'string' && /rem$/.test(value)) {
          const { width, height } = screen;
          // 防止hippy 旋转后，宽度发生变化
          const realWidth = width > height ? width : height;
          value = Number(parseFloat(`${(realWidth * 100 * Number(value.replace('rem', ''))) / 844}`).toFixed(2));
        }
      }
      return { ...decl, value };
    },
  },
});
// create router
const router = createRouter();
app.use(router);

// Monitor screen size and update size data
EventBus.$on('onSizeChanged', (newScreenSize) => {
  if (newScreenSize.width && newScreenSize.height) {
    setScreenSize({
      width: newScreenSize.width,
      height: newScreenSize.height,
    });
  }
});

// init callback
const initCallback = ({ superProps, rootViewId }) => {
  setGlobalInitProps({
    superProps,
    rootViewId,
  });
  /**
   * Because the memory history of vue-router is now used,
   * the initial position needs to be pushed manually, otherwise the router will not be ready.
   * On the browser, it is matched by vue-router according to location.href, and the default push root path '/'
   */
  router.push('/');

  // listen android native back press, must before router back press inject
  BackAndroid.addListener(() => {
    console.log('backAndroid');
    // set true interrupts native back
    return true;
  });

  // mount first， you can do something before mount
  app.mount('#root');

  /**
   * You can also mount the app after the route is ready, However,
   * it is recommended to mount first, because it can render content on the screen as soon as possible
   */
  // router.isReady().then(() => {
  //   // mount app
  //   app.mount('#root');
  // });
};

// start hippy app
app.$start().then(initCallback);

// you can also use callback to start app like @hippy/vue before
// app.$start(initCallback);
