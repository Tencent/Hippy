
# hippy-vue 介绍

hippy-vue 基于官方 Vue 2.x 源代码，通过改写 [node-ops](//github.com/Tencent/Hippy/blob/master/packages/hippy-vue/src/runtime/node-ops.js) 外挂实现自定义渲染层，但不仅仅是个到终端的渲染层，还同时实现前端组件到终端的映射、CSS 语法解析。和其它跨端框架不同，它尽力将 Web 端的开发体验带到终端上来，同时保持了对 Web 生态的兼容。

# 架构图

<img src="assets/img/hippy-vue.png" alt="hippy-vue 架构图" width="80%"/>
<br />
<br />

# 初始化

```javascript
import Vue from '@hippy/vue';
import App from './app.vue';
const app = new Vue({
  // 终端指定的 App 名称
  appName: 'Demo',
  rootView: '#root',
  // 渲染入口
  render: h => h(App),
});

/**
  * $start 是 Hippy 启动完以后触发的回调
  * @param {Function} callback - 引擎加载成功后回调函数
  *  @param {Object} instance - 业务vue实例对象
  *  @param {Object} initialProps - 终端给前端的初始化参数，终端可以将一些启动需要的自定义属性放到入口文件里
  */
app.$start((instance, initialProps) => {
  console.log('instance', instance, 'initialProps', initialProps);
});

// 如果需要在首个 View 渲染时就获取到 initialProps，可以通过直接读取 app.$options.$superProps 

```
