# Hippy Debug Server

![Hippy Group](https://img.shields.io/badge/group-Hippy-blue.svg)

The package provides the debug server communicated with native(Android apk or iOS Simulator) and the local web development.

# Introduction
Some source code is forked from other project. We modified the client implementation, so the injected js code could be run on Hippy.
- The webpack-dev-server folder is forked from [webpack-dev-server](https://github.com/webpack/webpack-dev-server). We modify all platform related implementation to support Hippy, such like `window`, `localtion`, etc. 
- webpack-dev-server/client-src/hot is forked from [webpack](https://github.com/webpack/webpack/tree/main/hot). We changed the fallback strategy to [live-reload](./webpack-dev-server/hot/../client-src/utils/apply-reload.js) of Hippy.

## Usage

`@hippy/debug-server` can be installed globally, but install to local in most case.

```
npm install -g @hippy/debug-server # Install
cd hippy-react-demo               # Change to a hippy-react project folder.
hippy-debug                       # Start the debug server
```

If you use custom cli, you could customize like this:

```javascript
const { webpack, startDebugServer } = require('@hippy/debug-server');

// start hippy dev with HMR supported
webpack(webpackConfig, (err, stats) => {
  // add you custom callback here...
});

// start hippy debug
startDebugServer();
```
