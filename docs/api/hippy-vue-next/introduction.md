
# hippy-vue-next 介绍

@hippy/vue-next 基于 @hippy/vue 的已有逻辑。通过 Vue3.x 提供的 [createRenderer()](//github.com/vuejs/vue-next/blob/v3.0.0-alpha.0/packages/runtime-core/src/renderer.ts#L154)来实现自定义渲染相关逻辑。相比@hippy/vue，@hippy/vue-next有如下几点优势：

**性能更好：**得益于Vue3.x的性能提升，使用@hippy/vue-next在性能方便相比@hippy/vue有不小的提升

**实现优雅：**无需侵入 Vue 代码直接通过外部库的方式引用 Vue，因此可以及时跟随 Vue 生态，享受 Vue 相关生态带来的好处

**使用方便：**在实现上与 @hippy/vue 基本一致，用户@hippy/vue的相关代码只需要做不大的改动即可升级

**开发效率更高：** @hippy/vue-next 全部代码采用 typescript 进行编写，可以拥有更好的程序健壮性和类型提示，并且 @hippy/vue-next 在整体架构上也进行了一定程度的优化。

---

# 架构图

<img src="assets/img/hippy-vue-next-arch-cn.png" alt="hippy-vue-next 架构图" width="80%"/>
<br />
<br />

# 初始化

```javascript
// app.ts
import { defineComponent, ref } from 'vue';
import { type HippyApp, createApp } from '@hippy/vue-next';

// 创建 Hippy App 实例，需要注意 Vue3.x 使用 Typescript，因此需要使用 defineComponent 将组件对象进行包裹
const app: HippyApp = createApp(defineComponent({
  setup() {
    const counter = ref(0);
    return {
      counter,
    }
  }
}), {
  // Hippy App Name 必传，示例项目可以使用 Demo
  appName: 'Demo',
});

// 启动 Hippy App
app.$start().then(({ superProps, rootViewId }) => {
  // superProps 是 Native 传入的初始化参数，如果需要做路由预处理等操作，则可以让 Native 将对应参数传入
  // rootViewId 是 Native 当前 Hippy 实例所挂载的 Native 的根节点的 id
  // mount app，完成渲染上屏 
  app.mount('#mount');
})
```

如果要使用 Vue-Router，则需要使用另外的初始化逻辑

```javascript
// Vue + Vue Router

// app.vue
<template>
  <div><span>{{ msg }}</span></div>
  <router-view />
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const msg: string = 'This is the Root Page';
    return {
      msg,
    };
  },
});
</script>

// index.vue
<template>
  <div><span>{{ msg }}</span></div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const msg: string = 'This is the Index Page';
    return {
      msg,
    };
  },
});
</script>

// app.ts
import { defineComponent, ref } from 'vue';
import { type HippyApp, createApp } from '@hippy/vue-next';
import { createHippyRouter } from '@hippy/vue-router-next-history';
import { type Router } from 'vue-router';
import App from 'app.vue';

// 创建 Hippy App 实例，需要注意 Vue3.x 使用 Typescript，因此需要使用 defineComponent 将组件对象进行包裹
const app: HippyApp = createApp(App, {
  // Hippy App Name，必传，示例项目可以使用 Demo
  appName: 'Demo',
});

// 路由列表
const routes = [
  {
    path: '/',
    component: Index,
  },
];

// 创建路由对象
const router: Router = createHippyRouter({
  routes,
});

// 使用路由
app.use(router);

// 启动 Hippy App
app.$start().then(({ superProps, rootViewId }) => {
  // superProps 是 Native 传入的初始化参数，如果需要做路由预处理等操作，则可以让 Native 将对应参数传入
  // rootViewId 是 Native 当前 Hippy 实例所挂载的 Native 的跟节点的 id

  // 因为现在使用的是vue-router的memory history，因此需要手动推送初始位置，否则router将无法ready
  // 浏览器上则是由vue-router根据location.href去匹配，默认推送根路径'/'，如果想要实现类似浏览器中默认跳转到指定页面，可以让终端同学将初始化的 path
  // 从 superProps 中传入，然后再通过 path 的值去进行 router.push({ path: 'other path' }) 等操作
  router.push('/');
  
  // mount app，完成渲染上屏 
  app.mount('#mount');
})
```

> @hippy/vue-router-next-history 对 vue-router 的 history 模式做了处理，为 Android 加上了触发物理返回键时优先回退历史记录的逻辑

如果不需要这个逻辑，可以直接使用原生 vue-router 来实现路由：

```javascript
import { createRouter, createMemoryHistory, type Router } from 'vue-router';

// 路由列表
const routes = [
  {
    path: '/',
    component: Index,
  },
]; 

const router: Router = createRouter({
  history: createMemoryHistory(),
  routes,
});
```

# 注意事项 

目前 `@hippy/vue-next` 与 `@hippy/vue` 功能上基本对齐，不过在 API 方面与 @hippy/vue 有一些区别，统一在这里说明：

- v-model 指令

  因为 Vue3.x 中内置指令的实现采用的是编译时插入代码的方式，目前 v-model 指令暂不支持，这里我们可以先用如下方法来实现对应功能

  ```javascript
  // 具体的可以参考 demo 中的 demo-input.vue 中的示例
  <template>
    <input type="text" ref="inputRef" :value="textValue" @change="textValue = $event.value" />
    <div>
      <span>Input Value：{{ textValue }}</span>
    </div>
  </template>
  <script lang="ts">
  import { defineComponent, ref } from '@vue/runtime-core';
  
  export default defineComponent({
    setup() {
      const inputRef = ref(null);
      const textValue = ref('This is default value.');
      return {
        inputRef,
        textValue,
      };
    },
  }); 
  </script>
  ```

  v-model指令待我们后续开发支持

- Vue3.x 变量 Proxy 问题

  因为 3.x 的响应式是通过 Proxy 代理对象来实现的，所以我们得到的对象其实是 Proxy 的实例而非原始对象，因此调用终端接口时需要注意，终端并不认识 Proxy 对象，需要使用 Vue 提供的 [`toRaw`](https://cn.vuejs.org/api/reactivity-advanced.html#toraw) 方法来拿到原始的对象并传递给终端接口。

- Native 接口和自定义组件的类型提示

  @hippy/vue-next 提供了 Native 模块接口的 Typescript 类型提示，如果有业务自定义的 Native 接口，也可以采用类似的方式进行扩展

    ```javascript
    declare module '@hippy/vue-next' {
      export interface NativeInterfaceMap {
        // 用户自定义的 Native 接口，接下来你可以在调用 Native.callNative，Native.callNativeWithPromise 时拥有类型提示了
      }
    }
    ```

  @hippy/vue-next 也参考 `lib.dom.d.ts` 的事件声明提供了事件类型，具体可以参考 hippy-event.ts 文件。如果需要在内置的事件上进行扩展，可以采用类似方式

    ```javascript
      declare module '@hippy/vue-next' {
        export interface HippyEvent {
          testProp: number;
        }
      }
    ```

  在使用 `registerElement` 去注册组件的时候，利用了 typescript 的 `type narrowing`，在 switch case 中提供了准确的类型提示。如果在业务注册自定义组件的时候也需要类型提示，可以采用如下方式:

    ```javascript
      export interface HippyGlobalEventHandlersEventMap {
        // extend new event name and related event interface
        onTest: CustomEvent;
        // extend existing event interface
        onAnotherTest: HippyEvent;
      }
    ```

  更多信息可以参考 demo 里的 [extend.ts](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-next-demo/src/extend.ts).

- dialog 差异

  `<dialog>` 组件的第一个子元素不能设置  `{ position: absolute }` 样式，如果想将 `<dialog>` 内容铺满全屏，可以给第一个子元素设置 `{ flex: 1 }` 样式或者显式设置 width 和 height 数值。这与 Hippy3.0 的逻辑保持一致。
