import { createRouter, createMemoryHistory, type Router } from 'vue-router';

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
  ...Object.keys(Demos).map((demoId) => ({
    path: `/demo/${demoId}`,
    name: Demos[demoId].name,
    component: Demos[demoId].component,
  })),
  ...Object.keys(NativeDemos).map((demoId) => ({
    path: `/demo/${demoId}`,
    name: NativeDemos[demoId].name,
    component: NativeDemos[demoId].component,
  })),
];

/**
 * 创建HippyRouter的实例
 */
export function createHippyRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes,
  });
}
