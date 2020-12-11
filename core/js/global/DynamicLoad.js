const ContextifyModule = internalBinding('ContextifyModule');

global.dynamicLoad = (path, encode, cb) => {
  console.log(`global.__HIPPYCURDIR__ = ${global.__HIPPYCURDIR__},
    encode = ${encode}, path = ${path}`);
  ContextifyModule.LoadUriContent(global.__HIPPYCURDIR__ + path, encode, cb);
};
