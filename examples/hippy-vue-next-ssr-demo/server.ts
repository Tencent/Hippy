import express from 'express';
import { render, HIPPY_GLOBAL_STYLE_NAME } from 'src/main-server';

interface MinifiedStyleDeclaration {
  [key: number]: number | string;
}

/**
 * minify css content
 */
function minifyStyleContent(rawStyleContent): NeedToTyped[] | MinifiedStyleDeclaration[] {
  if (rawStyleContent?.length && Array.isArray(rawStyleContent)) {
    const minifiedStyle: MinifiedStyleDeclaration[] = [];
    rawStyleContent.forEach((styleContent) => {
      // minified style is array, 0 index is selectors, 1 index is declaration, no hash
      minifiedStyle.push([
        styleContent.selectors,
        // minify declarations
        styleContent.declarations.map(declaration => [declaration.property, declaration.value]),
      ]);
    });
    return minifiedStyle;
  }

  return rawStyleContent;
}

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
  global.ssrStyleContentList = JSON.stringify(minifyStyleContent(global[globalStyleName]));

  return global.ssrStyleContentList;
}

// server listen port
const serverPort = 8080;
// init http server
const server = express();
// use json middleware
server.use(express.json());

// listen request
server.all('/getSsrFirstScreenData', (req, rsp) => {
  // get hippy ssr node list and other const
  render('/', {
    appName: 'Demo',
  }, req.body).then(({
    list,
    store,
    uniqueId,
  }) => {
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
console.log(`Server listen on:${serverPort}`);
