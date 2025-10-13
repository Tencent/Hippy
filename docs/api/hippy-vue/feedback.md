# Hippy-Vue 常见反馈

## 1. 如何开始一个hippy vue 项目

可以先参考我们的文档 和 demo

https://hippyjs.org/#/hippy-vue/introduction
https://github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo

## 2. Hippy Vue中span的换行符会被 trim

3.x hippy-vue的版本，Hippy默认开启了 Vue.config.trimWhitespace 这个参数。而 hippy-vue 2.x的版本是不开的, 这个也是为了和未来 vue3 版本的规划对齐
https://github.com/vuejs/core/pull/1600

方案建议：
a.  在 hippy.js 文件加一句 Vue.config.trimWhitespace = false，这样配置就和安卓版本完全对齐了。这个参数会对产物有一些影响，也可以让你们前端同事再重新评估一下。

b. 因为现在 hippy 没有提供换行组件 br标签 或者 white-space 的 css，如果需要换行，则不适用span，而是重新创建一个 text文本组件

## 3. hippy-vue-next-style-parser，这个包的作用

这个包用于处理 vue-next 的 css parse 和 match 逻辑

## 4. Hippy 是否支持 Vite 构建

已支持，目前只有腾讯内部版，腾讯业务可联系 端框架小助手


