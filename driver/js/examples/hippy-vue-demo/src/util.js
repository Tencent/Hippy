let cachedApp;

function setApp(app) {
  cachedApp = app;
}

function getApp() {
  return cachedApp;
}

export {
  setApp,
  getApp,
};
