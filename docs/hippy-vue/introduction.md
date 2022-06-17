
# hippy-vue 介绍

hippy-vue 基于官方 Vue 2.x 源代码，通过改写 [node-ops](//github.com/Tencent/Hippy/blob/master/packages/hippy-vue/src/runtime/node-ops.js) 外挂实现自定义渲染层，但不仅仅是个到终端的渲染层，还同时实现前端组件到终端的映射、CSS 语法解析。和其它跨端框架不同，它尽力将 Web 端的开发体验带到终端上来，同时保持了对 Web 生态的兼容。

> Vue 3 提供了更好的 [createRenderer()](//github.com/vuejs/vue-next/blob/v3.0.0-alpha.0/packages/runtime-core/src/renderer.ts#L154) 方法可以自定义渲染器，未来就不需要 node-ops 那种外挂的方式了。届时 hippy-vue 也会通过 Typescript 重写。

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

# 样式

标准 Hippy 中长度单位是不允许带有单位，不过为了和浏览器保持兼容，hippy-vue 采取了 1px = 1pt 的方案进行换算，把 CSS 单位中的 px 直接去掉变成了 Hippy 中不带单位的数字。

HippyVue 提供了 `beforeLoadStyle` 的 Vue options 勾子函数，供开发者做定制化修改 CSS 样式，如

```js
    new Vue({
      // ...
      beforeLoadStyle(decl) {
         let { type, property, value } = decl;
         console.log('property|value', property, value); // => height, 1rem
          // 比如可以对 rem 单位进行处理
         if(typeof value === 'string' && /rem$/.test(value)) {
             // ...value = xxx
         } 
         return { ...decl, value}
      }
    });
```

# CSS 选择器和 scope 的支持

目前已经实现了基本的 `ID`、`Class`、`Tag` 选择器，而且可以支持基本的嵌套关系，其余选择器和 scoped 还未支持。

# 转 Web

未来 Hippy 会采用 `WebRenderer` 方案，增加基于公共通信协议的转换层，业务开发者可以使用同一套 Hippy 语法开发的业务代码，映射成 JS 实现的组件和模块，上层无论使用 React，Vue 或者其他第三方框架，都可以实现兼容，敬请期待。
