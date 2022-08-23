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

// create hippy app instance
const app: HippyApp = createApp(App, {
  // hippy native module name
  appName: 'Demo',
  iPhone: {
    // config of statusBar
    statusBar: {
      // disable status bar autofill
      // disabled: true,

      // Status bar background color, if not set, it will use 4282431619
      // hippy-vue-css-loader/src/compiler/style/color-parser.js
      // backgroundColor: 4294309626,
      backgroundColor: 4282431619,

      // 状态栏背景图，要注意这个会根据容器尺寸拉伸。
      // backgroundImage: 'https://user-images.githubusercontent.com/12878546/148737148-d0b227cb-69c8-4b21-bf92-739fb0c3f3aa.png',
    },
  },
});

// create router
const router = createHippyRouter();
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
  warn(superProps);
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

  // listen android native back press
  BackAndroid.addListener(() => {
    warn('backAndroid');
    // set true interrupts native back
    // return true;
  });
};

// start hippy app
app.$start().then(initCallback);

// you can also use callback to start app like @hippy/vue before
// app.$start(initCallback);
