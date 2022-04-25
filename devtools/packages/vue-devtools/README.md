# Introduction

This repo is fork from [vue-devtools@6.1.4](https://github.com/vuejs/devtools/tree/v6.1.4) to support hippy vue.

[Custom the devtools message channel](./src/views/main.ts), so this devtools tab could communicate with devtools backend in Hippy js runtime.

# How to start
```bash
# dev mode
npm run dev
# prod mode
npm run build
# the compile result will auto serve by debug-server-next in debug page, 
# open debug page such as `localhost:8888/front_end/inspector.html?env=TDFCore`
```
