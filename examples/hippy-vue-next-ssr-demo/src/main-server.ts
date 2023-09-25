import {
  createSSRApp,
  type HippyApp,
  type HippyAppOptions,
  HIPPY_GLOBAL_STYLE_NAME,
} from '@hippy/vue-next';
import { type SsrNode, renderToHippyList, getCurrentUniqueId, type SsrRequestContext } from '@hippy/vue-next-server-renderer';
import { type Pinia, createPinia } from 'pinia';
import App from './app.vue';
import { createRouter } from './routes';

export { HIPPY_GLOBAL_STYLE_NAME };

/**
 * render hippy ssr node list
 *
 * @param url - request url
 * @param hippyOptions - hippy init options
 * @param context - request context
 */
export async function render(url: string, hippyOptions: HippyAppOptions, context: SsrRequestContext = {}): Promise<{
  list: SsrNode[] | null,
  modules: Set<string>,
  store: Pinia,
  uniqueId: number,
}> {
  const app: HippyApp = createSSRApp(App, hippyOptions);
  // create router
  const router = createRouter();
  // create store
  const store = createPinia();
  app.use(router);
  app.use(store);

  // push request url into router(ps: include uri and url params, for example, indexPage?a=1&b=2).
  await router.push(url);
  // wait router ready
  await router.isReady();
  // ssr context, vue will append some extra data when render finished. ex. modules means this request
  // matched modules
  const ssrContext = {
    rootContainer: '#root',
    modules: new Set(),
    ssrOptions: hippyOptions,
    context,
  };
  // get ssr render hippy node list
  const hippyNodeList = await renderToHippyList(app, ssrContext);
  return {
    list: hippyNodeList,
    // modules
    modules: ssrContext.modules as Set<string>,
    store,
    uniqueId: getCurrentUniqueId(app),
  };
}
