const ContextifyModule = internalBinding('ContextifyModule');

global.dynamicLoad = (path, encode, cb) => {
  let requestPath = path;
  const reg = /^(https?:)?\/\/.+$/;
  if (path && !reg.test(path)) {
    requestPath = global.__HIPPYCURDIR__ + path;
    console.log(`global.__HIPPYCURDIR__: ${global.__HIPPYCURDIR__}`);
  }
  console.log(`requestPath:${requestPath}|path = ${path}`);
  ContextifyModule.LoadUntrustedContent(requestPath, encode, cb);
};
