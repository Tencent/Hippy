const ContextifyModule = internalBinding('ContextifyModule');

global.dynamicLoad = (path, encode, cb) => {
  let requestPath = path || '';
  const isSchema = ['https://', 'http://', '//'].some(schema => requestPath.indexOf(schema) === 0);
  if (!isSchema) {
    requestPath = global.__HIPPYCURDIR__ + path;
  }
  ContextifyModule.LoadUntrustedContent(requestPath, encode, cb);
};
