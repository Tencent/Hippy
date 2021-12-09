# Hippy Debug Server

![Hippy Group](https://img.shields.io/badge/group-Hippy-blue.svg)

The package provide the debug server communicated with native(Android apk or iOS Simulator) and the local web development.

# Introduction
Some of source code is forked from other project. We modify the client implemention so the injected js could run on Hippy.
- The webpack-dev-server folder is forked from [webpack-dev-server](https://github.com/webpack/webpack-dev-server). We modify all platform related implemention to support Hippy, such like `window`, `localtion`, etc. 
- webpack-dev-server/client-src/hot is forked from [webpack](https://github.com/webpack/webpack/tree/main/hot). We change the fallback strategy to [live-reload](./webpack-dev-server/hot/../client-src/utils/apply-reload.js) of Hippy.

## Usage

`@hippy/debug-server` can be install globally, but install to local in most case.

```
npm install -g @hippy/debug-server # Install
cd hippy-react-demo               # Change to a hippy-react project folder.
hippy-debug                       # Start the debug server
```
