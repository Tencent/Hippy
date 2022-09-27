import { createRouter, type Router } from 'vue-router';
import { Native, BackAndroid } from '@hippy/vue-next';
import { createHippyHistory, type HippyRouterHistory } from './history';

import Demos from './components/demo';
import NativeDemos from './components/native-demo';
import Menu from './pages/menu.vue';
import RemoteDebug from './pages/remote-debug.vue';

const routes = [
  {
    path: '/',
    component: Menu,
  },
  {
    path: '/remote-debug',
    component: RemoteDebug,
    name: 'Debug',
  },
  ...Object.keys(Demos).map(demoId => ({
    path: `/demo/${demoId}`,
    name: Demos[demoId].name,
    component: Demos[demoId].component,
  })),
  ...Object.keys(NativeDemos).map(demoId => ({
    path: `/demo/${demoId}`,
    name: NativeDemos[demoId].name,
    component: NativeDemos[demoId].component,
  })),
];

/**
 * inject android hardware back press to execute router operate
 *
 * @param router - router instance
 */
export function injectAndroidHardwareBackPress(router: Router) {
  if (Native.isAndroid()) {
    function hardwareBackPress() {
      const { position } = router.options.history as HippyRouterHistory;
      if (position > 0) {
        // has other history, go back
        router.back();
        return true;
      }
    }

    // Enable hardware back event and listen the hardware back event and redirect to history.
    BackAndroid.addListener(hardwareBackPress);
  }
}

/**
 * create HippyRouter instance
 */
export function createHippyRouter(): Router {
  return createRouter({
    // you can use createMemoryHistory from vue-router for your own
    // like: import { createMemoryHistory } from 'vue-router';
    // or use this custom history mode "createHippyHistory".
    // createHippyHistory add an attr named recordSize to get the history queue size
    history: createHippyHistory(),
    // history: createMemoryHistory(),
    routes,
  });
}
