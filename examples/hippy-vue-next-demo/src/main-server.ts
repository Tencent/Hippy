import {
  createSSRApp,
  type HippyApp,
  type HippyAppOptions,
} from '@hippy/vue-next';
import { type Pinia, createPinia } from 'pinia';
import { type Router } from 'vue-router';


import App from './app.vue';
import { createRouter } from './routes';

export { HIPPY_GLOBAL_STYLE_NAME } from '@hippy/vue-next';
export { renderToAppList, getCurrentUniqueId } from '@hippy/vue-next-server-renderer';

// create hippy ssr app instance
export function getHippySSRInstance(options: HippyAppOptions): {
  app: HippyApp,
  router: Router,
  store: Pinia,
} {
  const app: HippyApp = createSSRApp(App, options);
  // create router
  const router = createRouter();
  // create store
  const store = createPinia();
  app.use(router);
  app.use(store);

  return {
    app,
    router,
    store,
  };
}
