
# hippy-vue 介绍

hippy-vue 其实是基于官方 Vue 2.x 源代码，通过改写 [node-ops](//github.com/Tencent/Hippy/blob/master/framework/js/packages/hippy-vue/src/runtime/node-ops.js) 外挂实现的自定义渲染层，但不仅仅是个到终端的渲染层，还同时实现前端组件到终端的映射、CSS 语法解析，和其它跨端框架不同，它尽力将 Web 端的开发体验带到终端上来，同时保持了对 Web 生态的兼容。

> Vue 3 提供了更好的 [createRenderer()](//github.com/vuejs/vue-next/blob/v3.0.0-alpha.0/packages/runtime-core/src/renderer.ts#L154) 方法可以自定义渲染器，未来就不需要 node-ops 那种外挂的方式了。届时 hippy-vue 也会通过 Typescript 重写。

# 架构图

<img src="//static.res.qq.com/nav/hippydoc/img/hippy-vue.png" alt="hippy-vue 架构图" width="80%"/>
<br />
<br />

# 样式

标准 Hippy 中长度单位是不允许带有单位的，不过为了和浏览器保持兼容，hippy-vue 采取了 1px = 1pt 的方案进行换算，把 CSS 单位中的 px 直接去掉变成了 Hippy 中不带单位的数字。

不过依然存在一些问题，类似 rem、vh 这样的相对单位如果写进 Hippy 业务里了，及时发现避免更重要大的风险可能更重要一些，所以现在只转换 px 单位，别的单位任由终端层报错。

HippyVue 提供了 `beforeLoadStyle` 的 Vue options 勾子函数，可以自定义修改 CSS 样式，如

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

# 转 Web

hippy-vue 项目基于官方 [vue-cli](//cli.vuejs.org/) 构建，再加上基础组件和浏览器兼容，可以直接使用 vue-cli 的方式将 Hippy 工程转为运行在浏览器上。

事实上，hippy-vue 更愿意去做一个 Vue 的 [alias](//github.com/Tencent/Hippy/blob/master/framework/js/examples/hippy-vue-demo/scripts/hippy-webpack.dev.js#L89)，让开发者无感知地直接使用 hippy-vue 实现对终端的输出。

hippy-vue 基本兼容 Vue 非界面相关的生态，例如 [VueX](//vuex.vuejs.org/)，[vue-router](//router.vuejs.org/) 经过小幅度改动后也以接口完全相同的 [hippy-vue-router](//www.npmjs.com/package/hippy-vue-router) 提供给开发者。界面相关生态，只要迁移到 Hippy 所使用的 Flex 布局后理论上也可以使用。

但 hippy-vue 还提供了一个 [@hippy/vue-native-components](//www.npmjs.com/package/hippy-vue-native-components) 包，通过[中间件形式](//github.com/Tencent/Hippy/blob/master/framework/js/examples/hippy-vue-demo/src/main-native.js#L15)提供了对终端一些其它组件的扩展，这个目前在 Web 端还不存在，未来会开发一个 `@hippy/vue-web-components` 提供 Web 的方式提供对这些组件的支持，这仍需要时间。

# 尚未实现的部分

hippy-vue 仍在开发中，目前主要有以下几个需要支持的地方，也需要大家注意一下。

## CSS 更多选择器和 scope 的支持

这部分需要更多时间，目前已经实现了基本的 ID、Class、Tag 选择器，而且可以支持基本的嵌套关系，其余选择器还未支持。

## CSS 3 动画

因为终端和浏览器不同，终端的动画在没有关联组件时也会自动运行，所以不能将它声明在 CSS 中脱离组件的生命周期，目前封装了一个 [animation](hippy-vue/native-components.md?id=animation) 组件在 `@hippy/vue-native-components` 中，将动画和组件的声明周期绑定在一起。

未来会把 Vue 的 [transtion](https://vuejs.org/v2/api/#transition) 移植过来，还请静候。

## 未完善的组件和模块

Hippy-Vue 核心组件和模块，与 Hippy-React 是使用相同的终端能力。若 Hippy-Vue 没有列举的组件、模块，可自行先封装。
