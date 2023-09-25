import { type StyleNode, insertStyleForSsrNodes } from '@hippy/vue-next-style-parser';
import type { SsrNode } from '@hippy/vue-next-server-renderer';
import { renderNativeNodesByCache, renderSsrNodes, deleteNativeNodes, SSR_UNIQUE_ID_KEY } from './ssr-node-ops';
import { IS_IOS, isDev } from './env';
import { ssrEntry } from './webpack-plugin';

// hippy bundle name
const bundleName = 'Demo';

/**
 * execute async js bundle
 */
async function executionAsyncResource() {
  const platform = IS_IOS ? 'ios' : 'android';
  // this is async js name, write in client.base.js config file for production
  // in client.dev.js config file for development
  const fileName = `home.${isDev ? 'bundle' : `${platform}.js`}`;
  const url = `${isDev ? `http://${process.env.HOST}:${process.env.PORT}/` : ''}${fileName}`;
  // @ts-ignore
  global.dynamicLoad(url, (ret) => {
    if (ret) {
      console.log('dynamic load error:', ret);
    }
  });
}

/**
 * generate ssr request params
 */
function getSsrRequestParams() {
  const HippyDevice = global.Hippy.device;
  return {
    isIOS: HippyDevice?.platform?.OS === 'ios',
    dimensions: {
      screen: HippyDevice.screen,
    },
  };
}

/**
 * handle ssr render exception
 *
 * @param rootViewId - native root id
 * @param renderedNodes - rendered native node list
 * @param cachedUniqueId - cached uniqueId
 */
function errorHandle(
  rootViewId: number,
  renderedNodes: SsrNode[],
  cachedUniqueId: number,
) {
  // if use cached noe list render, should delete
  if (renderedNodes?.length) {
    deleteNativeNodes(rootViewId, renderedNodes);
  }
  // clear uniqueId
  global[SSR_UNIQUE_ID_KEY] = cachedUniqueId ?? 0;
  // clear store
  global.__INITIAL_STATE__ = undefined;
  // clear global ssr node list
  global.hippySSRNodes = undefined;
}

/**
 * execute ssr init logic
 */
function ssr(): void {
  // register hippy instance
  global.Hippy.register.regist(bundleName, async (initParams) => {
    // now hippy init success, we can call native api now
    // save hippy native root node id
    const rootViewId = initParams.__instanceId__;
    const pageCacheKey = `${bundleName}_index`;
    // first, use cache nodes render
    const [cacheNodes, backNodes, cacheUniqueId] = await renderNativeNodesByCache(rootViewId, pageCacheKey);
    console.log('cache', cacheNodes, backNodes, cacheUniqueId);
    // second, send ssr first screen request and use server node list insert/update
    fetch('http://localhost:8080/getSsrFirstScreenData', {
      mode: 'no-cors', // 2.14.0 or above supports other options(not only method/headers/url/body),
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(getSsrRequestParams()),
    })
      .then(async (rspJson) => {
        if (rspJson.ok && rspJson.status === 200 && rspJson.body) {
          let rsp: {[key: string]: NeedToTyped} = {};
          try {
            rsp = JSON.parse(rspJson.body as unknown as string);
          } catch (e) {}
          if (rsp?.code === 0 && rsp?.data) {
            // replace store
            if (rsp?.store) {
              global.__INITIAL_STATE__ = rsp.store ?? {};
            }
            // prepare to insert style
            const nodeList = rsp.data as StyleNode[];
            if (nodeList.length) {
              // set parent id for root node
              nodeList[0].pId = rootViewId;
              // filter all comment node, comment node unnecessary to insert style
              const commentList = nodeList.filter(v => v.name === 'comment');
              let nodes;
              try {
                // insert hippy style for non comment nodes
                // after insert style, concat comment nodes
                nodes = insertStyleForSsrNodes(
                  nodeList.filter(v => v.name !== 'comment'),
                  JSON.parse(rsp?.styleContent ?? ''),
                ).concat(commentList);
              } catch (e) {}
              // insert nodes to native
              if (nodes?.length) {
                const result = await renderSsrNodes(
                  rootViewId,
                  nodes,
                  rsp?.uniqueId ?? 0,
                  true,
                  pageCacheKey,
                  cacheNodes,
                  backNodes,
                  cacheUniqueId,
                );
                if (!result) {
                  // exception happen, clear all cached status
                  errorHandle(rootViewId, cacheNodes, cacheUniqueId);
                }
              }
            }
          } else {
            console.log('response decode error:', rspJson);
          }
        } else {
          console.log('response wrong:', rspJson);
        }
        // execute client bundle
        await executionAsyncResource();
      })
      .catch((error) => {
        console.log('response error: ', error);
        // execute client bundle
        executionAsyncResource();
      });
  });
}

// execute ssr logic
ssrEntry('Demo', ssr);
