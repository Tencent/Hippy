const express = require('express');
const { HIPPY_GLOBAL_STYLE_NAME } = require('@hippy/vue-next');

/**
 * get ssr style content
 *
 * @param globalStyleName - hippy global style name
 */
function getSsrStyleContent(globalStyleName): NeedToTyped[] {
  if (global.ssrStyleContentList) {
    return global.ssrStyleContentList;
  }
  // cache global style sheet, then non first request could return directly, unnecessary to
  // serialize again
  global.ssrStyleContentList = JSON.stringify(global[globalStyleName]);

  return global.ssrStyleContentList;
}

// server listen port
const serverPort = 3000;
// init http server
const server = express();
// use json middleware
server.use(express.json());

// listen request
server.all('/getSsrFirstScreenData', (req, rsp) => {
  // get hippy ssr node list and other const
  const { render } = require('./main-server');
  render('/', {
    appName: 'Demo',
    option: {
      iPhone: {
        statusBar: {
          backgroundColor: 4283416717,
        },
      },
    },
    context: req.body,
  }).then(({
    list, modules, store, uniqueId,
  }) => {
    console.log('matched modules: ', modules);
    // send response
    rsp.json({
      code: 0,
      data: list,
      store: store.state.value,
      uniqueId,
      styleContent: getSsrStyleContent(HIPPY_GLOBAL_STYLE_NAME),
    });
  })
    .catch((error) => {
      rsp.json({
        code: -1,
        message: `get ssr data error: ${JSON.stringify(error)}`,
      });
    });
});

// start server
server.listen(serverPort);
console.log(`Server listen on :${serverPort}`);
