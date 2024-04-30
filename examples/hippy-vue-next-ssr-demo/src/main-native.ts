import {
  // createApp,
  createSSRApp,
  type HippyApp,
  EventBus,
  setScreenSize,
  BackAndroid,
  // Native,
  // registerElement,
  // EventsUnionType,
} from '@hippy/vue-next';

import { createPinia } from 'pinia';
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
// pay attention: createSSRApp can both used for client side render & server side render, createApp
// only support client side render, but if you only used in CSR, just use createApp.
const app: HippyApp = createSSRApp(App, {
  // hippy native module name
  appName: 'Demo',
  iPhone: {
    // config of statusBar
    statusBar: {
      // disable status bar autofill
      disabled: true,

      // Status bar background color, if not set, it will use 4282431619, as #40b883, Vue default green
      // hippy-vue-css-loader/src/compiler/style/color-parser.js
      // backgroundColor: 4283416717,

      // status background image, image will auto-scale by screen size
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
  // ssr rendered node list, use for hydration
  ssrNodeList: global.hippySSRNodes,
});
// create router
const router = createRouter();
app.use(router);

// create store
const store = createPinia();
app.use(store);
// if server side return store，then use server store replace
if (global.__INITIAL_STATE__) {
  store.state.value = global.__INITIAL_STATE__;
}


// Monitor screen size and update size data
EventBus.$on('onSizeChanged', (newScreenSize: {
  width: number;
  height: number;
}) => {
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

  /**
   * You can also mount the app after the route is ready, However,
   * it is recommended to mount first, because it can render content on the screen as soon as possible
   */
  router.isReady().then(() => {
    // mount app
    app.mount('#root');
  });

  // invoke custom native apis with type hints
  // Native.callNative('customModule', 'customMethod', '123', 456);
  // Native.callNativeWithPromise(
  //   'customModule',
  //   'customMethodWithPromise',
  //   '123',
  //   456,
  // ).then((result) => {
  //   console.log(result);
  // });

  // register custom component with type inference
  // registerElement('customComponent', {
  //   component: {
  //     name: 'custom-component',
  //     processEventData(
  //       evtData: EventsUnionType,
  //       nativeEventParams: { [key: string]: NeedToTyped },
  //     ) {
  //       const { handler: event, __evt: nativeEventName } = evtData;
  //
  //       switch (nativeEventName) {
  //         // this can infer event is HippyTouchEvent from type narrowing
  //         case 'onTest':
  //           event.contentOffset = nativeEventParams.position;
  //           break;
  //         // extended HippyEvent which has testProp
  //         case 'onAnotherTest':
  //           event.testProp = 123;
  //           break;
  //         default:
  //       }
  //       return event;
  //     },
  //   },
  // });
};

// start hippy app
app.$start().then(initCallback);

// you can also use callback to start app like @hippy/vue before
// app.$start(initCallback);
