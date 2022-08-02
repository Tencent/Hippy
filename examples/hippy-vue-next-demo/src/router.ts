import { createRouter, createMemoryHistory, type Router } from 'vue-router';

import demos from './components/demo';
import nativeDemos from './components/native-demo';
import Menu from './menu.vue';

const routes = [
  {
    path: '/',
    component: Menu,
  },
  ...Object.keys(demos).map((demoId) => ({
    path: `/demo/${demoId}`,
    name: demos[demoId].name,
    component: demos[demoId].component,
  })),
  ...Object.keys(nativeDemos).map((demoId) => ({
    path: `/demo/${demoId}`,
    name: nativeDemos[demoId].name,
    component: nativeDemos[demoId].component,
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
