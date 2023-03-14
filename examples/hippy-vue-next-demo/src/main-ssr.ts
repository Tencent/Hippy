import { insertStyleForSsrNodes } from '@hippy/vue-next-style-parser';
import { insertNativeNodes, IS_IOS } from './ssr-node-ops';

// hippy bundle name
const bundleName = 'Demo';


/**
 * execute async js bundle
 */
function executionAsyncResource() {
  const url = `http://127.0.0.1:38989/${IS_IOS ? 'ios' : 'android'}/index.js`;
  console.log('load url: ', url);

  // import async client js bundle
  return import(url).catch((e) => {
    console.log(`import async js error. url is: ${url}, reason is: ${e}.`);
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
 * execute ssr init logic
 */
function ssr(): void {
  // register hippy instance
  global.Hippy.register.regist(bundleName, async (initParams) => {
    // now hippy init success
    // save hippy native root node id
    const rootViewId = initParams.__instanceId__;
    // send ssr first screen request
    fetch('http://127.0.0.1:3000/getSsrFirstScreenData', {
      mode: 'no-cors', // 2.14.0 or above supports other options(not only method/headers/url/body),
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(getSsrRequestParams()),
    })
      .then((rspJson) => {
        console.log('response:', rspJson);
        if (rspJson.ok && rspJson.status === 200 && rspJson.body) {
          let rsp: {[key: string]: NeedToTyped} = {};
          try {
            rsp = JSON.parse(rspJson.body as unknown as string);
          } catch (e) {}

          console.log('response success: ', rsp);
          if (rsp?.code === 0 && rsp?.data) {
            // init store
            if (rsp?.store) {
              global.__INITIAL_STATE__ = rsp.store;
            }
            // init uniqueId
            global.hippyUniqueId = rsp?.uniqueId ?? 0;
            // prepare to insert style
            const nodeList = rsp.data;
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
            if (nodes) {
              // insert native nodes
              insertNativeNodes(rootViewId, nodes);
              // save ssr nodes to global.hippySSRNodes, hydration will use
              console.log('createSSrNode', nodes);
              global.hippySSRNodes = nodes;
            }
          } else {
            console.log('response decode error:', rspJson);
          }
        } else {
          console.log('response wrong:', rspJson);
        }
        // execute client bundle
        executionAsyncResource();
      })
      .catch((error) => {
        console.log('response error: ', error);
      });
  });
}

// execute ssr logic
ssr();
