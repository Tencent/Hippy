import { type Router } from 'vue-router';
import { createHippyRouter } from '@hippy/vue-router-next-history';

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
 * create HippyRouter instance
 */
export function createRouter(): Router {
  return createHippyRouter({
    routes,
  });
}
