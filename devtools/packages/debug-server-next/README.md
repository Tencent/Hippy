# Introduction

Hippy debug server used to provide debug service, and support the following feature, just like debug H5:

- [x] use chrome debug Android & iOS device, include simulator
- [x] support HMR
- [x] support vue-devtools
- [x] support remote debug

# How to start

```bash
npm i @hippy/debug-server-next

# start compile frontend, will auto launch `hippy-debug` if debug server not started
hippy-dev -c <path_to_webpack_config>

# start debug server
hippy-debug

# view all start options
hippy-debug -h
```

If you use custom cli, you could customize like this:

```javascript
const { webpack, startDebugServer } = require('@hippy/debug-server-next');

// start hippy dev with HMR supported
webpack(webpackConfig, (err, stats) => {
  // add you custom callback here...
});

// start hippy debug
startDebugServer();
```

# Private Deployment
If you want to use **remote debug**, you could follow [this doc](./doc/deploy.md) to deploy your debug server.
